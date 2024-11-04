const mongoose = require("mongoose");

const shareholderSchema = new mongoose.Schema({
  name: { type: String },
  shareholderPercentage: { type: String },
  dob: { type: Date },
  nationalityshareholder: { type: String },
  passportNumber: { type: String }, // Passport number for identification
  files: [{ name: String, path: String }], // Array of files associated with the shareholder, each with a name and path
});
const MailDetailsSchema = new mongoose.Schema(
  {
  
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, required: true },
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
    LeadId: { type: String }, 
    QuotePaymentId: { type: String }, 

  },
  { timestamps: true }
);

// Export the model using the correct schema name
module.exports = mongoose.model("MailDetails", MailDetailsSchema);