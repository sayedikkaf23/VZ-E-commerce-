const mongoose = require('mongoose');

const accountingVatSchema = new mongoose.Schema({
    applicantDetails: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        nationality: { type: String, required: true }
    },
    companyName: { type: String, required: true },
    vatNumber: { type: String, required: true },
    documents: {
        idProof: { type: String, required: true },
        vatRegistration: { type: String, required: true },
        financialStatements: { type: String }
    },
    status: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Approved', 'Rejected']
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AccountingVat', accountingVatSchema);
