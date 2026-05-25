import React from "react";
export default function ResultCard({ result }) {
  const pct = (v) => (v * 100).toFixed(1) + "%";

  return (
    <div style={card}>
      <h2 style={heading}>Prediction Result</h2>
      <div style={bigResult}>
        <span style={name}>{result.predicted}</span>
        <span style={conf}>{pct(result.confidence)} confident</span>
      </div>
      <div style={bars}>
        {Object.entries(result.probabilities).map(([person, prob]) => (
          <div key={person} style={{ marginBottom:"0.75rem" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"4px" }}>
              <span>{person}</span><span>{pct(prob)}</span>
            </div>
            <div style={barBg}>
              <div style={{ ...barFill, width: pct(prob),
                background: person === result.predicted ? "#6366f1" : "#475569" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const card     = { background:"#1e293b", borderRadius:"12px", padding:"1.5rem", border:"1px solid #334155" };
const heading  = { margin:"0 0 1rem", fontSize:"1.1rem" };
const bigResult= { display:"flex", flexDirection:"column", alignItems:"center", padding:"1rem", background:"#0f172a", borderRadius:"8px", marginBottom:"1.5rem" };
const name     = { fontSize:"2rem", fontWeight:"bold", color:"#818cf8" };
const conf     = { fontSize:"0.9rem", color:"#94a3b8", marginTop:"0.25rem" };
const bars     = { display:"flex", flexDirection:"column" };
const barBg    = { height:"8px", background:"#334155", borderRadius:"4px", overflow:"hidden" };
const barFill  = { height:"100%", borderRadius:"4px", transition:"width 0.4s" };