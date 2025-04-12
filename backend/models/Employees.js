const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    employeeID: { type: String, required: true },
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
      match: [
        /^(\+63|0)9\d{9}$/,
        "Please provide a valid Philippine phone number",
      ],
    },
    password: { type: String, required: true },
    address: { type: String },
    gender: { type: String },
    dateOfBirth: { type: String },
    hiredDate: { type: String, required: true },
    position: { type: String, required: true },
    ratePerHour: { type: Number },
    overtimeRate: { type: Number },
    sssNumber: { type: String },
    philhealthNumber: { type: String },
    pagibigNumber: { type: String },
    isFirstTime: { type: Number, default: 1 },
    otp: { type: String },
    otpExpires: { type: Date },
    role: { type: String, default: "employee" },
    isActive: { type: Number, default: 1 },
  },
  { timestamps: true, collection: "empAccounts" }
);

module.exports = mongoose.model("Account", accountSchema);
