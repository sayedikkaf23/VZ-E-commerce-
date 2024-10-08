const mongoose = require('mongoose');

const mailManagementSchema = new mongoose.Schema({
    applicantDetails: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        nationality: { type: String, required: true }
    },
    companyName: { type: String },
    mailAddress: { type: String, required: true },
    mailPreferences: { type: String }, // E.g., Forwarding, Receiving, etc.
    documents: {
        idProof: { type: String, required: true }
    },
    status: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Approved', 'Rejected']
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MailManagement', mailManagementSchema);
