// models/pidata.model.js
const mongoose = require('mongoose');



const screeningDetailsSchema = new mongoose.Schema({
  // screeningId: { type: String },
  matchScore: { type: Number }
});


const shareholderSchema = new mongoose.Schema({
  name: { type: String },
  shareholderPercentage: { type: Number },
  dob: { type: Date },
  nationalityshareholder: { type: String },
  passportNumber: { type: String },
  files: [
    {
      name: { type: String },
      url: { type: String },
      _id: mongoose.Schema.Types.ObjectId
    }
  ]
});

const responseSchema = new mongoose.Schema({
  products: [
    {
      productId: { type: String,required: true },
      productName: { type: String },
      productQuantity: { type: Number },
      productUnitPrice: { type: Number }
    }
  ],
  total_including_Vat: { type: Number },
  matchScore: { type: Number },
  leadId: { type: String },
  accountId: { type: String },
  quotePayementId: { type: String }
});


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
    LeadId: String,
 
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
  },
  screeningDetails: screeningDetailsSchema,
  isPayment: {
    type: Boolean,
    default: false // Default value
  },
  isProfile:{
    type: Boolean,
    default: false // Default value
  },
  planname: { type: String },
  tradeLicenseFileUrl: { type: String },
  salesforceResponseMatchScreening: responseSchema, // Added field for Salesforce response
  invoiceDate: { type: String },
  invoiceNumber: { type: String },
  shareholders: [shareholderSchema], // Added shareholders field
   // Add screeningDetails as a sub-document
});

module.exports = mongoose.model('Pidata', pidataSchema);
