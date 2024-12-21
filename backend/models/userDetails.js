const mongoose = require('mongoose');
 
 
 
const shareholderSchema = new mongoose.Schema({
  name: { type: String },
  shareholderPercentage: { type: String },
  dob: { type: Date},
  nationalityshareholder: { type: String }
});
 

const screeningDetailsSchema = new mongoose.Schema({
  // screeningId: { type: String },
  matchScore: { type: Number }
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


const userDetailsSchema = new mongoose.Schema({
 
   type: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, required: true },
    nationality: { type: String },
    birthday: { type: Date },
    resident: { type: String }, // added 'resident' field
    shareholdercount: { type: String }, // added 'resident' field
    working: { type: String},
    salary: String,
    companyname: { type: String }, // added 'companyname' field
    Bank: { type: String }, // added 'Bank' field
    mobileNumber: {
        number: String,
        internationalNumber: String,
        nationalNumber: String,
        e164Number: String,
        countryCode: String,
        dialCode: String
      },
      companylocation: { type: String }, // Added companylocation field
      jurisdiction: { type: String },    // Added jurisdiction field
      shareholder: { type: String },     // Added shareholder field
      Turnover: { type: String },        // Added Turnover field
      shareholders: [shareholderSchema], // Changed to an array of shareholder objects
      screeningDetails: screeningDetailsSchema, // Add screeningDetails as a sub-document
      LeadId: { type: String }, 
      QuotePaymentId: { type: String }, 
      // salesforceResponseMatchScreening: responseSchema // Added field for Salesforce response
}, { timestamps: true });
 
module.exports = mongoose.model('UserDetails', userDetailsSchema);