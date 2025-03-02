require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/Employees");
const emailService = require("../services/emailService"); // Import the new email service

const router = express.Router();

const generateOTP = () => Math.floor(1000 + Math.random() * 9000);

router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const firstName = user.firstName;
    const otp = generateOTP();
    const hashedOTP = await bcrypt.hash(String(otp), 10);

    // Use the new email service
    const response = await emailService.sendOTPEmail(email, firstName, otp);
    if (!response.success) {
      console.error("Error details:", response.details);
      return res.status(500).json(response);
    }

    user.otp = hashedOTP;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    res.status(200).json(response);
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp)
    return res.status(400).json({ message: "Email and OTP are required." });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    if (!user.otp || Date.now() > user.otpExpires) {
      return res.status(400).json({ message: "OTP expired." });
    }

    const isMatch = await bcrypt.compare(String(otp), user.otp);
    if (!isMatch) return res.status(400).json({ message: "Invalid OTP." });

    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({ message: "OTP verified successfully." });
  } catch (error) {
    console.error("❌ Error verifying OTP:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.post("/reset-password", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res
      .status(400)
      .json({ message: "Email and password are required." });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    res.json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("❌ Error resetting password:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router;
