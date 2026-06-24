import axios from "axios";
import type { AnalysisUploadResponse, Report } from "../types/report";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000",
  timeout: 120_000,
  headers: {
    Accept: "application/json",
  },
});

export async function uploadAnalysis(
  file: File,
  onUploadProgress?: (progress: number) => void,
): Promise<AnalysisUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<AnalysisUploadResponse>(
    "/analysis/upload",
    formData,
    {
      onUploadProgress: ({ loaded, total }) => {
        if (total) {
          onUploadProgress?.(Math.round((loaded / total) * 100));
        }
      },
    },
  );

  return data;
}

export async function getReport(id: number): Promise<Report> {
  const { data } = await api.get<Report>(`/reports/${id}`);
  return data;
}

export async function getChartData(
  id: number
) {
  const { data } =
    await api.get(
      `/reports/${id}/chart-data`
    );

  return data;
}

export default api;
