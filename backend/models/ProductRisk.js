const mongoose = require('mongoose');

const productRiskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required']
  },
  description: String,
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: 0
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: 1
  },
  risk: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    required: [true, 'Risk level is required']
  }
});

const ProductRisk = mongoose.model('ProductRisk', productRiskSchema);

module.exports = ProductRisk;
