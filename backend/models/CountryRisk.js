const mongoose = require("mongoose");

const CountryRiskSchema = new mongoose.Schema({
  country: { type: String, required: true, unique: true },
  RiskRating: { type: Number, required: true },
  Code: { type: String,  unique: true },
  iscode3digit: { type: String, unique: true },
  Override: { type: Number},
   createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin', // replace 'User' with your actual user model name
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
});

module.exports = mongoose.model("CountryRisk", CountryRiskSchema);
