import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Icon } from "./Icon";

interface FileUploadProps {
  file: File | null;
  isLoading: boolean;
  progress: number;
  onAnalyze: () => void;
  onFileSelect: (file: File | null) => void;
}

export function FileUpload({
  file,
  isLoading,
  progress,
  onAnalyze,
  onFileSelect,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function selectFile(event: ChangeEvent<HTMLInputElement>) {
    onFileSelect(event.target.files?.[0] ?? null);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    onFileSelect(event.dataTransfer.files?.[0] ?? null);
  }

  return (
    <section className="upload-card" id="overview">
      <div className="upload-copy">
        <span className="section-kicker">New analysis</span>
        <h2>Turn production data into decisions.</h2>
        <p>
          Upload a manufacturing CSV. The AI workflow will inspect it for
          anomalies, operational risks, and recommended actions.
        </p>

        <div className="upload-features">
          <span><Icon name="shield" size={16} /> CSV files only</span>
          <span><Icon name="insights" size={16} /> AI-generated report</span>
        </div>
      </div>

      <div
        className={`drop-zone ${isDragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          accept=".csv,text/csv"
          aria-label="Choose CSV file"
          hidden
          onChange={selectFile}
          ref={inputRef}
          type="file"
        />

        <div className="drop-icon">
          <Icon name={file ? "file" : "upload"} size={25} />
        </div>

        {file ? (
          <div className="selected-file">
            <strong title={file.name}>{file.name}</strong>
            <span>{(file.size / 1024).toFixed(1)} KB · Ready to analyze</span>
          </div>
        ) : (
          <div>
            <strong>Drop your CSV here</strong>
            <span>or choose a file from your computer</span>
          </div>
        )}

        <button
          className="secondary-button"
          disabled={isLoading}
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          {file ? "Replace file" : "Browse files"}
        </button>

        {isLoading && (
          <div className="upload-progress" aria-label="Upload progress">
            <span style={{ width: `${Math.max(progress, 8)}%` }} />
          </div>
        )}
      </div>

      <button
        className="analyze-button"
        disabled={!file || isLoading}
        onClick={onAnalyze}
        type="button"
      >
        {isLoading ? (
          <>
            <span className="spinner" />
            {progress < 100 ? `Uploading ${progress}%` : "Running AI analysis"}
          </>
        ) : (
          <>
            Analyze production data
            <Icon name="arrow" size={18} />
          </>
        )}
      </button>
    </section>
  );
}
