import { useMemo, useState } from "react";
import type { ChartRow } from "../types/chart";
import { getFieldKind, isChartCombinationValid, type ChartType } from "../utils/visualizationValidation";
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
                        <p>Explore your uploaded data with interactive charts.</p>
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
                            {chartType === "scatter" && (
                                <>
                                    <li>use a continuous or temporal field on the X-axis</li>
                                    <li>use a continuous field on the Y-axis</li>
                                </>
                            )}

                            {chartType === "bar" && (
                                <>
                                    <li>use a categorical or temporal field on the X-axis</li>
                                    <li>use a continuous field on the Y-axis</li>
                                </>
                            )}

                            {chartType === "line" && (
                                <>
                                    <li>use a continuous field on the Y-axis</li>
                                    <li>keep temporal fields on the X-axis for time-based trends</li>
                                </>
                            )}
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
