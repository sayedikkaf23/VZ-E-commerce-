const mongoose = require("mongoose");

const ProductRiskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  unitPrice: Number,
  quantity: Number,
  risk: { type: String, enum: ["Low", "Medium", "High"], required: true }
}, { timestamps: true });

// Prevent same product name with same risk
ProductRiskSchema.index({ name: 1, risk: 1 }, { unique: true });

module.exports = mongoose.model("ProductRisk", ProductRiskSchema);
