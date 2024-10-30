const mongoose = require("mongoose");

const shareholderSchema = new mongoose.Schema({
  name: { type: String },
  shareholderPercentage: { type: String },
  dob: { type: Date },
  nationalityshareholder: { type: String },
  passportNumber: { type: String }, // Passport number for identification
  files: [{ name: String, path: String }], // Array of files associated with the shareholder, each with a name and path
});

const virtualDetailsSchema = new mongoose.Schema(
  {
  
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, required: true},
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
  },
  { timestamps: true }
);

// Export the model using the correct schema name
module.exports = mongoose.model("VirtualDetails", virtualDetailsSchema);