import { useState } from "react";
import "./App.css";
import { AppHeader } from "./components/AppHeader";
import { EmptyState } from "./components/EmptyState";
import { FileUpload } from "./components/FileUpload";
import { ReportDashboard } from "./components/ReportDashboard";
import { Sidebar } from "./components/Sidebar";
import { StatusMessage } from "./components/StatusMessage";
import { useTheme } from "./hooks/useTheme";
import { getReport, uploadAnalysis, getChartData } from "./services/api";
import type { Report } from "./types/report";
import { getErrorMessage } from "./utils/errors";


function App() {
  const { theme, toggleTheme } = useTheme();
  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<Report | null>(null);

  const [chartData, setChartData] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadReport(id: number) {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = await getReport(id);
      setReport(data);
      
      
      const chartResponse =  await getChartData(id);

      const transformedData =
        chartResponse.machine_id.map(
      (
        machineId: number,
        index: number
      ) => ({
        machine_id: machineId,

        temperature:
          chartResponse.temperature[
            index
          ],

        pressure:
         chartResponse.pressure[
            index
          ],

        vibration:
          chartResponse.vibration[
            index
          ]
      })
   );

setChartData(
  transformedData
);
      
      
      setSuccess(`Report #${data.id} loaded successfully.`);
      window.setTimeout(() => {
        document.getElementById("executive-summary")?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAnalyze() {
    if (!file) {
      setError("Select a CSV file before starting the analysis.");
      return;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Only CSV files can be analyzed.");
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);
    setError("");
    setSuccess("");

    try {
      const upload = await uploadAnalysis(file, setUploadProgress);
      const data = await getReport(upload.report_id);
      setReport(data);

      const chartResponse = await getChartData (  upload.report_id );

      const transformedData =
        chartResponse.machine_id.map(
      (
        machineId: number,
        index: number
      ) => ({
        machine_id: machineId,

        temperature:
          chartResponse.temperature[
            index
          ],

        pressure:
         chartResponse.pressure[
            index
          ],

        vibration:
          chartResponse.vibration[
            index
          ]
      })
   );
   
setChartData(
  transformedData
);


      setSuccess(upload.message);
      window.setTimeout(() => {
        document.getElementById("executive-summary")?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  }

  function navigateTo(target: string) {
    document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="app-shell">
      <Sidebar hasReport={Boolean(report)} onNavigate={navigateTo} />

      <div className="app-main">
        <AppHeader
          onLookup={loadReport}
          onToggleTheme={toggleTheme}
          reportId={report?.id ?? null}
          theme={theme}
        />

        <main className="dashboard-content">
          {(error || success) && (
            <StatusMessage
              message={error || success}
              onDismiss={() => {
                setError("");
                setSuccess("");
              }}
              tone={error ? "error" : "success"}
            />
          )}

          <FileUpload
            file={file}
            isLoading={isLoading}
            onAnalyze={handleAnalyze} 
            onFileSelect={(selectedFile) => {
              setFile(selectedFile);
              setError("");
            }}
            progress={uploadProgress}
          />

          {report ? <ReportDashboard 
          report={report}
          chartData={chartData}
          /> : <EmptyState />}
        </main>

        <footer className="app-footer">
          <span>ForgeAI Manufacturing Intelligence</span>
          <span>Powered by your production data</span>
        </footer>
      </div>
    </div>
  );
}

export default App;
