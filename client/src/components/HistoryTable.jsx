import React from "react";
export default function HistoryTable({ history }) {
  if (!history.length) return null;
  return (
    <div style={card}>
      <h2 style={heading}>Prediction History</h2>
      <table style={table}>
        <thead>
          <tr>{["File","Predicted","Confidence","Time"].map(h =>
            <th key={h} style={th}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {history.map(row => (
            <tr key={row._id} style={tr}>
              <td style={td}>{row.filename || "—"}</td>
              <td style={{ ...td, color:"#818cf8", fontWeight:"bold" }}>{row.predicted}</td>
              <td style={td}>{(row.confidence*100).toFixed(1)}%</td>
              <td style={td}>{new Date(row.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const card    = { background:"#1e293b", borderRadius:"12px", padding:"1.5rem", border:"1px solid #334155", overflowX:"auto" };
const heading = { margin:"0 0 1rem", fontSize:"1.1rem" };
const table   = { width:"100%", borderCollapse:"collapse", fontSize:"0.9rem" };
const th      = { textAlign:"left", padding:"0.6rem 0.75rem", borderBottom:"2px solid #334155", color:"#94a3b8" };
const td      = { padding:"0.6rem 0.75rem", borderBottom:"1px solid #1e293b" };
const tr      = { transition:"background 0.2s" };