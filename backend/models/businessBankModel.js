const mongoose = require('mongoose');

const businessBankSchema = new mongoose.Schema({
    isActive: {
        type: Boolean,
        required: true
    },
    documentType: {
        type: String,
        required: true
    }
});

const BusinessBank = mongoose.model('BusinessBank', businessBankSchema);
module.exports = BusinessBank;
