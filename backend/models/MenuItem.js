// models/MenuItem.js
const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  link: { type: String, required: true }
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
