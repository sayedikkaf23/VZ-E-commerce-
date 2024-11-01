// models/pidata.model.js
const mongoose = require('mongoose');

const pidataSchema = new mongoose.Schema({
  leadWithDetails: {
    Nationality: String,
    Phone: String,
    Origin__c: String,
    Email: String,
    LeadSource: String,
    Status: String,
    Company: String,
    LastName: String,
    FirstName: String,
    LeadId: String
  },
  quotePaymentWithDetails: {
    Currency: String,
    QuotePaymentId: String,
    AccountId: String
  },
  quoteWithProductDetails: {
    AccountName: String,
    Discount: Number,
    invoiceCurrency: String,
    invoiceDate: String,
    invoiceNumber: String,
    mobile: String,
    oppurtunityId: String,
    ownerId: String,
    partPayment: String,
    paymentLink: String,
    paymentMethod: String,
    product: Array, // Use Array for product objects
    quoteEmail: String,
    quoteId: String,
    quoteName: String,
    quotePaymentId: String,
    quotePdf: {
      ContentType: String,
      name: String,
      pdfContent: String
    },
    sendToPaymentGateway: Boolean,
    status: String,
    subTotal: Number,
    totalIncludingVAT: Number,
    totalPrice: Number
  }
});

module.exports = mongoose.model('Pidata', pidataSchema);
