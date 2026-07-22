import type { ChartRow } from "../types/chart";
import type { ChartType } from "./visualizationValidation";

export type VisualizationFieldType = "numeric" | "datetime" | "categorical" | "text" | "unknown";

export type VisualizationPreparationStatus = "success" | "empty" | "unsupported";

export type VisualizationType =
  | "numeric_numeric"
  | "datetime_numeric"
  | "categorical_numeric"
  | "categorical_categorical"
  | "unsupported";

export interface VisualizationPreparationInput {
  data: ChartRow[];
  chartType: ChartType;
  xAxisField: string;
  yAxisField: string;
}

export interface VisualizationPreparationResult {
  dataset: ChartRow[];
  status: VisualizationPreparationStatus;
  visualizationType: VisualizationType;
  rowsTotal: number;
  rowsPlotted: number;
  rowsSkipped: number;
  skippedReason: string | null;
  message: string;
  xAxisDataKey: string;
  yAxisDataKey: string;
  xAxisLabel: string;
  yAxisLabel: string;
  scatterXAxisType: "number" | "category";
  scatterYAxisType: "number" | "category";
  xAxisFieldType: VisualizationFieldType;
  yAxisFieldType: VisualizationFieldType;
}

const PREPARED_X_AXIS_KEY = "__viz_x";
const PREPARED_Y_AXIS_KEY = "__viz_y";
const PREPARED_GROUP_LABEL_KEY = "__viz_group";

function isMissingValue(value: unknown): boolean {
  return value === null || value === undefined || (typeof value === "string" && value.trim() === "");
}

function toText(value: unknown): string {
  return typeof value === "string" ? value.trim() : String(value).trim();
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return null;
  }

  const numericValue = Number(normalizedValue);

  return Number.isFinite(numericValue) ? numericValue : null;
}

function toDateTimestamp(value: unknown): number | null {
  if (value instanceof Date) {
    const dateTimestamp = value.getTime();
    return Number.isFinite(dateTimestamp) ? dateTimestamp : null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return null;
  }

  const parsedTimestamp = Date.parse(normalizedValue);

  return Number.isFinite(parsedTimestamp) ? parsedTimestamp : null;
}

function getFieldSamples(data: ChartRow[], field: string): unknown[] {
  return data
    .map((row) => row[field])
    .filter((value) => !isMissingValue(value))
    .slice(0, 500);
}

function classifyField(data: ChartRow[], field: string): VisualizationFieldType {
  const samples = getFieldSamples(data, field);

  if (samples.length === 0) {
    return "unknown";
  }

  const numericMatches = samples.filter((value) => toFiniteNumber(value) !== null).length;
  const datetimeMatches = samples.filter((value) => toDateTimestamp(value) !== null).length;
  const stringSamples = samples.filter((value) => typeof value === "string").map((value) => value.trim());

  const sampleCount = samples.length;
  const numericRatio = numericMatches / sampleCount;
  const datetimeRatio = datetimeMatches / sampleCount;

  if (numericRatio >= 0.85) {
    return "numeric";
  }

  if (datetimeRatio >= 0.75 && stringSamples.length >= Math.floor(sampleCount * 0.6)) {
    return "datetime";
  }

  if (stringSamples.length >= Math.floor(sampleCount * 0.7)) {
    const normalizedSamples = stringSamples.filter(Boolean).map((value) => value.toLowerCase());

    if (normalizedSamples.length === 0) {
      return "unknown";
    }

    const uniqueRatio = new Set(normalizedSamples).size / normalizedSamples.length;
    const averageLength = normalizedSamples.reduce((total, value) => total + value.length, 0) / normalizedSamples.length;

    if (uniqueRatio >= 0.85 && averageLength >= 24) {
      return "text";
    }

    return "categorical";
  }

  return "categorical";
}

function summarizeSkipReasons(skipReasons: Map<string, number>): string | null {
  if (skipReasons.size === 0) {
    return null;
  }

  return Array.from(skipReasons.entries())
    .sort((left, right) => right[1] - left[1])
    .map(([reason, count]) => `${reason} (${count})`)
    .join(", ");
}

function createBaseResult(
  input: VisualizationPreparationInput,
  xAxisFieldType: VisualizationFieldType,
  yAxisFieldType: VisualizationFieldType
): VisualizationPreparationResult {
  return {
    dataset: [],
    status: "empty",
    visualizationType: "unsupported",
    rowsTotal: input.data.length,
    rowsPlotted: 0,
    rowsSkipped: input.data.length,
    skippedReason: null,
    message: "No plottable data points were found for the selected fields.",
    xAxisDataKey: PREPARED_X_AXIS_KEY,
    yAxisDataKey: PREPARED_Y_AXIS_KEY,
    xAxisLabel: input.xAxisField,
    yAxisLabel: input.yAxisField,
    scatterXAxisType: "number",
    scatterYAxisType: "number",
    xAxisFieldType,
    yAxisFieldType,
  };
}

function buildSuccessMessage(result: VisualizationPreparationResult): string {
  if (result.rowsSkipped <= 0 || !result.skippedReason) {
    return `${result.rowsPlotted} of ${result.rowsTotal} rows were visualized.`;
  }

  return `${result.rowsPlotted} of ${result.rowsTotal} rows were visualized. ${result.rowsSkipped} rows were excluded because of ${result.skippedReason}.`;
}

function prepareNumericNumeric(
  input: VisualizationPreparationInput,
  result: VisualizationPreparationResult
): VisualizationPreparationResult {
  const dataset: ChartRow[] = [];
  const skipReasons = new Map<string, number>();

  for (const row of input.data) {
    const xValue = toFiniteNumber(row[input.xAxisField]);
    const yValue = toFiniteNumber(row[input.yAxisField]);

    if (xValue === null || yValue === null) {
      const reason = xValue === null && yValue === null
        ? "invalid numeric values on both axes"
        : xValue === null
          ? "invalid numeric values on X-axis"
          : "invalid numeric values on Y-axis";

      skipReasons.set(reason, (skipReasons.get(reason) ?? 0) + 1);
      continue;
    }

    dataset.push({
      ...row,
      [PREPARED_X_AXIS_KEY]: xValue,
      [PREPARED_Y_AXIS_KEY]: yValue,
    });
  }

  const skippedReason = summarizeSkipReasons(skipReasons);
  const rowsSkipped = input.data.length - dataset.length;

  return {
    ...result,
    dataset,
    status: dataset.length > 0 ? "success" : "empty",
    visualizationType: "numeric_numeric",
    rowsPlotted: dataset.length,
    rowsSkipped,
    skippedReason,
    message: dataset.length > 0
      ? buildSuccessMessage({ ...result, rowsTotal: input.data.length, rowsPlotted: dataset.length, rowsSkipped, skippedReason })
      : "No valid numeric pairs are available for the selected fields.",
    scatterXAxisType: "number",
    scatterYAxisType: "number",
  };
}

function prepareDatetimeNumeric(
  input: VisualizationPreparationInput,
  result: VisualizationPreparationResult,
  xAxisFieldType: VisualizationFieldType
): VisualizationPreparationResult {
  const dateField = xAxisFieldType === "datetime" ? input.xAxisField : input.yAxisField;
  const numericField = dateField === input.xAxisField ? input.yAxisField : input.xAxisField;

  const dataset: ChartRow[] = [];
  const skipReasons = new Map<string, number>();

  for (const row of input.data) {
    const dateTimestamp = toDateTimestamp(row[dateField]);
    const numericValue = toFiniteNumber(row[numericField]);

    if (dateTimestamp === null || numericValue === null) {
      const reason = dateTimestamp === null && numericValue === null
        ? "invalid date and numeric values"
        : dateTimestamp === null
          ? "invalid date values"
          : "invalid numeric values";

      skipReasons.set(reason, (skipReasons.get(reason) ?? 0) + 1);
      continue;
    }

    dataset.push({
      ...row,
      [PREPARED_X_AXIS_KEY]: input.chartType === "scatter" ? dateTimestamp : new Date(dateTimestamp).toISOString(),
      [PREPARED_Y_AXIS_KEY]: numericValue,
    });
  }

  dataset.sort((leftRow, rightRow) => {
    const leftValue = toFiniteNumber(leftRow[PREPARED_X_AXIS_KEY]);
    const rightValue = toFiniteNumber(rightRow[PREPARED_X_AXIS_KEY]);

    if (leftValue !== null && rightValue !== null) {
      return leftValue - rightValue;
    }

    return String(leftRow[PREPARED_X_AXIS_KEY]).localeCompare(String(rightRow[PREPARED_X_AXIS_KEY]));
  });

  const skippedReason = summarizeSkipReasons(skipReasons);
  const rowsSkipped = input.data.length - dataset.length;

  return {
    ...result,
    dataset,
    status: dataset.length > 0 ? "success" : "empty",
    visualizationType: "datetime_numeric",
    rowsPlotted: dataset.length,
    rowsSkipped,
    skippedReason,
    message: dataset.length > 0
      ? buildSuccessMessage({ ...result, rowsTotal: input.data.length, rowsPlotted: dataset.length, rowsSkipped, skippedReason })
      : "No valid datetime and numeric pairs are available for the selected fields.",
    xAxisLabel: dateField,
    yAxisLabel: numericField,
    scatterXAxisType: "number",
    scatterYAxisType: "number",
  };
}

function aggregateCategoryNumeric(
  categoryValues: Map<string, number[]>
): Array<{ category: string; value: number }> {
  const entries: Array<{ category: string; value: number }> = [];

  for (const [category, values] of categoryValues.entries()) {
    if (values.length === 0) {
      continue;
    }

    const sumValue = values.reduce((total, value) => total + value, 0);
    const averageValue = sumValue / values.length;
    const aggregatedValue = Number.isFinite(averageValue) ? averageValue : sumValue;

    entries.push({
      category,
      value: aggregatedValue,
    });
  }

  return entries.sort((left, right) => left.category.localeCompare(right.category));
}

function prepareCategoricalNumeric(
  input: VisualizationPreparationInput,
  result: VisualizationPreparationResult,
  xAxisFieldType: VisualizationFieldType
): VisualizationPreparationResult {
  const categoryField = xAxisFieldType === "categorical" ? input.xAxisField : input.yAxisField;
  const numericField = categoryField === input.xAxisField ? input.yAxisField : input.xAxisField;

  const categoryValues = new Map<string, number[]>();
  const skipReasons = new Map<string, number>();
  let validRowCount = 0;

  for (const row of input.data) {
    const rawCategoryValue = row[categoryField];
    const numericValue = toFiniteNumber(row[numericField]);

    if (isMissingValue(rawCategoryValue) || numericValue === null) {
      const reason = isMissingValue(rawCategoryValue) && numericValue === null
        ? "missing category and invalid numeric values"
        : isMissingValue(rawCategoryValue)
          ? "missing category values"
          : "invalid numeric values";

      skipReasons.set(reason, (skipReasons.get(reason) ?? 0) + 1);
      continue;
    }

    const categoryValue = toText(rawCategoryValue);

    if (!categoryValue) {
      skipReasons.set("missing category values", (skipReasons.get("missing category values") ?? 0) + 1);
      continue;
    }

    if (!categoryValues.has(categoryValue)) {
      categoryValues.set(categoryValue, []);
    }

    categoryValues.get(categoryValue)?.push(numericValue);
    validRowCount += 1;
  }

  const aggregatedRows = aggregateCategoryNumeric(categoryValues);

  const dataset = aggregatedRows.map((entry, index) => ({
    [PREPARED_X_AXIS_KEY]: input.chartType === "scatter" ? index + 1 : entry.category,
    [PREPARED_Y_AXIS_KEY]: entry.value,
    [PREPARED_GROUP_LABEL_KEY]: entry.category,
  }));

  const skippedReason = summarizeSkipReasons(skipReasons);
  const rowsSkipped = input.data.length - validRowCount;
  const baseMessage = dataset.length > 0
    ? `${validRowCount} of ${input.data.length} rows were visualized and aggregated into ${dataset.length} groups.`
    : "No valid categorical and numeric values are available for aggregation.";

  return {
    ...result,
    dataset,
    status: dataset.length > 0 ? "success" : "empty",
    visualizationType: "categorical_numeric",
    rowsPlotted: validRowCount,
    rowsSkipped,
    skippedReason,
    message: skippedReason && dataset.length > 0 ? `${baseMessage} Skipped rows: ${skippedReason}.` : baseMessage,
    xAxisLabel: categoryField,
    yAxisLabel: numericField,
    scatterXAxisType: "number",
    scatterYAxisType: "number",
  };
}

function prepareCategoricalCategorical(
  input: VisualizationPreparationInput,
  result: VisualizationPreparationResult
): VisualizationPreparationResult {
  const frequencyMap = new Map<string, { left: string; right: string; count: number }>();
  const skipReasons = new Map<string, number>();
  let validRowCount = 0;

  for (const row of input.data) {
    const rawXValue = row[input.xAxisField];
    const rawYValue = row[input.yAxisField];

    if (isMissingValue(rawXValue) || isMissingValue(rawYValue)) {
      skipReasons.set("missing categorical values", (skipReasons.get("missing categorical values") ?? 0) + 1);
      continue;
    }

    const leftValue = toText(rawXValue);
    const rightValue = toText(rawYValue);

    if (!leftValue || !rightValue) {
      skipReasons.set("missing categorical values", (skipReasons.get("missing categorical values") ?? 0) + 1);
      continue;
    }

    const groupKey = `${leftValue}|||${rightValue}`;
    const existingGroup = frequencyMap.get(groupKey);

    if (existingGroup) {
      existingGroup.count += 1;
    } else {
      frequencyMap.set(groupKey, {
        left: leftValue,
        right: rightValue,
        count: 1,
      });
    }

    validRowCount += 1;
  }

  const frequencyRows = Array.from(frequencyMap.values()).sort((left, right) => {
    if (right.count !== left.count) {
      return right.count - left.count;
    }

    const leftLabel = `${left.left} | ${left.right}`;
    const rightLabel = `${right.left} | ${right.right}`;

    return leftLabel.localeCompare(rightLabel);
  });

  const dataset = frequencyRows.map((entry, index) => ({
    [PREPARED_X_AXIS_KEY]: input.chartType === "scatter" ? index + 1 : `${entry.left} | ${entry.right}`,
    [PREPARED_Y_AXIS_KEY]: entry.count,
    [PREPARED_GROUP_LABEL_KEY]: `${entry.left} | ${entry.right}`,
  }));

  const skippedReason = summarizeSkipReasons(skipReasons);
  const rowsSkipped = input.data.length - validRowCount;
  const baseMessage = dataset.length > 0
    ? `${validRowCount} of ${input.data.length} rows were visualized and aggregated into ${dataset.length} frequency pairs.`
    : "No valid categorical pairs are available for frequency analysis.";

  return {
    ...result,
    dataset,
    status: dataset.length > 0 ? "success" : "empty",
    visualizationType: "categorical_categorical",
    rowsPlotted: validRowCount,
    rowsSkipped,
    skippedReason,
    message: skippedReason && dataset.length > 0 ? `${baseMessage} Skipped rows: ${skippedReason}.` : baseMessage,
    xAxisLabel: `${input.xAxisField} + ${input.yAxisField}`,
    yAxisLabel: "Frequency",
    scatterXAxisType: "number",
    scatterYAxisType: "number",
  };
}

export function prepareVisualizationData(
  input: VisualizationPreparationInput
): VisualizationPreparationResult {
  const xAxisFieldType = classifyField(input.data, input.xAxisField);
  const yAxisFieldType = classifyField(input.data, input.yAxisField);

  const result = createBaseResult(input, xAxisFieldType, yAxisFieldType);

  if (!input.xAxisField || !input.yAxisField) {
    return {
      ...result,
      status: "unsupported",
      message: "Select both X and Y fields to prepare the visualization.",
    };
  }

  if (xAxisFieldType === "text" || yAxisFieldType === "text") {
    return {
      ...result,
      status: "unsupported",
      message: "One selected field appears to be free-form text. Choose numeric, datetime, or categorical fields for visualization.",
    };
  }

  if (xAxisFieldType === "unknown" || yAxisFieldType === "unknown") {
    return {
      ...result,
      status: "unsupported",
      message: "The selected fields do not contain enough valid values to prepare a visualization.",
    };
  }

  if (xAxisFieldType === "numeric" && yAxisFieldType === "numeric") {
    return prepareNumericNumeric(input, result);
  }

  const isDatetimeNumericPair =
    (xAxisFieldType === "datetime" && yAxisFieldType === "numeric")
    || (xAxisFieldType === "numeric" && yAxisFieldType === "datetime");

  if (isDatetimeNumericPair) {
    return prepareDatetimeNumeric(input, result, xAxisFieldType);
  }

  const isCategoricalNumericPair =
    (xAxisFieldType === "categorical" && yAxisFieldType === "numeric")
    || (xAxisFieldType === "numeric" && yAxisFieldType === "categorical");

  if (isCategoricalNumericPair) {
    return prepareCategoricalNumeric(input, result, xAxisFieldType);
  }

  if (xAxisFieldType === "categorical" && yAxisFieldType === "categorical") {
    return prepareCategoricalCategorical(input, result);
  }

  return {
    ...result,
    status: "unsupported",
    message: "This field combination cannot be transformed into a meaningful visualization.",
  };
}
