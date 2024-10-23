const mongoose = require('mongoose');



const shareholderSchema = new mongoose.Schema({
  name: { type: String },
  phone: { type: String },
  dob: { type: Date},
  nationalityshareholder: { type: String }
});





const userDetailsSchema = new mongoose.Schema({
 
   type: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, required: true, unique: true },
    nationality: { type: String },
    birthday: { type: Date },
    resident: { type: String }, // added 'resident' field
    working: { type: String},
    salary: { type: Number },
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
}, { timestamps: true });

module.exports = mongoose.model('UserDetails', userDetailsSchema);
