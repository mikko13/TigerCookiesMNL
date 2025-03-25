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
    phone: {
      type: String,
      required: true,
      unique: true,
      match: [
        /^(\+63|0)9\d{9}$/,
        "Please provide a valid Philippine phone number",
      ],
    },
    password: { type: String, required: true },
    address: { type: String },
    gender: { type: String },
    dateOfBirth: { type: String },
    hiredDate: { type: String },
    position: { type: String },
    ratePerHour: { type: Number },
    overtimeRate: { type: Number },
    otp: { type: String },
    otpExpires: { type: Date },
    role: { type: String, default: "employee" },
    isActive: { type: Number, default: 0 },
  },
  { timestamps: true, collection: "empAccounts" }
);

module.exports = mongoose.model("Account", accountSchema);