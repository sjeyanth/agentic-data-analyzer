export function normalizeRiskLevel(riskLevel: string): string {
  const normalized = riskLevel.trim().replaceAll("_", " ");
  return normalized || "Not classified";
}

export function getRiskTone(
  riskLevel: string,
): "low" | "medium" | "high" | "neutral" {

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

export function humanizeLabel(value: string): string {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}