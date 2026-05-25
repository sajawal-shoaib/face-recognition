import React, { useState, useEffect } from "react";
import UploadForm    from "./components/UploadForm.jsx";
import ResultCard    from "./components/ResultCard.jsx";
import HistoryTable  from "./components/HistoryTable.jsx";
import TrainPanel    from "./components/TrainPanel.jsx";


export default function App() {
  const [result,  setResult]  = useState(null);
  const [history, setHistory] = useState([]);
  const [status,  setStatus]  = useState("checking...");

  useEffect(() => {
    fetch("http://localhost:5000/api/health")
      .then(r => r.json())
      .then(d => setStatus(d.model_trained ? "✅ Model ready" : "⚠️ Not trained yet"))
      .catch(() => setStatus("❌ Service offline"));
    loadHistory();
  }, []);

  const loadHistory = () =>
    fetch("http://localhost:5000/api/history")
      .then(r => r.json())
      .then(setHistory)
      .catch(console.error);

  const handleResult = (data) => {
    setResult(data);
    loadHistory();
  };

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1 style={styles.title}>🧠 Face Recognition</h1>
        <span style={styles.badge}>{status}</span>
      </header>

      <main style={styles.main}>
        <div style={styles.left}>
          <TrainPanel />
          <UploadForm onResult={handleResult} />
        </div>
        <div style={styles.right}>
          {result && <ResultCard result={result} />}
          <HistoryTable history={history} />
        </div>
      </main>
    </div>
  );
}

const styles = {
  app:    { fontFamily:"Segoe UI, sans-serif", minHeight:"100vh", background:"#0f172a", color:"#e2e8f0" },
  header: { display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"1.5rem 2rem", background:"#1e293b", borderBottom:"1px solid #334155" },
  title:  { margin:0, fontSize:"1.5rem" },
  badge:  { background:"#0f172a", padding:"0.4rem 1rem", borderRadius:"999px", fontSize:"0.85rem" },
  main:   { display:"flex", gap:"2rem", padding:"2rem", flexWrap:"wrap" },
  left:   { display:"flex", flexDirection:"column", gap:"1.5rem", flex:"0 0 340px" },
  right:  { flex:1, display:"flex", flexDirection:"column", gap:"1.5rem" },
};