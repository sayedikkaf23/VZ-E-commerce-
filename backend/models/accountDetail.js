const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const accountDetailSchema = new Schema({
  bank_name: {
    type: String,
    required: true,
  },
  account_name: {
    type: String,
    required: true,
  },
  iban_number: {
    type: String,
    required: true,
    unique: true, // Enforce uniqueness for iban_number
  },
  account_number: {
    type: String,
    required: true,
  },
  swift_code: {
    type: String,
    required: true,
  },
  bank_address: {
    type: String,
    required: true,
  },
});

const AccountDetail = mongoose.model('AccountDetail', accountDetailSchema);

module.exports = AccountDetail;
