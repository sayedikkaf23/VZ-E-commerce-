// models/paymentMethodModel.js
const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
  bankTransfer: { type: Boolean, default: false },
  cardMachine: { type: Boolean, default: false },
  cashDeposit: { type: Boolean, default: false },
  cashOverCounter: { type: Boolean, default: false },
  chequeDeposit: { type: Boolean, default: false },
  onlinePayment: { type: Boolean, default: false },
  pcdCheque: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);
