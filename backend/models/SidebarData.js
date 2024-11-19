const mongoose = require('mongoose');

// Define a schema for the sidebar data
const sidebarSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  prominvoiceText: {
    type: String,
  },
  salesAgent: {
    name: {
      type: String,
    },
    position: {
      type: String,
    },
    phoneNumbers: {
      office: {
        type: String,
      },
      mobile: {
        type: String,
      },
    },
    email: {
      type: String,
    },
  },
});

// Create a model using the schema
const SidebarData = mongoose.model('SidebarData', sidebarSchema);

module.exports = SidebarData;
