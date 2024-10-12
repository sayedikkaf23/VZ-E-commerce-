const mongoose = require('mongoose');

const userDetailsSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    nationality: { type: String, required: true },
    birthday: { type: Date, required: true },
    resident: { type: String, required: true }, // added 'resident' field
    working: { type: String, required: true },
    salary: { type: Number, required: true },
    companyname: { type: String, required: true }, // added 'companyname' field
    Bank: { type: String, required: true } // added 'Bank' field
}, { timestamps: true });

module.exports = mongoose.model('UserDetails', userDetailsSchema);
