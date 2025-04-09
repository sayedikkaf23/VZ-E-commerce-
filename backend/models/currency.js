// models/currency
const mongoose = require("mongoose");

const currencySchema = new mongoose.Schema(
  {
    Currency_id:{
      type: Number,
      required: true,
    },
    currencyName: {
      type: String,
      required: true,
      uppercase: true 
    },
    
    Vat_percent: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin", // Assuming you have a User model
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin", // Assuming you have a User model
      required: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("Currency_vat", currencySchema);
