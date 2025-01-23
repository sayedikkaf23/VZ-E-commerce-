const mongoose = require('mongoose');

const personalBankSchema = new mongoose.Schema({
    isActive: {
        type: Boolean,
        required: true,
        default: true
    },
    documentType: {
        type: String,
        required: true
    }
});

const PersonalBank = mongoose.model('PersonalBank', personalBankSchema);
module.exports = PersonalBank;
