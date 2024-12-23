const mongoose = require("mongoose");
const schema = mongoose.Schema;

const userSchema = new schema(
  {
    email: { type: String }, // Ensure email is unique
    password: { type: String, required: true },
  },
  {
    strict: true,
    timestamps: true,
  }
);

module.exports = mongoose.model("user", userSchema);
