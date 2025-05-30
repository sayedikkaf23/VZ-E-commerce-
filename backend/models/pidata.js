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
      type: {type: String},
      _id: mongoose.Schema.Types.ObjectId
    }
  ]
});
 
const responseSchema = new mongoose.Schema({
  products: [
    {
      productId: { type: String,required: true },
      productName: { type: String },
      ProductFamily: { type: String },
      ProductDescription: { type: String },
      risk: { type: String },
      ProductCurrencyName: { type: String },
      productQuantity: { type: Number },
      productUnitPrice: { type: Number },
      ProductDiscount: { type: Number },
      totalPrice: { type: Number },
      totalPriceVat: { type: Number },
      totalPriceVat: { type: Number },
      vat: { type: Number },
    }
  ],
  total_including_Vat: { type: Number },
  totalVAT: { type: Number },
  totalAmount: { type: Number },
  matchScore: { type: Number },
  leadId: { type: String },
  accountId: { type: String },
  quotePayementId: { type: String }
});
 
 
const pidataSchema = new mongoose.Schema(
  {
    leadWithDetails: {
      Nationality: String,
      Phone: String,
      countryCode: String,
      dob: String,
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
      AccountId: String,
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
      // QuotePaymentName: String,
      quotePaymentId: String,
      quotePdf: {
        ContentType: String,
        name: String,
        pdfContent: String,
      },
      sendToPaymentGateway: Boolean,
      status: String,
      subTotal: Number,
      totalIncludingVAT: Number,
      totalPrice: Number,
    },
    screeningDetails: screeningDetailsSchema,
    isPayment: {
      type: Boolean,
      default: false,
    },
    isProfile: {
      type: Boolean,
      default: false,
    },
    isPaymentEmailSent: {
      type: Boolean,
      default: false,
    },
    isProfileEmailSent: {
      type: Boolean,
      default: false,
    },
    planname: { type: String },
    customerType: { type: String },
    subcategory: { type: String },
    tradeLicenseFileUrl: { type: String },
    salesforceResponseMatchScreening: responseSchema,
    invoiceDate: { type: String },
    payment_status: {
      type: String,
      default: "unpaid"
    },
    
    invoiceNumber: { type: String },
    kycStatus: { type: String ,default: 'Pending'},
    shareholders: [shareholderSchema],
    salesPersonDetails: {
      salesPersonEmail: { type: String },
      salesPersonMobile: { type: String },
      salesPersonName: { type: String },
    },
    additionalUploadedFiles: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
        type: { type: String, required: true },
      }
    ],
    uploadedFileNames: [
      {
        name: { type: String },
        url: { type: String },
        type: { type: String },
      }
    ],
  },
  
  {
    timestamps: true, // <<--- This adds createdAt and updatedAt
  }
);
 
 
module.exports = mongoose.model('Pidata', pidataSchema);