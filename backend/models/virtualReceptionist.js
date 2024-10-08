const mongoose = require('mongoose');

const virtualReceptionistSchema = new mongoose.Schema({
    applicantDetails: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        nationality: { type: String, required: true }
    },
    companyName: { type: String, required: true },
    serviceRequirements: { type: String, required: true }, // E.g., Call forwarding, Appointment booking, etc.
    documents: {
        idProof: { type: String, required: true },
        companyLicense: { type: String } // Optional, if applicable for businesses
    },
    status: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Approved', 'Rejected']
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VirtualReceptionist', virtualReceptionistSchema);
