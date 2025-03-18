const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
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
    position: { type: String, required: true },
    role: { type: String, default: "admin" },
  },
  { timestamps: true, collection: "adminAccounts" }
);

module.exports = mongoose.model("Admin", adminSchema);