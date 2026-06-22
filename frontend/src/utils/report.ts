import type { AnomalyCategory, DatasetSummary } from "../types/report";

export function normalizeRiskLevel(riskLevel: string): string {
  const normalized = riskLevel.trim().replaceAll("_", " ");
  return normalized || "Not classified";
}

export function getRiskTone(riskLevel: string): "low" | "medium" | "high" | "neutral" {
  const normalized = riskLevel.toLowerCase();

  if (normalized.includes("critical") || normalized.includes("high")) {
    return "high";
  }

  if (normalized.includes("medium") || normalized.includes("moderate")) {
    return "medium";
  }

  if (normalized.includes("low")) {
    return "low";
  }

  return "neutral";
}

function extractInteger(source: string, key: string): number | null {
  const match = source.match(
    new RegExp(`(?:['"])?${key}(?:['"])?\\s*:\\s*(\\d+)`, "i"),
  );

  return match ? Number(match[1]) : null;
}

function parseListValues(source: string): string[] {
  const quotedValues = Array.from(
    source.matchAll(/'([^']*)'|"([^"]*)"/g),
    (match) => (match[1] ?? match[2]).trim(),
  ).filter(Boolean);

  if (quotedValues.length > 0) {
    return quotedValues;
  }

  return source
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value && value !== "None" && value !== "null")
    .map((value) => value.replace(/^['"]|['"]$/g, ""));
}

function extractList(source: string, key: string): string[] {
  const match = source.match(
    new RegExp(`(?:['"])?${key}(?:['"])?\\s*:\\s*\\[([^\\]]*)\\]`, "i"),
  );

  return match ? parseListValues(match[1]) : [];
}

export function parseDatasetSummary(source: string): DatasetSummary {
  return {
    rowCount: extractInteger(source, "row_count"),
    columnCount: extractInteger(source, "column_count"),
    columns: extractList(source, "columns"),
  };
}

export function parseAnomalies(source: string): AnomalyCategory[] {
  const categories: AnomalyCategory[] = [];
  const categoryPattern = /['"]([^'"]+)['"]\s*:\s*\[([^\]]*)\]/g;

  for (const match of source.matchAll(categoryPattern)) {
    categories.push({
      category: humanizeLabel(match[1]),
      values: parseListValues(match[2]),
    });
  }

  return categories;
}

export function parseInsights(source: string): string[] {
  const normalized = source.trim().replace(/\\n/g, "\n");
  const listValues = parseListValues(
    normalized.replace(/^\s*\[|\]\s*$/g, ""),
  );

  if (/^\s*\[/.test(normalized) && listValues.length > 0) {
    return listValues;
  }

  return splitHumanReadableItems(normalized);
}

export function parseRecommendations(source: string): string[] {
  return splitHumanReadableItems(source);
}

function splitHumanReadableItems(source: string): string[] {
  const normalized = source
    .trim()
    .replace(/\\n/g, "\n")
    .replace(/^\s*\[|\]\s*$/g, "");

  if (!normalized) {
    return [];
  }

  const lines = normalized
    .split(/\n+/)
    .map(cleanListPrefix)
    .filter(Boolean);

  if (lines.length > 1) {
    return lines;
  }

  return normalized
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map(cleanListPrefix)
    .filter(Boolean);
}

function cleanListPrefix(value: string): string {
  return value
    .replace(/^#{1,6}\s*/, "")
    .replace(/^\s*(?:[-*•]+|\d+[.)])\s*/, "")
    .replace(/^['"]|['"]$/g, "")
    .trim();
}

export function humanizeLabel(value: string): string {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
