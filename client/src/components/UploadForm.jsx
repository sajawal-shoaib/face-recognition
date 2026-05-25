import React, { useState, useEffect } from "react";

export default function UploadForm({ onResult }) {
  const [file,    setFile]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleSubmit = async () => {
    if (!file) return setError("Please select a BMP file");
    setError(""); setLoading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res  = await fetch("http://localhost:5000/api/predict", { method:"POST", body:fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Prediction failed");
      onResult(data);
    } catch (e) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  return (
    <div style={card}>
      <h2 style={heading}>Upload Image</h2>
      <label style={dropZone}>
        <input type="file" accept=".bmp" hidden
          onChange={e => { setFile(e.target.files[0]); setError(""); }} />
        {file ? <span>📄 {file.name}</span> : <span>Click to select a <b>.bmp</b> file</span>}
      </label>
      {error && <p style={{ color:"#f87171", margin:"0.5rem 0 0" }}>{error}</p>}
      <button style={btn(loading)} onClick={handleSubmit} disabled={loading}>
        {loading ? "Predicting…" : "🔍 Predict"}
      </button>
    </div>
  );
}

const card    = { background:"#1e293b", borderRadius:"12px", padding:"1.5rem", border:"1px solid #334155" };
const heading = { margin:"0 0 1rem", fontSize:"1.1rem" };
const dropZone= { display:"flex", alignItems:"center", justifyContent:"center", height:"100px",
                  border:"2px dashed #475569", borderRadius:"8px", cursor:"pointer",
                  color:"#94a3b8", marginBottom:"1rem" };
const btn = (loading) => ({
  width:"100%", padding:"0.75rem", borderRadius:"8px", border:"none", cursor:"pointer",
  background: loading ? "#475569" : "#6366f1", color:"#fff", fontWeight:"bold", fontSize:"1rem"
});