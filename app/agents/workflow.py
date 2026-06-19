from langgraph.graph import StateGraph, START, END

from app.agents.state import AnalysisState
from app.services.csv_service import CSVService
from app.services.analysis_service import AnalysisService
from app.services.anomalies_service import AnomalyService
from app.services.insight_service import InsightService
from app.services.recommendation_service import RecommendationService




csv_service = CSVService()
analysis_service = AnalysisService()
anomaly_service = AnomalyService()
insight_service = InsightService()
recommendation_service = RecommendationService()


def analyze_node(
    state: AnalysisState
):
    dataframe = csv_service.load_csv(
        state["file_path"]
    )

    summary = analysis_service.generate_summary(
        dataframe
    )

    return {
        "summary": summary
    }

def anomaly_node(
    state: AnalysisState
):
    dataframe = csv_service.load_csv(
        state["file_path"]
    )

    anomalies = anomaly_service.detect_anomalies(
        dataframe
    )

    return {
        "anomalies": anomalies
    }



def insight_node(
    state: AnalysisState
):
    insights = insight_service.generate_insights(
        state["anomalies"]
    )

    return {
        "insights": insights
    }



def recommendation_node(
    state: AnalysisState
):
    recommendations = (
        recommendation_service
        .generate_recommendations(
            state["anomalies"]
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



graph_builder = StateGraph(
    AnalysisState
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



graph_builder.add_edge(
    START,
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
    END
)


workflow = graph_builder.compile()