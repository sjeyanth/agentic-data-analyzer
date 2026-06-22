import axios from "axios";

interface ApiErrorBody {
  detail?: string;
  message?: string;
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    if (error.code === "ECONNABORTED") {
      return "The analysis took too long. Please try again.";
    }

    if (!error.response) {
      return "The API is unavailable. Check that the backend is running and try again.";
    }

    return (
      error.response.data?.detail ??
      error.response.data?.message ??
      `The request failed with status ${error.response.status}.`
    );
  }

  return error instanceof Error
    ? error.message
    : "Something unexpected happened. Please try again.";
}
