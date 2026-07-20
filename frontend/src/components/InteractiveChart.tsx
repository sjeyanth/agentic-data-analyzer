import { useMemo, useState } from "react";
import type { ChartRow } from "../types/chart";


import {
    ResponsiveContainer,
    LineChart,
    Line,
    BarChart,
    Bar,
    ScatterChart,
    Scatter,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
} from "recharts";


interface InteractiveChartProps {
    data: ChartRow[];
}

type FieldKind = "continuous" | "discrete" | "temporal" | "unknown";

type ChartType = "line" | "bar" | "scatter";

interface ChartValidationResult {
    isValid: boolean;
    message: string;
}

interface ChartValidationRule {
    isValid: (
        xAxisKind: FieldKind,
        yAxisKind: FieldKind
    ) => boolean;
    invalidMessage: string;
}

const chartValidationRules: Record<ChartType, ChartValidationRule> = {
    line: {
        isValid: (_xAxisKind, yAxisKind) => yAxisKind === "continuous",
        invalidMessage: "Line charts require a continuous Y-axis.",
    },
    bar: {
        isValid: (xAxisKind, yAxisKind) =>
            (
                xAxisKind === "discrete" ||
                xAxisKind === "temporal"
            ) && yAxisKind === "continuous",
        invalidMessage: "Bar charts require a categorical or temporal X-axis and a continuous Y-axis.",
    },
    scatter: {
        isValid: (xAxisKind, yAxisKind) =>
            (
                xAxisKind === "continuous" &&
                yAxisKind === "continuous"
            ) ||
            (
                xAxisKind === "temporal" &&
                yAxisKind === "continuous"
            ) ||
            (
                xAxisKind === "continuous" &&
                yAxisKind === "temporal"
            ),
        invalidMessage: "Scatter charts require two continuous variables or one continuous variable paired with a temporal axis.",
    },
};

function getNextAvailableColumn(
    columns: string[],
    excludedColumn: string,
    preferredColumn?: string
): string {
    if (
        preferredColumn &&
        preferredColumn !== excludedColumn &&
        columns.includes(preferredColumn)
    ) {
        return preferredColumn;
    }

    return columns.find((column) => column !== excludedColumn) ?? "";
}

function isEmptyValue(
    value: unknown
): boolean {
    return value === null || value === undefined || value === "";
}

function hasTemporalFieldName(
    field: string
): boolean {
    return /(^|_)(date|time|timestamp|datetime|created_at|updated_at|event_time)($|_)/i.test(
        field
    );
}

function hasDiscreteFieldName(
    field: string
): boolean {
    return /(^|_)(id|code|type|status|category|class|group|name|city|country|department)($|_)/i.test(
        field
    );
}

function isContinuous(
    value: unknown
): boolean {
    if (typeof value === "number") {
        return Number.isFinite(value);
    }

    if (typeof value !== "string" || value.trim() === "") {
        return false;
    }

    return Number.isFinite(
        Number(value)
    );
}

function isTemporal(
    value: unknown
): boolean {
    if (typeof value !== "string" || value.trim() === "") {
        return false;
    }

    const timestamp = Date.parse(
        value
    );

    return Number.isFinite(
        timestamp
    ) && Number.isNaN(
        Number(value)
    );
}

function isDiscrete(
    value: unknown
): boolean {
    return (
        typeof value === "string" ||
        typeof value === "boolean"
    ) && !isTemporal(value) && !isContinuous(value);
}

function getFieldKind(
    data: ChartRow[],
    field: string
): FieldKind {
    const values = data
        .map((row) => row[field])
        .filter((value) => !isEmptyValue(value));

    if (values.length === 0) {
        return "unknown";
    }

    if (
        hasTemporalFieldName(field) ||
        values.every(isTemporal)
    ) {
        return "temporal";
    }

    if (
        hasDiscreteFieldName(field) ||
        values.every(isDiscrete)
    ) {
        return "discrete";
    }

    if (values.every(isContinuous)) {
        return "continuous";
    }

    if (values.some(isDiscrete)) {
        return "discrete";
    }

    return "unknown";
}

function isChartCombinationValid(
    chartType: ChartType,
    xAxisKind: FieldKind,
    yAxisKind: FieldKind
): ChartValidationResult {
    const rule = chartValidationRules[chartType];

    if (xAxisKind === "unknown" || yAxisKind === "unknown") {
        return {
            isValid: false,
            message: "The selected fields do not contain enough usable values to determine a visualization type.",
        };
    }

    if (rule.isValid(xAxisKind, yAxisKind)) {
        return {
            isValid: true,
            message: "",
        };
    }

    return {
        isValid: false,
        message: rule.invalidMessage,
    };
}

export function InteractiveChart({
    data,
}: InteractiveChartProps) {

    const columns = useMemo(() => {

        if (data.length === 0) {
            return [];
        }

        return Object.keys(data[0]);

    }, [data]);

    const [selectedXAxisPreference, setSelectedXAxisPreference] = useState("");

    const [selectedYAxisPreference, setSelectedYAxisPreference] = useState("");

    const [chartType, setChartType] = useState<ChartType>("line");


    const selectedXAxis = getNextAvailableColumn(
        columns,
        selectedYAxisPreference,
        selectedXAxisPreference
    );

    const selectedYAxis = getNextAvailableColumn(
        columns,
        selectedXAxis,
        selectedYAxisPreference
    );

    const xAxisOptions = columns.filter(
        (column) => column !== selectedYAxis
    );

    const yAxisOptions = columns.filter(
        (column) => column !== selectedXAxis
    );

    const visualizationLabel =
        chartType.charAt(0).toUpperCase() + chartType.slice(1);

    const xAxisKind = getFieldKind(
        data,
        selectedXAxis
    );

    const yAxisKind = getFieldKind(
        data,
        selectedYAxis
    );

    const chartValidation = isChartCombinationValid(
        chartType,
        xAxisKind,
        yAxisKind
    );

    function handleXAxisChange(
        value: string
    ) {
        setSelectedXAxisPreference(
            value
        );

        if (value === selectedYAxisPreference) {
            setSelectedYAxisPreference(
                getNextAvailableColumn(
                    columns,
                    value
                )
            );
        }
    }

    function handleYAxisChange(
        value: string
    ) {
        setSelectedYAxisPreference(
            value
        );

        if (value === selectedXAxisPreference) {
            setSelectedXAxisPreference(
                getNextAvailableColumn(
                    columns,
                    value
                )
            );
        }
    }


    return (
        <section className="interactive-chart-card" id="data-visualization">
            <div className="interactive-chart-header">
                <div>
                    <h3> Data Visualization</h3>
                    <p>Explore manufacturing data using  charts.</p>
                </div>
            </div>

            <div className="interactive-chart-divider" />

            <div className="chart-control-grid">
                <label className="chart-control-field">
                    <span>X Axis</span>

                    <select
                        value={selectedXAxis}
                        onChange={(event) =>
                            handleXAxisChange(event.target.value)
                        }
                    >
                        {xAxisOptions.length === 0 && (
                            <option value="">
                                No available column
                            </option>
                        )}

                        {xAxisOptions.map((column) => (
                            <option
                                key={column}
                                value={column}
                            >
                                {column}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="chart-control-field">
                    <span>Y Axis</span>

                    <select
                        value={selectedYAxis}
                        onChange={(event) =>
                            handleYAxisChange(event.target.value)
                        }
                    >
                        {yAxisOptions.length === 0 && (
                            <option value="">
                                No available column
                            </option>
                        )}

                        {yAxisOptions.map((column) => (
                            <option
                                key={column}
                                value={column}
                            >
                                {column}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="chart-control-field">
                    <span>Chart Type</span>

                    <select
                        value={chartType}
                        onChange={(event) =>
                            setChartType(event.target.value as ChartType)
                        }
                    >
                        <option value="line">Line</option>
                        <option value="bar">Bar</option>
                        <option value="scatter">Scatter</option>
                    </select>
                </label>
            </div>

            <div className="interactive-chart-divider" />

            <div className="chart-visualization">
                {chartValidation.isValid ? (
                    <ResponsiveContainer>
                        {chartType === "line" && (
                            <LineChart
                                data={data}
                                margin={{ top: 24, right: 30, bottom: 18, left: 12 }}
                            >
                                <CartesianGrid
                                    stroke="var(--chart-grid)"
                                    strokeDasharray="4 4"
                                    vertical={false}
                                />

                                <XAxis
                                    dataKey={selectedXAxis}
                                    tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={{ stroke: "var(--border)" }}
                                />

                                <YAxis
                                    tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={{ stroke: "var(--border)" }}
                                />

                                <Tooltip
                                    contentStyle={{
                                        background: "var(--surface)",
                                        border: "1px solid var(--border)",
                                        borderRadius: 10,
                                        boxShadow: "var(--shadow)",
                                        color: "var(--text)",
                                    }}
                                    labelStyle={{
                                        color: "var(--text)",
                                        fontWeight: 700,
                                    }}
                                    cursor={{ stroke: "var(--primary)", strokeDasharray: "4 4" }}
                                />

                                <Legend
                                    wrapperStyle={{
                                        color: "var(--text-muted)",
                                        fontSize: 12,
                                        paddingTop: 14,
                                    }}
                                />

                                <Line
                                    type="monotone"
                                    dataKey={selectedYAxis}
                                    stroke="var(--primary)"
                                    strokeWidth={2.5}
                                    dot={false}
                                    activeDot={{ r: 7, strokeWidth: 2 }}
                                    animationDuration={150}
                                />
                            </LineChart>
                        )}

                        {chartType === "bar" && (
                            <BarChart
                                data={data}
                                margin={{ top: 24, right: 30, bottom: 18, left: 12 }}
                            >
                                <CartesianGrid
                                    stroke="var(--chart-grid)"
                                    strokeDasharray="4 4"
                                    vertical={false}
                                />

                                <XAxis
                                    dataKey={selectedXAxis}
                                    tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={{ stroke: "var(--border)" }}
                                />

                                <YAxis
                                    tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={{ stroke: "var(--border)" }}
                                />

                                <Tooltip
                                    contentStyle={{
                                        background: "var(--surface)",
                                        border: "1px solid var(--border)",
                                        borderRadius: 10,
                                        boxShadow: "var(--shadow)",
                                        color: "var(--text)",
                                    }}
                                    labelStyle={{
                                        color: "var(--text)",
                                        fontWeight: 700,
                                    }}
                                    cursor={{ fill: "var(--primary-soft)" }}
                                />

                                <Legend
                                    wrapperStyle={{
                                        color: "var(--text-muted)",
                                        fontSize: 12,
                                        paddingTop: 14,
                                    }}
                                />

                                <Bar
                                    dataKey={selectedYAxis}
                                    fill="var(--primary)"
                                    radius={[6, 6, 0, 0]}
                                    animationDuration={150}
                                />
                            </BarChart>
                        )}

                        {chartType === "scatter" && (
                            <ScatterChart
                                margin={{ top: 24, right: 30, bottom: 18, left: 12 }}
                            >
                                <CartesianGrid
                                    stroke="var(--chart-grid)"
                                    strokeDasharray="4 4"
                                />

                                <XAxis
                                    dataKey={selectedXAxis}
                                    type="number"
                                    tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={{ stroke: "var(--border)" }}
                                />

                                <YAxis
                                    dataKey={selectedYAxis}
                                    type="number"
                                    tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={{ stroke: "var(--border)" }}
                                />

                                <Tooltip
                                    contentStyle={{
                                        background: "var(--surface)",
                                        border: "1px solid var(--border)",
                                        borderRadius: 10,
                                        boxShadow: "var(--shadow)",
                                        color: "var(--text)",
                                    }}
                                    labelStyle={{
                                        color: "var(--text)",
                                        fontWeight: 700,
                                    }}
                                    cursor={{ stroke: "var(--primary)", strokeDasharray: "4 4" }}
                                />

                                <Legend
                                    wrapperStyle={{
                                        color: "var(--text-muted)",
                                        fontSize: 12,
                                        paddingTop: 14,
                                    }}
                                />

                                <Scatter
                                    data={data}
                                    dataKey={selectedYAxis}
                                    fill="var(--primary)"
                                    animationDuration={150}
                                />
                            </ScatterChart>
                        )}
                    </ResponsiveContainer>
                ) : (
                    <div className="chart-empty-state">
                        <h4>Unable to visualize selected fields</h4>
                        <p>
                            {chartValidation.message}
                        </p>
                        <span>Try:</span>
                        <ul>
                            <li>selecting a numeric field for the Y-axis</li>
                            <li>choosing another chart type</li>
                            <li>selecting different columns</li>
                        </ul>
                    </div>
                )}
            </div>

            <div className="interactive-chart-divider" />

            <footer className="chart-summary-footer">
                <span>{data.length} data points</span>
                <span>{visualizationLabel} visualization</span>
                <span>X axis: {selectedXAxis}</span>
                <span>Y axis: {selectedYAxis}</span>
            </footer>
        </section>

        
    );
}
