import type { ChartRow } from "../types/chart";

export type FieldKind = "continuous" | "discrete" | "temporal" | "unknown";

export type ChartType = "line" | "bar" | "scatter";

export interface ChartValidationResult {
    isValid: boolean;
    message: string;
}

interface ChartRuleDefinition {
    isAllowed: (
        xAxisKind: FieldKind,
        yAxisKind: FieldKind
    ) => boolean;
    getInvalidMessage: (
        xAxisKind: FieldKind,
        yAxisKind: FieldKind
    ) => string;
}

const TEMPORAL_FIELD_NAME_PATTERN = /(^|_)(date|time|timestamp|datetime|created|updated|event|start|end|at)($|_)/i;

const DISCRETE_FIELD_NAME_PATTERN = /(^|_)(id|key|code|type|status|category|class|group|label|name|city|country|region|state|department|segment|kind|role)($|_)/i;

const CONTINUOUS_FIELD_NAME_PATTERN = /(^|_)(continuous|numeric|number|count|total|amount|value|score|price|cost|salary|age|temperature|pressure|usage|latency|duration|size|weight|height|distance|rate|ratio|percent|percentage|throughput|frequency|speed|volume|revenue|income|memory|cpu|disk|load|balance|quantity|metric|measure)($|_)/i;

const chartValidationRules: Record<ChartType, ChartRuleDefinition> = {
    line: {
        isAllowed: (_xAxisKind, yAxisKind) => yAxisKind === "continuous",
        getInvalidMessage: (_xAxisKind, yAxisKind) => {
            if (yAxisKind === "discrete") {
                return "Line charts require a continuous Y-axis. Select a numeric metric for Y.";
            }

            if (yAxisKind === "temporal") {
                return "Line charts require a continuous Y-axis. Time belongs on the X-axis for this chart.";
            }

            return "Line charts require a continuous Y-axis.";
        },
    },
    bar: {
        isAllowed: (xAxisKind, yAxisKind) =>
            (xAxisKind === "discrete" || xAxisKind === "temporal") &&
            yAxisKind === "continuous",
        getInvalidMessage: (xAxisKind, yAxisKind) => {
            if (yAxisKind !== "continuous") {
                return "Bar charts require a categorical or temporal X-axis and a continuous Y-axis.";
            }

            if (xAxisKind === "continuous") {
                return "Bar charts require a categorical or temporal X-axis. Move the numeric measure to Y.";
            }

            return "Bar charts require a categorical or temporal X-axis and a continuous Y-axis.";
        },
    },
    scatter: {
        isAllowed: (xAxisKind, yAxisKind) =>
            (xAxisKind === "continuous" && yAxisKind === "continuous") ||
            (xAxisKind === "temporal" && yAxisKind === "continuous") ||
            (xAxisKind === "continuous" && yAxisKind === "temporal"),
        getInvalidMessage: (xAxisKind, yAxisKind) => {
            if (xAxisKind === "discrete" && yAxisKind === "continuous") {
                return "Scatter charts do not support a discrete X-axis with a continuous Y-axis. Use a numeric or temporal X-axis instead.";
            }

            if (xAxisKind === "continuous" && yAxisKind === "discrete") {
                return "Scatter charts do not support a discrete Y-axis. Choose a continuous Y-axis instead.";
            }

            if (xAxisKind === "discrete" && yAxisKind === "discrete") {
                return "Scatter charts require at least one continuous variable. Both selected fields are discrete.";
            }

            if (xAxisKind === "temporal" && yAxisKind === "temporal") {
                return "Scatter charts require a continuous Y-axis. A temporal X-axis must be paired with a continuous Y-axis.";
            }

            return "Scatter charts require two continuous variables or a temporal X-axis paired with a continuous Y-axis.";
        },
    },
};

function isEmptyValue(value: unknown): boolean {
    return value === null || value === undefined || value === "";
}

function normalizeText(value: unknown): string {
    return typeof value === "string" ? value.trim() : String(value).trim();
}

function isBooleanLike(value: unknown): boolean {
    if (typeof value === "boolean") {
        return true;
    }

    if (typeof value !== "string") {
        return false;
    }

    const normalizedValue = normalizeText(value).toLowerCase();

    return ["true", "false", "yes", "no"].includes(normalizedValue);
}

function isNumericLike(value: unknown): boolean {
    if (typeof value === "number") {
        return Number.isFinite(value);
    }

    if (typeof value !== "string") {
        return false;
    }

    const normalizedValue = normalizeText(value);

    return normalizedValue !== "" && Number.isFinite(Number(normalizedValue));
}

function isLeadingZeroNumeric(value: unknown): boolean {
    if (typeof value !== "string") {
        return false;
    }

    const normalizedValue = normalizeText(value);

    return /^0\d+$/.test(normalizedValue);
}

function isLikelyTemporalValue(value: unknown): boolean {
    if (typeof value === "string") {
        const normalizedValue = normalizeText(value);

        if (normalizedValue === "") {
            return false;
        }

        const parsedTimestamp = Date.parse(normalizedValue);

        return Number.isFinite(parsedTimestamp) && !isNumericLike(normalizedValue);
    }

    return false;
}

function hasTemporalFieldName(field: string): boolean {
    return TEMPORAL_FIELD_NAME_PATTERN.test(field);
}

function hasDiscreteFieldName(field: string): boolean {
    return DISCRETE_FIELD_NAME_PATTERN.test(field);
}

function hasContinuousFieldName(field: string): boolean {
    return CONTINUOUS_FIELD_NAME_PATTERN.test(field);
}

function getFieldValues(data: ChartRow[], field: string): unknown[] {
    return data
        .map((row) => row[field])
        .filter((value) => !isEmptyValue(value))
        .slice(0, 250);
}

function getUniqueValueRatio(values: unknown[]): number {
    if (values.length === 0) {
        return 0;
    }

    return new Set(values.map((value) => normalizeText(value))).size / values.length;
}

function getFieldKindScore(
    field: string,
    values: unknown[],
    kind: Exclude<FieldKind, "unknown">
): number {
    const sampleSize = values.length;

    if (sampleSize === 0) {
        return 0;
    }

    const uniqueRatio = getUniqueValueRatio(values);
    const temporalMatches = values.filter(isLikelyTemporalValue).length;
    const numericMatches = values.filter(isNumericLike).length;
    const discreteMatches = values.filter(
        (value) =>
            typeof value === "string" ||
            typeof value === "boolean" ||
            isBooleanLike(value)
    ).length;

    switch (kind) {
        case "temporal":
            return (
                temporalMatches / sampleSize +
                (hasTemporalFieldName(field) ? 0.75 : 0)
            );
        case "continuous":
            return (
                numericMatches / sampleSize +
                (hasContinuousFieldName(field) ? 0.5 : 0) +
                (numericMatches === sampleSize && !hasDiscreteFieldName(field) ? 0.2 : 0) -
                (hasDiscreteFieldName(field) ? 0.4 : 0)
            );
        case "discrete":
            return (
                discreteMatches / sampleSize +
                (hasDiscreteFieldName(field) ? 1.25 : 0) +
                (uniqueRatio <= 0.25 ? 0.25 : 0) +
                (isLeadingZeroNumeric(values[0]) ? 0.5 : 0)
            );
    }
}

export function isContinuous(value: unknown): boolean {
    return isNumericLike(value) && !isLikelyTemporalValue(value);
}

export function isTemporal(value: unknown): boolean {
    return isLikelyTemporalValue(value);
}

export function isDiscrete(value: unknown): boolean {
    return isBooleanLike(value) || (!isTemporal(value) && !isContinuous(value) && typeof value === "string");
}

export function getFieldKind(
    data: ChartRow[],
    field: string
): FieldKind {
    const values = getFieldValues(data, field);

    if (values.length === 0) {
        return "unknown";
    }

    const temporalScore = getFieldKindScore(field, values, "temporal");
    const continuousScore = getFieldKindScore(field, values, "continuous");
    const discreteScore = getFieldKindScore(field, values, "discrete");

    const highestScore = Math.max(temporalScore, continuousScore, discreteScore);

    if (highestScore <= 0) {
        return "unknown";
    }

    if (highestScore === temporalScore) {
        return "temporal";
    }

    if (highestScore === continuousScore) {
        return "continuous";
    }

    return "discrete";
}

export function isChartCombinationValid(
    chartType: ChartType,
    xAxisKind: FieldKind,
    yAxisKind: FieldKind
): ChartValidationResult {
    if (xAxisKind === "unknown" || yAxisKind === "unknown") {
        return {
            isValid: false,
            message: "The selected fields do not contain enough usable values to determine a visualization type.",
        };
    }

    const chartRule = chartValidationRules[chartType];

    if (chartRule.isAllowed(xAxisKind, yAxisKind)) {
        return {
            isValid: true,
            message: "",
        };
    }

    return {
        isValid: false,
        message: chartRule.getInvalidMessage(xAxisKind, yAxisKind),
    };
}
