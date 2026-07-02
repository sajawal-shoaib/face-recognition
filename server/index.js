const express    = require("express");
const mongoose   = require("mongoose");
const cors       = require("cors");
const multer     = require("multer");
const FormData   = require("form-data");
const fetch      = require("node-fetch");
const Prediction = require("./models/Prediction");

// 1. Core Environment Configuration Mapping Layer
require('dotenv').config();

const app    = express();
const upload = multer({ storage: multer.memoryStorage() });

// 2. Secured Cross-Origin Whitelisting
// 2. Secured Cross-Origin Whitelisting (Flexible Production Arrays)
const allowedOrigins = [
  "http://localhost:5173",
  "https://face-recognition-frontend.vercel.app",
  // 💡 Add your exact Vercel URL here if it looks different in your browser bar:
  // "https://face-recognition-frontend-your-profile.vercel.app" 
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests, or server-to-server)
    if (!origin) return callback(null, true);
    
    // Check if the current request origin exists in our whitelist array
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      callback(new Error("Blocked by CORS Security Architecture"));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.json());

// ── MongoDB ───────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.error("Database connection error:", err));

const PYTHON_URL = process.env.FLASK_SERVICE_URL || "http://127.0.0.1:5000";

// ── POST /api/predict ─────────────────────────────────────
app.post("/api/predict", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image matrix file provided." });

    const form = new FormData();
    form.append("image", req.file.buffer, {
      filename:    req.file.originalname,
      contentType: req.file.mimetype,
    });

    const pyRes  = await fetch(`${PYTHON_URL}/predict`, { method: "POST", body: form });
    const result = await pyRes.json();

    if (!pyRes.ok) return res.status(400).json(result);

    const doc = await Prediction.create({
      filename:      req.file.originalname,
      predicted:     result.predicted,
      confidence:    result.confidence,
      probabilities: result.probabilities,
    });

    res.json({ ...result, id: doc._id, createdAt: doc.createdAt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/train ───────────────────────────────────────
app.post("/api/train", async (req, res) => {
  try {
    const pyRes  = await fetch(`${PYTHON_URL}/train`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ dataset_path: req.body.dataset_path || "dataset" }),
    });
    const result = await pyRes.json();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/history ──────────────────────────────────────
app.get("/api/history", async (req, res) => {
  try {
    const history = await Prediction.find().sort({ createdAt: -1 }).limit(50);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/health ───────────────────────────────────────
app.get("/api/health", async (req, res) => {
  try {
    const pyRes  = await fetch(`${PYTHON_URL}/health`);
    const result = await pyRes.json();
    res.json(result);
  } catch {
    res.status(503).json({ status: "python service unreachable" });
  }
});

// 3. Dynamic Execution Port Binding
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Node pipeline operational on port ${PORT}`));