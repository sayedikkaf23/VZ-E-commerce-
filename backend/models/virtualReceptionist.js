const mongoose = require("mongoose");

const shareholderSchema = new mongoose.Schema({
  name: { type: String },
  shareholderPercentage: { type: String },
  dob: { type: Date },
  nationalityshareholder: { type: String },
  passportNumber: { type: String }, // Passport number for identification
  files: [{
    name: { type: String },
    url: { type: String }
}]

});

const virtualDetailsSchema = new mongoose.Schema(
  {
  
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String},
    nationality: { type: String },
    birthday:{ type: String },
    mobileNumber: {
      number: String,
      internationalNumber: String,
      nationalNumber: String,
      e164Number: String,
      countryCode: String,
      dialCode: String,
    },
    CompanyName: { type: String },
    CompanyIncorporated: { type: String },
    Website: { type: String },
    companylicensed: { type: String },
    tradelicense: { type: String },
    shareholdercount: { type: String },
    shareholders: [shareholderSchema], // Array of shareholder objects
    LeadId: { type: String, index: true }, // Indexed for better performance on lookups
    QuotePaymentId: { type: String, index: true }, 
  },
  { timestamps: true }
);

// Export the model using the correct schema name
module.exports = mongoose.model("VirtualDetails", virtualDetailsSchema);