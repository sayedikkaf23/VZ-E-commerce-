const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CardMachineSchema = new Schema({
  bankDetails: {
    bank_name: String,
    account_name: String,
    iban_number: String,
    account_number: String,
    swift_code: String,
    bank_address: String,
  },
  transactionDetails: {
    amount: Number,
    partPayment: Number,
    quotePaymentId:String,
    // fromCurrency: String,
    // toCurrency: String,
    proformaInvoiceNumber: String,
    // amountPaid: Number,
    currencyPaid: String,
  },
  customerDetails: {
    name: String,
    id: String,
  },
  // fileUpload: [
  //   {
  //     type: String, // The path or URL to the uploaded file
  //   },
  // ],
  fileUpload: [String],
  
  status: {
    type: String,
    default: 'Pending',
  },
  generalLedgerCode: {
    type: String,
  },
  quoteId: { type: String}, // Assuming quoteId should be unique
});

const CardMachine = mongoose.model('CardMachine', CardMachineSchema);
module.exports = CardMachine;