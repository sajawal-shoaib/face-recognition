import React from "react";

export default function ResultCard({ result }) {
  const pct = (v) => (v * 100).toFixed(1) + "%";

  return (
    <div style={styles.card}>
      <div style={styles.headerContainer}>
        <h2 style={styles.heading}>📊 Prediction Analytics</h2>
        <p style={styles.subheading}>Deep learning classification distribution weights output.</p>
      </div>

      {/* Hero Prediction Display */}
      <div style={styles.bigResult}>
        <div style={styles.metaBadge}>MATCH IDENTIFIED</div>
        <span style={styles.name}>{result.predicted}</span>
        <div style={styles.confidenceContainer}>
          <span style={styles.pulseDot}></span>
          <span style={styles.conf}>{pct(result.confidence)} Target Confidence</span>
        </div>
      </div>

      {/* Probability Bars Distribution */}
      <div style={styles.bars}>
        <h3 style={styles.distributionTitle}>Matrix Distribution:</h3>
        {Object.entries(result.probabilities).map(([person, prob]) => {
          const isWinner = person === result.predicted;
          return (
            <div key={person} style={styles.barItem}>
              <div style={styles.barMeta}>
                <span style={isWinner ? styles.winnerLabel : styles.standardLabel}>
                  {person} {isWinner && "🎯"}
                </span>
                <span style={isWinner ? styles.winnerPct : styles.standardPct}>
                  {pct(prob)}
                </span>
              </div>
              <div style={styles.barBg}>
                <div style={{ 
                  ...styles.barFill, 
                  width: pct(prob),
                  background: isWinner 
                    ? "linear-gradient(90deg, #6366f1 0%, #818cf8 100%)" 
                    : "#475569",
                  boxShadow: isWinner ? "0 0 12px rgba(99, 102, 241, 0.4)" : "none"
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Analytics HUD Styles
const styles = {
  card: { 
    background: "#1e293b", 
    borderRadius: "16px", 
    padding: "2rem", 
    border: "1px solid rgba(51, 65, 85, 0.7)",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
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
  bigResult: { 
    display: "flex", 
    flexDirection: "column", 
    alignItems: "center", 
    padding: "1.5rem", 
    background: "linear-gradient(180deg, #0f172a 0%, #020617 100%)", 
    borderRadius: "12px", 
    border: "1px solid rgba(99, 102, 241, 0.15)",
    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.4)"
  },
  metaBadge: {
    fontSize: "0.68rem",
    color: "#818cf8",
    fontWeight: "700",
    letterSpacing: "0.1em",
    background: "rgba(99, 102, 241, 0.1)",
    padding: "2px 8px",
    borderRadius: "4px",
    marginBottom: "0.5rem"
  },
  name: { 
    fontSize: "2.2rem", 
    fontWeight: "800", 
    color: "#ffffff",
    letterSpacing: "-0.025em"
  },
  confidenceContainer: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginTop: "0.4rem"
  },
  pulseDot: {
    width: "6px",
    height: "6px",
    background: "#34d399",
    borderRadius: "50%",
    boxShadow: "0 0 8px #34d399"
  },
  conf: { 
    fontSize: "0.82rem", 
    color: "#94a3b8",
    fontWeight: "500"
  },
  bars: { 
    display: "flex", 
    flexDirection: "column",
    gap: "1rem"
  },
  distributionTitle: {
    margin: "0 0 2px 0",
    fontSize: "0.8rem",
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.05em"
  },
  barItem: {
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  barMeta: { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center"
  },
  winnerLabel: {
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#f8fafc"
  },
  standardLabel: {
    fontSize: "0.9rem",
    fontWeight: "500",
    color: "#94a3b8"
  },
  winnerPct: {
    fontSize: "0.9rem",
    fontWeight: "700",
    color: "#818cf8"
  },
  standardPct: {
    fontSize: "0.9rem",
    fontWeight: "500",
    color: "#64748b"
  },
  barBg: { 
    height: "8px", 
    background: "#0f172a", 
    borderRadius: "999px", 
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.02)"
  },
  barFill: { 
    height: "100%", 
    borderRadius: "999px", 
    transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)" 
  }
};