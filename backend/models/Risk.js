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
  }
}, {
  timestamps: true // adds createdAt and updatedAt
});

module.exports = mongoose.model('Risk', RiskSchema);
