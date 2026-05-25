import React, { useState, useEffect } from "react";

export default function TrainPanel() {
  const [path,    setPath]    = useState("dataset");
  const [loading, setLoading] = useState(false);
  const [log,     setLog]     = useState(null);

  const handleTrain = async () => {
    setLoading(true); setLog(null);
    try {
      const res  = await fetch("http://localhost:5000/api/train", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ dataset_path: path })
      });
      const data = await res.json();
      setLog(data);
    } catch (e) { setLog({ error: e.message }); }
    finally { setLoading(false); }
  };

  return (
    <div style={card}>
      <h2 style={heading}>Train Model</h2>
      <input value={path} onChange={e => setPath(e.target.value)}
        placeholder="dataset folder path" style={input} />
      <button style={btn(loading)} onClick={handleTrain} disabled={loading}>
        {loading ? "Training… (may take a minute)" : "🏋️ Train"}
      </button>
      {log && !log.error && (
        <p style={{ color:"#4ade80", marginTop:"0.5rem", fontSize:"0.85rem" }}>
          ✅ Trained on {log.samples} samples. Final accuracy:{" "}
          {(log.history.at(-1).accuracy * 100).toFixed(1)}%
        </p>
      )}
      {log?.error && <p style={{ color:"#f87171", marginTop:"0.5rem" }}>{log.error}</p>}
    </div>
  );
}

const card    = { background:"#1e293b", borderRadius:"12px", padding:"1.5rem", border:"1px solid #334155" };
const heading = { margin:"0 0 1rem", fontSize:"1.1rem" };
const input   = { width:"100%", padding:"0.6rem", borderRadius:"6px", border:"1px solid #475569",
                  background:"#0f172a", color:"#e2e8f0", marginBottom:"0.75rem", boxSizing:"border-box" };
const btn = (loading) => ({
  width:"100%", padding:"0.75rem", borderRadius:"8px", border:"none", cursor:"pointer",
  background: loading ? "#475569" : "#10b981", color:"#fff", fontWeight:"bold"
});