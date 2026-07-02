import React, { useState } from "react";

export default function UploadForm({ onResult }) {
  const [file,    setFile]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleSubmit = async () => {
    if (!file) return setError("Please select a BMP file first.");
    setError(""); 
    setLoading(true);
    
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res  = await fetch("http://localhost:5000/api/predict", { method:"POST", body:fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Prediction failed");
      onResult(data);
    } catch (e) {
      setError(e.message);
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.headerContainer}>
        <h2 style={styles.heading}>🔍 Image Inference</h2>
        <p style={styles.subheading}>Upload a high-resolution bitmap image to parse the deep learning weights grid.</p>
      </div>

      {/* Styled Interactive File Upload Dropzone */}
      <label style={styles.dropZone(file)}>
        <input 
          type="file" 
          accept=".bmp" 
          hidden
          onChange={e => { setFile(e.target.files[0]); setError(""); }} 
        />
        <div style={styles.uploadContent}>
          <span style={styles.uploadIcon}>{file ? "📸" : "🖼️"}</span>
          <span style={styles.uploadText}>
            {file ? file.name : "Select or Drop BMP image"}
          </span>
          {!file && <span style={styles.uploadSubtext}>Standard Windows Bitmap (.bmp) required</span>}
        </div>
      </label>

      {/* Error Indicator Box */}
      {error && (
        <div style={styles.errorContainer}>
          <span style={styles.errorIcon}>⚠️</span>
          <p style={styles.errorText}>{error}</p>
        </div>
      )}

      {/* Modern Processing Action Button */}
      <button 
        style={styles.btn(loading, file)} 
        onClick={handleSubmit} 
        disabled={loading || !file}
      >
        {loading ? (
          <div style={styles.loaderContainer}>
            <span style={styles.spinner}></span>
            <span>Evaluating Neural Network...</span>
          </div>
        ) : (
          "Execute Matrix Prediction"
        )}
      </button>
    </div>
  );
}

// Unified Slate Cyberpunk Design Language
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
  headerContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },
  heading: { 
    margin: 0, 
    fontSize: "1.2rem",
    fontWeight: "600",
    color: "#f8fafc",
    letterSpacing: "-0.01em"
  },
  subheading: {
    margin: 0,
    fontSize: "0.8rem",
    color: "#94a3b8",
    lineHeight: "1.4"
  },
  // Dynamic state dropzone layout
  dropZone: (hasFile) => ({ 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    padding: "2.5rem 1.5rem",
    border: hasFile ? "2px solid rgba(99, 102, 241, 0.5)" : "2px dashed #475569", 
    borderRadius: "12px", 
    cursor: "pointer",
    background: hasFile ? "rgba(99, 102, 241, 0.04)" : "#0f172a",
    transition: "all 0.2s ease-in-out",
    textAlign: "center"
  }),
  uploadContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.5rem"
  },
  uploadIcon: {
    fontSize: "2rem",
    marginBottom: "2px"
  },
  uploadText: {
    fontSize: "0.9rem",
    fontWeight: "500",
    color: "#e2e8f0"
  },
  uploadSubtext: {
    fontSize: "0.75rem",
    color: "#64748b"
  },
  errorContainer: {
    display: "flex",
    gap: "0.5rem",
    alignItems: "center",
    background: "rgba(239, 68, 68, 0.08)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    borderRadius: "10px",
    padding: "0.85rem 1rem",
  },
  errorIcon: {
    fontSize: "1rem"
  },
  errorText: {
    margin: 0,
    fontSize: "0.82rem",
    color: "#f87171",
    fontWeight: "500"
  },
  // Action trigger configurations
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
        : "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", 
    color: !file ? "#64748b" : "#ffffff", 
    fontWeight: "600", 
    fontSize: "0.95rem",
    transition: "all 0.2s ease",
    boxShadow: file && !loading ? "0 4px 14px 0 rgba(99, 102, 241, 0.3)" : "none"
  }),
  loaderContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px"
  }
};