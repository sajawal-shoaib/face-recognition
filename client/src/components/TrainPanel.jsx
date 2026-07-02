import React, { useState } from "react";

export default function TrainPanel() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleTrain = async () => {
    if (!file) return;

    setLoading(true);
    setLog(null);

    const formData = new FormData();
    formData.append("dataset", file); 

    try {
      // 🚀 Safely enclosed inside the async handler where it belongs!
      const res = await fetch("https://face-recognition-python-nnti.onrender.com/train", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      setLog(data);

      if (res.ok) {
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (e) {
      setLog({ error: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.headerContainer}>
        <h2 style={styles.heading}>🏋️ Train Model</h2>
        <p style={styles.subheading}>Upload your dataset file to initiate deep learning weights optimization.</p>
      </div>

      <label style={styles.uploadZone(file)}>
        <input 
          type="file" 
          onChange={handleFileChange}
          style={styles.hiddenInput} 
          accept=".zip,.json,.csv" 
        />
        <div style={styles.uploadContent}>
          <span style={styles.uploadIcon}>{file ? "📄" : "📁"}</span>
          <span style={styles.uploadText}>
            {file ? file.name : "Click to select dataset file"}
          </span>
          {!file && <span style={styles.uploadSubtext}>Supports .zip, .csv, or .json archives</span>}
        </div>
      </label>
      
      <button 
        style={styles.btn(loading, file)} 
        onClick={handleTrain} 
        disabled={loading || !file}
      >
        {loading ? (
          <div style={styles.loaderContainer}>
            <span style={styles.spinner}></span>
            <span>Optimizing Neural Weights...</span>
          </div>
        ) : (
          "Start Pipeline Training"
        )}
      </button>

      {log && (
        <div style={log.error ? styles.errorLog : styles.successLog}>
          {log.error ? (
            <>
              <span style={styles.logIcon}>❌</span>
              <p style={styles.logText}><strong>Pipeline Error:</strong> {log.error}</p>
            </>
          ) : (
            <>
              <span style={styles.logIcon}>⚡</span>
              <div style={styles.metricsContainer}>
                <p style={styles.logText}><strong>Training Complete!</strong></p>
                <p style={styles.subMetrics}>• Processed Samples: {log.samples}</p>
                {log.history && log.history.length > 0 && (
                  <p style={styles.subMetrics}>
                    • Final Accuracy: <span style={styles.accuracyHighlight}>{(log.history.at(-1).accuracy * 100).toFixed(1)}%</span>
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: "#1e293b",
    borderRadius: "16px",
    padding: "2rem",
    border: "1px solid rgba(51, 65, 85, 0.7)",
    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.2)",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem"
  },
  headerContainer: { display: "flex", flexDirection: "column", gap: "4px" },
  heading: { margin: 0, fontSize: "1.2rem", fontWeight: "600", color: "#f8fafc", letterSpacing: "-0.01em" },
  subheading: { margin: 0, fontSize: "0.8rem", color: "#94a3b8", lineHeight: "1.4" },
  hiddenInput: { display: "none" },
  uploadZone: (hasFile) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem 1.5rem",
    borderRadius: "12px",
    border: hasFile ? "2px solid rgba(56, 189, 248, 0.5)" : "2px dashed #475569",
    background: hasFile ? "rgba(56, 189, 248, 0.04)" : "#0f172a",
    cursor: "pointer",
    transition: "all 0.2s ease-in-out",
    textAlign: "center"
  }),
  uploadContent: { display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" },
  uploadIcon: { fontSize: "2rem", marginBottom: "2px" },
  uploadText: { fontSize: "0.9rem", fontWeight: "500", color: "#e2e8f0" },
  uploadSubtext: { fontSize: "0.75rem", color: "#64748b" },
  btn: (loading, file) => ({
    width: "100%",
    padding: "0.85rem",
    borderRadius: "10px",
    border: "none",
    cursor: loading || !file ? "not-allowed" : "pointer",
    background: loading 
      ? "rgba(71, 85, 105, 0.5)" 
      : !file 
        ? "#334155" 
        : "linear-gradient(135deg, #38bdf8 0%, #4f46e5 100%)",
    color: !file ? "#64748b" : "#ffffff",
    fontWeight: "600",
    fontSize: "0.95rem",
    transition: "all 0.2s ease",
    boxShadow: file && !loading ? "0 4px 14px 0 rgba(56, 189, 248, 0.3)" : "none"
  }),
  loaderContainer: { display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" },
  successLog: { display: "flex", gap: "0.75rem", background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "10px", padding: "1rem" },
  errorLog: { display: "flex", gap: "0.75rem", background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "10px", padding: "1rem" },
  logIcon: { fontSize: "1.1rem", marginTop: "2px" },
  metricsContainer: { display: "flex", flexDirection: "column", gap: "4px" },
  logText: { margin: 0, fontSize: "0.88rem", color: "#f1f5f9" },
  subMetrics: { margin: 0, fontSize: "0.82rem", color: "#94a3b8" },
  accuracyHighlight: { color: "#34d399", fontWeight: "600" }
};