const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productId: String,
  productName:String,
  productQunatity: Number,
  productUnitPrice: Number,
}, { _id: false });


// Updated schema without the 'qp' nesting
const PiData_Schema = new mongoose.Schema({
  totalPrice: Number,
  totalIncludingVAT: Number,
  partPayment:Number,
  subTotal: Number,
  status: String,
  quotePaymentId:String,
  payment_status:{ type: String, default:"linked not genrated" },
  sendToPaymentGateway: Boolean,
  quoteName: String,
  // quoteId: String,// Assuming quoteId should be unique
  quoteEmail: String,
  product: [productSchema],
  ownerId: String,
  oppurtunityId: String,
  mobile: String,
  invoiceNumber: String,
  invoiceDate: Date,
  invoiceCurrency: String,
  Discount: Number,
  AccountName: String,
  quote_createddate: Date,
  quoteNumber:String,
  userName:String,
  userEmailId:String,
  userPhone:String,
  quotePaymentName:String,
  opportunityOwnerName:String,
  contactEmail:String,
  contactName:String,
  position:String,
  opportunityOwnerPhone:String,
  opportunityName:String,
  opportunityOwnerEmail:String,
  // Add any additional fields you need here
});

const PiData = mongoose.model('PIdata', PiData_Schema);

module.exports = PiData;
