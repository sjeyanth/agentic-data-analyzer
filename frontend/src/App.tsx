import { useState } from "react";
import api from "./services/api";

function App() {
  const [file, setFile] = useState<File | null>(null);

  const [message, setMessage] = useState("");

  const [reportId, setReportId] =
    useState<number | null>(null);

  const [report, setReport] =
    useState<any>(null);

  const loadReport = async (
    id: number
  ) => {
    try {
      const response = await api.get(
        `/reports/${id}`
      );

      setReport(
        response.data
      );
    } catch (error) {
      console.error(
        "Error loading report:",
        error
      );
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert(
        "Please select a CSV file"
      );

      return;
    }

    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    try {
      const response =
        await api.post(
          "/analysis/upload",
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

      const id =
        response.data.report_id;

      setReportId(id);

      setMessage(
        `Report ID: ${id}`
      );

      await loadReport(id);

    } catch (error) {

      console.error(
        "Upload failed:",
        error
      );

      setMessage(
        "Upload failed"
      );
    }
  };

  return (
    <div
      style={{
        padding: "2rem",
      }}
    >
      <h1>
        Manufacturing AI Analyzer
      </h1>

      <input
        type="file"
        accept=".csv"
        onChange={(e) => {
          if (
            e.target.files
          ) {
            setFile(
              e.target.files[0]
            );
          }
        }}
      />

      <br />
      <br />

      <button
        onClick={
          handleUpload
        }
      >
        Analyze
      </button>

      <br />
      <br />

      {message && (
        <p>{message}</p>
      )}

      {report && (
        <div
          style={{
            marginTop:
              "2rem",
          }}
        >
          <hr />

          <h2>
            Report Details
          </h2>

          <p>
            <strong>
              Report ID:
            </strong>{" "}
            {reportId}
          </p>

          <h3>
            Risk Level
          </h3>

          <p>
            {
              report.risk_level
            }
          </p>

          <h3>
            Executive Summary
          </h3>

          <p>
            {
              report.executive_summary
            }
          </p>
        </div>
      )}
    </div>
  );
}

export default App;