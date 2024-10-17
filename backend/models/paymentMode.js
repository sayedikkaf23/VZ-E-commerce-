const mongoose = require("mongoose");

const paymentModeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    strict: true,
    timestamps: true,
  }
);

module.exports = mongoose.model("paymentMode", paymentModeSchema);