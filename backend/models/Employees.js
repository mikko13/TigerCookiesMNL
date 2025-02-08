const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    profilePicture: { type: String },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/\S+@\S+\.\S+/, "Please provide a valid email"],
    },
    password: { type: String, required: true },
    address: { type: String },
    gender: { type: String },
    dateOfBirth: { type: String },
    hiredDate: { type: String },
    position: { type: String },
    status: { type: String },
    ratePerHour: { type: Number },
    shift: { type: String },
    otp: { type: String },
    otpExpires: { type: Date },
  },
  { timestamps: true, collection: "empAccounts" }
);

module.exports = mongoose.model("Account", accountSchema);
