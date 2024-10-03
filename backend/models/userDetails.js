const mongoose = require('mongoose');

const userDetailsSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    nationality: { type: String, required: true },
    nationalityfile: { type: String, required: true },
    birthday: { type: Date, required: true },
    working: { type: String, required: true },
    salary: { type: Number, required: true },
    emiratesId: { type: String },
    passportCopy: { type: String }, 
    salaryStatements: [{ type: String }]  
}, { timestamps: true });

module.exports = mongoose.model('UserDetails', userDetailsSchema);

