from langgraph.graph import StateGraph, START, END

from app.agents.state import AnalysisState
from app.services.csv_service import CSVService
from app.services.analysis_service import AnalysisService
from app.services.anomalies_service import AnomalyService

from app.agents.data_quality_agent import DataQualityAgent
from app.agents.insights_agent import InsightsAgent
from app.agents.maintenance_agent import MaintenanceAgent
from app.agents.risk_agent import RiskAgent
from app.agents.report_agent import ReportAgent




csv_service = CSVService()
analysis_service = AnalysisService()
anomaly_service = AnomalyService()
data_quality_agent = DataQualityAgent()
insights_agent = InsightsAgent()
maintenance_agent = MaintenanceAgent()
risk_agent = RiskAgent()
report_agent = ReportAgent()


def load_csv_node(
    state: AnalysisState
):
    dataframe = csv_service.load_csv(
        state["file_path"]
    )

    return {
        "dataframe": dataframe
    }


def data_quality_node(
    state: AnalysisState
):
    return data_quality_agent.run(
        state
    )


def analyze_node(
    state: AnalysisState
):
    dataframe = state["dataframe"]

    summary = analysis_service.generate_summary(
        dataframe
    )

    return {
        "summary": summary
    }

def anomaly_node(
    state: AnalysisState
):
    dataframe = state["dataframe"]

    anomalies = anomaly_service.detect_anomalies(
        dataframe
    )

    return {
        "anomalies": anomalies
    }



def insight_node(
    state: AnalysisState
):
    return insights_agent.run(
        state
    )



def recommendation_node(
    state: AnalysisState
):

    recommendations = (
        maintenance_agent.run(
            summary=state["summary"],
            anomalies=state["anomalies"],
            insights=state["insights"]
        )
    )

    return {
        "recommendations": recommendations
    }



def should_generate_recommendations(
    state: AnalysisState
):
    anomalies = state["anomalies"]

    has_anomalies = any(
        len(values) > 0
        for values in anomalies.values()
    )

    if has_anomalies:
        return "generate_recommendations"

    return END


def risk_node(
    state: AnalysisState                                      # Risk Node
): 

    risk_level = (
        risk_agent.run(
            anomalies=state["anomalies"],
            recommendations=state["recommendations"]
        )
    )

    return {
        "risk_level": risk_level
    }

def report_node(
    state: AnalysisState
):

    executive_summary = (
        report_agent.run(
            summary=state["summary"],
            insights=state["insights"],
            recommendations=state["recommendations"],
            risk_level=state["risk_level"]
        )
    )

    return {
        "executive_summary": executive_summary
    }



graph_builder = StateGraph(
    AnalysisState
)

graph_builder.add_node(
    "load_csv",
    load_csv_node
)

graph_builder.add_node(
    "check_data_quality",
    data_quality_node
)

graph_builder.add_node(
    "analyze",
    analyze_node
)

graph_builder.add_node(
    "detect_anomalies",
    anomaly_node
)

graph_builder.add_node(
    "generate_insights",
    insight_node
)

graph_builder.add_node(
    "generate_recommendations",
    recommendation_node
)

graph_builder.add_node(
    "assess_risk",
    risk_node
)

graph_builder.add_node(
    "generate_report",
    report_node
)



graph_builder.add_edge(
    START,
    "load_csv"
)

graph_builder.add_edge(
    "load_csv",
    "check_data_quality"
)

graph_builder.add_edge(
    "check_data_quality",
    "analyze"
)

graph_builder.add_edge(
    "analyze",
    "detect_anomalies"
)

graph_builder.add_edge(
    "detect_anomalies",
    "generate_insights"
)

graph_builder.add_conditional_edges(
    "generate_insights",
    should_generate_recommendations
)

graph_builder.add_edge(
    "generate_recommendations",
    "assess_risk"
)

graph_builder.add_edge(
    "generate_recommendations",
    "assess_risk"
)

graph_builder.add_edge(
    "assess_risk",
    "generate_report"
)

graph_builder.add_edge(
    "generate_report",
    END
)




workflow = graph_builder.compile()
