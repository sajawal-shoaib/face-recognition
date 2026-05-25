const mongoose = require("mongoose");

const PredictionSchema = new mongoose.Schema({
  filename:      { type: String },
  predicted:     { type: String, required: true },
  confidence:    { type: Number, required: true },
  probabilities: { type: Map, of: Number },
}, { timestamps: true });

module.exports = mongoose.model("Prediction", PredictionSchema);