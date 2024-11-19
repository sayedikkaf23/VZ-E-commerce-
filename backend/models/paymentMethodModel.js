// // models/paymentMethodModel.js
// const mongoose = require('mongoose');

// const paymentMethodSchema = new mongoose.Schema({
//   bankTransfer: { type: Boolean, default: false },
//   cardMachine: { type: Boolean, default: false },
//   cashDeposit: { type: Boolean, default: false },
//   cashOverCounter: { type: Boolean, default: false },
//   chequeDeposit: { type: Boolean, default: false },
//   onlinePayment: { type: Boolean, default: false },
//   pcdCheque: { type: Boolean, default: false }
// }, { timestamps: true });

// module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PaymentMethodSchema = new Schema({
  
  chequeDeposit: {
    type: Boolean,
    default: false,
  },
  bankTransfer: {
    type: Boolean,
    default: false,
  },
  onlinePayment: {
    type: Boolean,
    default: false,
  },
  stripePayment: {
    type: Boolean,
    default: false,
  },
  totalpay: {
    type: Boolean,
    default: false,
  },
  magnati: {
    type: Boolean,
    default: false,
  },
  Telr: {
    type: Boolean,
    default: false,
  },
  cashDeposit: {
    type: Boolean,
    default: false,
  },
  cardMachine: {
    type: Boolean,
    default: false,
  },
  cashOverCounter: {
    type: Boolean,
    default: false,
  },
  pcdCheque: {
    type: Boolean,
    default: false,
  },
  admin: {
    type: Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const PaymentMethod = mongoose.model("PaymentMethod", PaymentMethodSchema);
module.exports = PaymentMethod;