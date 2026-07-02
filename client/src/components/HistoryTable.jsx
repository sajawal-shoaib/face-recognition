import React from "react";

export default function HistoryTable({ history }) {
  if (!history.length) return null;

  return (
    <div style={styles.card}>
      <div style={styles.headerContainer}>
        <h2 style={styles.heading}>📜 System Prediction Logs</h2>
        <p style={styles.subheading}>Audited chronological timeline of deep learning runtime inferences.</p>
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              {["Target File", "Classification", "Confidence State", "Timestamp Log"].map((h) => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.map((row) => (
              <tr key={row._id} style={styles.tr}>
                {/* Filename with clean layout clipping */}
                <td style={styles.tdFilename} title={row.filename}>
                  <span style={styles.fileIcon}>📄</span>
                  {row.filename || "—"}
                </td>
                
                {/* Target prediction label match */}
                <td style={styles.tdWinner}>{row.predicted}</td>
                
                {/* Score percentage readout */}
                <td style={styles.td}>
                  <div style={styles.confidenceGrid}>
                    <span style={styles.confidenceText}>{(row.confidence * 100).toFixed(1)}%</span>
                    <div style={styles.miniTrack}>
                      <div style={{ ...styles.miniFill, width: `${row.confidence * 100}%` }} />
                    </div>
                  </div>
                </td>
                
                {/* Clean string format layout for system clock */}
                <td style={styles.tdTime}>
                  {new Date(row.createdAt).toLocaleDateString()} 
                  <span style={styles.timeDivider}>|</span>
                  {new Date(row.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Data Matrix Log Styles
const styles = {
  card: { 
    background: "#1e293b", 
    borderRadius: "16px", 
    padding: "2rem", 
    border: "1px solid rgba(51, 65, 85, 0.7)",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)"
  },
  headerContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    marginBottom: "1.5rem"
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
  tableWrapper: {
    overflowX: "auto",
    borderRadius: "12px",
    border: "1px solid rgba(51, 65, 85, 0.5)",
    background: "#0f172a"
  },
  table: { 
    width: "100%", 
    borderCollapse: "collapse", 
    fontSize: "0.88rem",
    textAlign: "left"
  },
  th: { 
    padding: "1rem 1.25rem", 
    background: "#1e293b",
    borderBottom: "1px solid #334155", 
    color: "#94a3b8",
    fontSize: "0.78rem",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.05em"
  },
  tr: { 
    borderBottom: "1px solid rgba(51, 65, 85, 0.3)",
    transition: "background 0.2s ease",
    // Clean dynamic zebra row highlights setup
    ":hover": {
      background: "rgba(255,255,255,0.02)"
    }
  },
  td: { 
    padding: "1rem 1.25rem", 
    color: "#cbd5e1"
  },
  tdFilename: {
    padding: "1rem 1.25rem", 
    color: "#e2e8f0",
    fontWeight: "500",
    maxWidth: "180px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    alignItems: "center"
  },
  fileIcon: {
    marginRight: "8px",
    opacity: 0.7
  },
  tdWinner: {
    padding: "1rem 1.25rem", 
    color: "#38bdf8", 
    fontWeight: "600",
    letterSpacing: "-0.01em"
  },
  tdTime: {
    padding: "1rem 1.25rem", 
    color: "#64748b",
    fontSize: "0.82rem"
  },
  timeDivider: {
    margin: "0 6px",
    opacity: 0.3
  },
  // Integrated mini micro-charts for inline status rendering
  confidenceGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    width: "100px"
  },
  confidenceText: {
    fontWeight: "600",
    color: "#f1f5f9",
    fontSize: "0.82rem"
  },
  miniTrack: {
    height: "4px",
    width: "100%",
    background: "#1e293b",
    borderRadius: "2px",
    overflow: "hidden"
  },
  miniFill: {
    height: "100%",
    background: "#818cf8",
    borderRadius: "2px"
  }
};