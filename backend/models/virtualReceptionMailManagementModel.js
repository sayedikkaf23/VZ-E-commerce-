const mongoose = require('mongoose');

const commonSchema = new mongoose.Schema({
    isActive: {
        type: Boolean,
        required: true
    },
    documentType: {
        type: String,
        required: true
    }
});

const VirtualReception = mongoose.model('VirtualReception', commonSchema);
const MailManagement = mongoose.model('MailManagement', commonSchema);

module.exports = { VirtualReception, MailManagement };
