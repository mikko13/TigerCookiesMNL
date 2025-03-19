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
    password: { type: String, required: true },
    role: { type: String, default: "admin" },
    isActive: { type: Number, default: 1 },
  },
  { timestamps: true, collection: "adminAccounts" }
);

module.exports = mongoose.model("Admin", adminSchema);