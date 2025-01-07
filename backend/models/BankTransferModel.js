const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bankTransferSchema = new Schema({
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
    quotePaymentId:String,
    partPayment: Number,
    fromCurrency: String,
    toCurrency: String,
    proformaInvoiceNumber: String,
    amountPaid: Number,
    currencyPaid: String,
  },
  customerDetails: {
    name: String,
    id: String,
  },
  fileUpload: [String],
  status: {
    type: String,
    default: 'Pending',
  },
  generalLedgerCode: {
    type: String,
  },
  BankNameCode: {
    type: String,
  },
  
  quoteId: { type: String}, // Assuming quoteId should be unique
});

const BankTransfer = mongoose.model('BankTransfer', bankTransferSchema);
module.exports = BankTransfer;