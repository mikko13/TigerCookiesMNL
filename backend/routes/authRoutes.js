require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const Employee = require("../models/Employees");
const emailService = require("../services/emailService");
const router = express.Router();

const generateOTP = () => Math.floor(1000 + Math.random() * 9000);

router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const user = await Employee.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const otp = generateOTP();
    const hashedOTP = await bcrypt.hash(String(otp), 10);

    const response = await emailService.sendOTPEmail(
      email,
      user.firstName,
      otp
    );
    if (!response.success) {
      return res.status(500).json(response);
    }

    await Employee.updateOne(
      { _id: user._id },
      {
        $set: {
          otp: hashedOTP,
          otpExpires: Date.now() + 5 * 60 * 1000,
        },
      }
    );

    res.status(200).json(response);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
});

router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp)
    return res.status(400).json({ message: "Email and OTP are required." });

  try {
    const user = await Employee.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found." });

    if (!user.otp || Date.now() > user.otpExpires) {
      return res.status(400).json({ message: "OTP expired." });
    }

    const isMatch = await bcrypt.compare(String(otp), user.otp);

    if (!isMatch) return res.status(400).json({ message: "Invalid OTP." });

    await Employee.updateOne(
      { _id: user._id },
      { $set: { otp: null, otpExpires: null } }
    );

    res.json({ success: true, message: "OTP verified successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

router.post("/reset-password", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res
      .status(400)
      .json({ message: "Email and password are required." });

  try {
    const user = await Employee.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Employee.updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword } }
    );

    res.json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

router.post("/", async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await Admin.findOne({ email });
    let role = "admin";

    if (!user) {
      user = await Employee.findOne({ email });
      role = "employee";
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    req.session.user = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: role,
    };

    res
      .status(200)
      .json({ message: "Login successful", user: req.session.user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/session", (req, res) => {
  if (req.session.user) {
    res.status(200).json({ user: req.session.user });
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

module.exports = router;
