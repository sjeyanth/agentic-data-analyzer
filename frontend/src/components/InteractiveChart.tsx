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

interface ChartPoint extends ChartRow {
    row_index: number;
}

interface ChartTooltipProps {
    active?: boolean;
    payload?: ReadonlyArray<{
        payload?: ChartPoint;
    }>;
    xAxisField: string;
    yAxisField: string;
}

function formatTooltipValue(value: unknown): string {
    if (value === null || value === undefined || value === "") {
        return "—";
    }

    return String(value);
}

function ChartTooltip({
    active,
    payload,
    xAxisField,
    yAxisField,
}: ChartTooltipProps) {
    const point = payload?.[0]?.payload;

    if (!active || !point) {
        return null;
    }

    return (
        <div
            style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                boxShadow: "var(--shadow)",
                color: "var(--text)",
                padding: "0.75rem 0.85rem",
                minWidth: 180,
            }}
        >
            <div
                style={{
                    color: "var(--text)",
                    fontWeight: 700,
                    marginBottom: 8,
                }}
            >
                Row: {formatTooltipValue(point.row_index)}
            </div>

            <div style={{ color: "var(--text-muted)", fontSize: 12, lineHeight: 1.6 }}>
                <div>
                    {xAxisField}: {formatTooltipValue(point[xAxisField])}
                </div>
                <div>
                    {yAxisField}: {formatTooltipValue(point[yAxisField])}
                </div>
            </div>
        </div>
    );
}

function renderTooltipContent(
    tooltipProps: {
        active?: boolean;
        payload?: unknown;
    },
    xAxisField: string,
    yAxisField: string
) {
    return (
        <ChartTooltip
            active={tooltipProps.active}
            payload={tooltipProps.payload as unknown as ReadonlyArray<{ payload?: ChartPoint }> | undefined}
            xAxisField={xAxisField}
            yAxisField={yAxisField}
        />
    );
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

function clampRowValue(
    value: number,
    minimum: number,
    maximum: number
): number {
    return Math.min(
        Math.max(Math.trunc(value), minimum),
        maximum
    );
}

function coerceRowInputValue(
    value: number,
    fallback: number
): number {
    return Number.isFinite(value) ? value : fallback;
}

function getInitialVisibleRange(totalRows: number) {
    if (totalRows <= 0) {
        return { start: 0, end: 0 };
    }

    if (totalRows === 1) {
        return { start: 1, end: 1 };
    }

    return { start: 1, end: totalRows };
}

interface VisibleRowRangeState {
    totalRows: number;
    start: number;
    end: number;
}

export function InteractiveChart({
    data,
}: InteractiveChartProps) {
    const chartData = useMemo<ChartPoint[]>(() => {
        return data.map((row, index) => ({
            ...row,
            row_index: index + 1,
        }));
    }, [data]);

    const columns = useMemo(() => {

        if (data.length === 0) {
            return [];
        }

        return Object.keys(data[0]);

    }, [data]);

    const [selectedXAxisPreference, setSelectedXAxisPreference] = useState("");

    const [selectedYAxisPreference, setSelectedYAxisPreference] = useState("");
    const [visibleRangeState, setVisibleRangeState] = useState<VisibleRowRangeState>(() => {
        const initialVisibleRange = getInitialVisibleRange(chartData.length);

        return {
            totalRows: chartData.length,
            start: initialVisibleRange.start,
            end: initialVisibleRange.end,
        };
    });


    const totalRows = chartData.length;

    const visibleRange = visibleRangeState.totalRows === totalRows
        ? visibleRangeState
        : {
            totalRows,
            ...getInitialVisibleRange(totalRows),
        };
    const visibleStart = visibleRange.start;
    const visibleEnd = visibleRange.end;

    const visibleChartData = useMemo(() => {
        if (totalRows <= 0) {
            return [];
        }

        return chartData.slice(
            visibleStart - 1,
            visibleEnd
        );
    }, [chartData, totalRows, visibleStart, visibleEnd]);

    const [chartType, setChartType] = useState<ChartType>("line");
    const [activeVisibleThumb, setActiveVisibleThumb] = useState<"start" | "end" | null>(null);


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
        chartData,
        selectedXAxis
    );

    const yAxisKind = getFieldKind(
        chartData,
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

    function handleVisibleStartChange(
        value: number
    ) {
        const nextValue = coerceRowInputValue(
            value,
            visibleStart
        );

        if (totalRows <= 0) {
            return;
        }

        if (totalRows === 1) {
            setVisibleRangeState({
                totalRows,
                start: 1,
                end: 1,
            });
            return;
        }

        const nextStart = clampRowValue(
            nextValue,
            1,
            totalRows - 1
        );

        setVisibleRangeState({
            totalRows,
            start: Math.min(
                nextStart,
                visibleEnd - 1
            ),
            end: visibleEnd,
        });
    }

    function handleVisibleEndChange(
        value: number
    ) {
        const nextValue = coerceRowInputValue(
            value,
            visibleEnd
        );

        if (totalRows <= 0) {
            return;
        }

        if (totalRows === 1) {
            setVisibleRangeState({
                totalRows,
                start: 1,
                end: 1,
            });
            return;
        }

        const nextEnd = clampRowValue(
            nextValue,
            2,
            totalRows
        );

        setVisibleRangeState({
            totalRows,
            start: visibleStart,
            end: Math.max(
                nextEnd,
                visibleStart + 1
            ),
        });
    }

    const visibleRowCount = visibleChartData.length;
    const visibleRangeTrackStyle = totalRows > 0 ? {
        background: `linear-gradient(90deg, var(--border) 0%, var(--border) ${((visibleStart - 1) / totalRows) * 100}%, var(--primary) ${((visibleStart - 1) / totalRows) * 100}%, var(--primary) ${(visibleEnd / totalRows) * 100}%, var(--border) ${(visibleEnd / totalRows) * 100}%, var(--border) 100%)`,
    } : undefined;

    function setVisibleThumbActive(thumb: "start" | "end") {
        setActiveVisibleThumb(thumb);
    }

    function clearVisibleThumbActive() {
        setActiveVisibleThumb(null);
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
                                data={visibleChartData}
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
                                    content={(tooltipProps) => renderTooltipContent(tooltipProps, selectedXAxis, selectedYAxis)}
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
                                data={visibleChartData}
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
                                    content={(tooltipProps) => renderTooltipContent(tooltipProps, selectedXAxis, selectedYAxis)}
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
                                    content={(tooltipProps) => renderTooltipContent(tooltipProps, selectedXAxis, selectedYAxis)}
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
                                    data={visibleChartData}
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

            <footer className="chart-summary-footer">
                <span>{visibleChartData.length} data points</span>
                <span>{visualizationLabel} visualization</span>
                <span>X axis: {selectedXAxis}</span>
                <span>Y axis: {selectedYAxis}</span>
            </footer>

            <section className="visible-rows-panel" aria-label="Visible rows">
                <div className="visible-rows-copy">
                    <h4>Visible Rows</h4>
                    <p>Filter the dataset before it is plotted.</p>
                </div>

                <div className="visible-rows-controls">
                    <div className="visible-rows-status" aria-live="polite">
                        Showing {visibleRowCount} of {totalRows} rows
                    </div>

                    <div className="visible-rows-inline">
                        <div className="visible-rows-grid">
                            <label className="chart-control-field visible-rows-field">
                                <span>Start</span>

                                <input
                                    type="number"
                                    min={totalRows > 0 ? 1 : 0}
                                    max={totalRows > 0 ? Math.max(1, totalRows - 1) : 0}
                                    step={1}
                                    value={visibleStart}
                                    onChange={(event) =>
                                        handleVisibleStartChange(event.target.valueAsNumber)
                                    }
                                    disabled={totalRows === 0}
                                />
                            </label>

                            <label className="chart-control-field visible-rows-field">
                                <span>End</span>

                                <input
                                    type="number"
                                    min={totalRows > 0 ? Math.min(2, totalRows) : 0}
                                    max={totalRows}
                                    step={1}
                                    value={visibleEnd}
                                    onChange={(event) =>
                                        handleVisibleEndChange(event.target.valueAsNumber)
                                    }
                                    disabled={totalRows === 0}
                                />
                            </label>
                        </div>

                        <div className="visible-rows-slider-wrap">
                            <span className="visible-rows-slider-label">  .. Adjust Rows Range using sliders</span>

                            <div className="visible-rows-slider" aria-label="Visible rows range selector">
                            <div className="visible-rows-slider-track" style={visibleRangeTrackStyle} />

                            <input
                                className={`visible-rows-slider-input ${activeVisibleThumb === "start" ? "visible-rows-slider-start active" : "visible-rows-slider-start"}`}
                                type="range"
                                min={totalRows > 0 ? 1 : 0}
                                max={totalRows > 0 ? Math.max(1, totalRows - 1) : 0}
                                step={1}
                                value={visibleStart}
                                onPointerDown={() => setVisibleThumbActive("start")}
                                onFocus={() => setVisibleThumbActive("start")}
                                onBlur={clearVisibleThumbActive}
                                onChange={(event) =>
                                    handleVisibleStartChange(event.target.valueAsNumber)
                                }
                                disabled={totalRows === 0}
                            />

                            <input
                                className={`visible-rows-slider-input ${activeVisibleThumb === "end" ? "visible-rows-slider-end active" : "visible-rows-slider-end"}`}
                                type="range"
                                min={totalRows > 0 ? Math.min(2, totalRows) : 0}
                                max={totalRows}
                                step={1}
                                value={visibleEnd}
                                onPointerDown={() => setVisibleThumbActive("end")}
                                onFocus={() => setVisibleThumbActive("end")}
                                onBlur={clearVisibleThumbActive}
                                onChange={(event) =>
                                    handleVisibleEndChange(event.target.valueAsNumber)
                                }
                                disabled={totalRows === 0}
                            />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </section>

        
    );
}
