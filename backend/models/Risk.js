// models/Risk.js
const mongoose = require('mongoose');

const RiskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true
  },
  riskRating: {
    type: Number,
    required: true
  },
  countries: {
    type: [String], // Array of strings
    default: []
  }
}, {
  timestamps: true // adds createdAt and updatedAt
});

module.exports = mongoose.model('Risk', RiskSchema);
