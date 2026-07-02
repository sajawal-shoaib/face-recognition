import React, { useState, useEffect } from "react";
import UploadForm    from "./components/UploadForm.jsx";
import ResultCard    from "./components/ResultCard.jsx";
import HistoryTable  from "./components/HistoryTable.jsx";
import TrainPanel    from "./components/TrainPanel.jsx";

// Use the Vercel env variable automatically, or fall back to local if coding at home
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://face-recognition-backend-o4x9.onrender.com";

export default function App() {
  const [result,  setResult]  = useState(null);
  const [history, setHistory] = useState([]);
  const [status,  setStatus]  = useState("checking...");

  useEffect(() => {
    // Fixed: Now calling your real live production endpoint
    fetch(`${API_BASE_URL}/api/predict`)
      .then(r => r.json())
      .then(d => setStatus(d.model_trained ? "✅ Model ready" : "⚠️ Not trained yet"))
      .catch(() => setStatus("❌ Service offline"));
    loadHistory();
  }, []);

  const loadHistory = () =>
    // Fixed: Swapped out localhost for your production API base link
    fetch(`${API_BASE_URL}/api/history`)
      .then(r => r.json())
      .then(setHistory)
      .catch(console.error);

  const handleResult = (data) => {
    setResult(data);
    loadHistory();
  };

  // ... rest of your code (getBadgeStyle, return UI, and styles) remains exactly the same!

  // Dynamically change badge glow based on server status
  const getBadgeStyle = () => {
    if (status.includes("✅")) return { ...styles.badge, ...styles.badgeReady };
    if (status.includes("⚠️")) return { ...styles.badge, ...styles.badgeWarning };
    return { ...styles.badge, ...styles.badgeOffline };
  };

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.logoContainer}>
          <h1 style={styles.title}>🧠 Face Recognition</h1>
          <span style={styles.subtitle}>Deep Learning Analytics Platform</span>
        </div>
        <span style={getBadgeStyle()}>{status}</span>
      </header>

      <main style={styles.main}>
        <div style={styles.left}>
          <div style={styles.cardWrapper}><TrainPanel /></div>
          <div style={styles.cardWrapper}><UploadForm onResult={handleResult} /></div>
        </div>
        <div style={styles.right}>
          {result && (
            <div style={{ ...styles.cardWrapper, ...styles.pulseAnimation }}>
              <ResultCard result={result} />
            </div>
          )}
          <div style={styles.cardWrapper}><HistoryTable history={history} /></div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  // Global App Container (Rich Slate Dark Theme)
  app: {
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #020617 100%)",
    color: "#f8fafc",
    WebkitFontSmoothing: "antialiased"
  },
  
  // Sleek Header Navbar with Glassmorphism
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1rem 3rem",
    background: "rgba(30, 41, 59, 0.7)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(51, 65, 85, 0.5)",
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "0 4px 20px -2px rgba(0,0,0,0.3)"
  },
  logoContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "2px"
  },
  title: {
    margin: 0,
    fontSize: "1.4rem",
    fontWeight: "700",
    letterSpacing: "-0.025em",
    background: "linear-gradient(to right, #38bdf8, #818cf8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent"
  },
  subtitle: {
    fontSize: "0.75rem",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.05em"
  },

  // Interactive Dynamic Badges
  badge: {
    padding: "0.5rem 1.2rem",
    borderRadius: "12px",
    fontSize: "0.85rem",
    fontWeight: "600",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    border: "1px solid transparent",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
  },
  badgeReady: {
    background: "rgba(16, 185, 129, 0.1)",
    color: "#34d399",
    borderColor: "rgba(16, 185, 129, 0.2)",
    boxShadow: "0 0 15px rgba(16, 185, 129, 0.15)"
  },
  badgeWarning: {
    background: "rgba(245, 158, 11, 0.1)",
    color: "#fbbf24",
    borderColor: "rgba(245, 158, 11, 0.2)",
    boxShadow: "0 0 15px rgba(245, 158, 11, 0.15)"
  },
  badgeOffline: {
    background: "rgba(239, 68, 68, 0.1)",
    color: "#f87171",
    borderColor: "rgba(239, 68, 68, 0.2)",
    boxShadow: "0 0 15px rgba(239, 68, 68, 0.15)"
  },

  // Layout Grid
  main: {
    display: "flex",
    gap: "2.5rem",
    padding: "3rem",
    maxWidth: "1400px",
    margin: "0 auto",
    flexWrap: "wrap"
  },
  left: {
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
    flex: "1 1 380px"
  },
  right: {
    flex: "2 1 500px",
    display: "flex",
    flexDirection: "column",
    gap: "2rem"
  },

  // Interactive Container Wrappers for Child Components
  cardWrapper: {
    background: "#1e293b",
    borderRadius: "16px",
    border: "1px solid #334155",
    padding: "1.5rem",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
    cursor: "pointer",
    // Clean subtle hover state setup
    ":hover": {
      transform: "translateY(-2px)",
      borderColor: "#475569",
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.4)"
    }
  }
};
