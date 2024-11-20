const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const onlinePaymentSchema = new Schema({
    transactionDetails: {
      amount: Number,
      partPayment: Number,
      quotePaymentId: String,
      proformaInvoiceNumber: String,
      currencyPaid: String,
    },
    customerDetails: {
      name: String,
      id: String,
    },
    status: {
      type: String,
      default: "Pending",
    },
    paymentType: {
      type: String,
      default: "Online",
    },
    quoteId: {
      type: String,
  }
}, {
    strict: true,
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});

const OnlinePayment = mongoose.model('OnlinePayment', onlinePaymentSchema);

module.exports = OnlinePayment;
