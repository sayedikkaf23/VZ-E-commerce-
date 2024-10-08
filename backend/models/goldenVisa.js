const mongoose = require('mongoose');

const goldenVisaSchema = new mongoose.Schema({
    applicantDetails: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        nationality: { type: String, required: true }
    },
    visaType: { type: String, required: true }, // e.g., 5-year, 10-year visa
    emiratesId: { type: String },
    visaNumber: { type: String, required: true },
    documents: {
        idProof: { type: String, required: true },
        passportCopy: { type: String, required: true },
        residencyProof: { type: String }
    },
    status: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Approved', 'Rejected']
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GoldenVisa', goldenVisaSchema);
