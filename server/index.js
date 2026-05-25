const express    = require("express");
const mongoose   = require("mongoose");
const cors       = require("cors");
const multer     = require("multer");
const FormData   = require("form-data");
const fetch      = require("node-fetch");
const Prediction = require("./models/Prediction");

const app    = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// ── MongoDB ───────────────────────────────────────────────
mongoose.connect("mongodb+srv://sajawal:<sajawal202>@interview-ai.xl8zai3.mongodb.net/?appName=INTERVIEW-AI")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

const PYTHON_URL = "http://localhost:5001";

// ── POST /api/predict ─────────────────────────────────────
// Receives BMP from React → forwards to Python → saves to MongoDB
app.post("/api/predict", upload.single("image"), async (req, res) => {
  try {
    // Forward image to Python microservice
    const form = new FormData();
    form.append("image", req.file.buffer, {
      filename:    req.file.originalname,
      contentType: req.file.mimetype,
    });

    const pyRes  = await fetch(`${PYTHON_URL}/predict`, { method: "POST", body: form });
    const result = await pyRes.json();

    if (!pyRes.ok) return res.status(400).json(result);

    // Save to MongoDB
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

app.listen(5000, () => console.log("Node server running on port 5000"));