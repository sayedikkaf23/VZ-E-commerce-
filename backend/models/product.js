// models/BusinessCategory.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const businessCategorySchema = new Schema({
  name:     { type: String, required: true },
  value:    { type: String, required: true },
  isActive: { type: Boolean, default: true }
});

// if it’s already been defined, reuse it instead of redefining
module.exports = mongoose.models.BusinessCategory
  || mongoose.model('BusinessCategory', businessCategorySchema);
