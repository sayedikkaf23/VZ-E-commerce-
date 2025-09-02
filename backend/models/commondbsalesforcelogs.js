const mongoose = require('mongoose');

const CommondbSalesforceLogSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  unique_id: {
    type: String,
    required: true
  },
  request: {
    type: mongoose.Schema.Types.Mixed, // or use Object if you want to define strict structure
    required: true
  },
  response: {
    type: mongoose.Schema.Types.Mixed, // or use Object
    required: true
  }
}, {
  collection: 'commondbsalesforcelogs'  // Optional: define collection name explicitly
});

module.exports = mongoose.model('CommondbSalesforceLog', CommondbSalesforceLogSchema);
