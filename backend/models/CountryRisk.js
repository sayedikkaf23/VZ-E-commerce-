const mongoose = require("mongoose");

const CountryRiskSchema = new mongoose.Schema({
  country: { type: String, required: true, unique: true },
  risk: { type: String, required: true }
});

module.exports = mongoose.model("CountryRisk", CountryRiskSchema);
