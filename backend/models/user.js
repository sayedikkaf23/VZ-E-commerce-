const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const schema = mongoose.Schema;
const saltRounds = 15;

let user = new schema(
  {
    role_id: { type: schema.Types.ObjectId, ref: "role" },

    email: { type: String, default: "" },

    password: { type: String, default: "" },

    user_name: { type: String, default: "" },

    contact_number: { type: String, default: "" },

    status: { type: Boolean, default: false },

    is_deleted: { type: Boolean, default: false },
  },
  {
    strict: true,
    timestamps: true,
  }
);

/* hash the password before save */
user.pre("save", function (next) {
  let user = this;
  // only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();
  // generate a salt
  bcrypt.genSalt(saltRounds, (err, salt) => {
    if (err) return next(err);
    // hash the password using our new salt
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) return next(err);

      // override the cleartext password with the hashed one
      user.password = hash;
      next();
    });
  });
});

/* user methods */
user.methods.comparePassword = async (password, hashPwsd) => {
  const match = await bcrypt.compare(password, hashPwsd);
  return match ? true : false;
};

module.exports = mongoose.model("user", user);
