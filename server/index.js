const express    = require("express");
const mongoose   = require("mongoose");
const cors       = require("cors");
const multer     = require("multer");
const FormData   = require("form-data");
const fetch      = require("node-fetch");
const Prediction = require("./models/Prediction");

require('dotenv').config();

const app    = express();
const upload = multer({ storage: multer.memoryStorage() });

const allowedOrigins = [
  "http://localhost:5173",
  "https://face-recognition-frontend-seven.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const cleanOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;

    if (
      allowedOrigins.includes(origin) || 
      allowedOrigins.includes(cleanOrigin) ||
      cleanOrigin.endsWith(".vercel.app")
    ) {
      return callback(null, true);
    } else {
      return callback(new Error("Blocked by CORS Security Architecture"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json());

// ── MongoDB ───────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.error("Database connection error:", err));

const PYTHON_URL = process.env.FLASK_SERVICE_URL || "https://face-recognition-python-nnti.onrender.com";

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
    const pythonStatus = pyRes.ok ? await pyRes.json() : { status: "sleeping" };
    
    res.json({
      status: "online",
      message: "Node pipeline operational",
      pythonService: pythonStatus
    });
  } catch (err) {
    res.json({ 
      status: "online", 
      pythonService: "unreachable" 
    });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Node pipeline operational on port ${PORT}`));