const mongoose = require('mongoose');

const nationalitySchema = new mongoose.Schema({
  Label: { type: String, required: true },
  Value: { type: String, required: true }
});

const Nationality = mongoose.model('Nationality', nationalitySchema);

module.exports = Nationality;
