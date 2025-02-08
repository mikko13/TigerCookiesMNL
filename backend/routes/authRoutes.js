require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const User = require("../models/Employees");
const router = express.Router();
const bcrypt = require("bcryptjs");

const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

const sendMail = async (email, firstName, otp) => {
  try {
    const accessToken = await oauth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: "Tiger Cookies MNL <your-email@gmail.com>",
      to: email,
      subject: "Reset Your Password - OTP Code",
      html: `
        <div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif; background-color: #f9f9f9; border-radius: 10px; text-align: center; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);">
          <div style="background-color: #ffcc00; padding: 15px; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px; color: #333;">🔒 Password Reset Request</h1>
          </div>
          <div style="padding: 20px; background-color: #ffffff;">
            <p style="font-size: 18px; color: #555;">Hello, <strong>${firstName}</strong></p>
            <p style="font-size: 16px; color: #777;">
              You have requested an OTP to change your password. Please use the code below to proceed with resetting your password:
            </p>
            <div style="background-color: #ffcc00; padding: 10px; border-radius: 5px; display: inline-block; margin: 10px 0;">
              <h2 style="margin: 0; font-size: 30px; color: #333; font-weight: bold;">${otp}</h2>
            </div>
            <p style="font-size: 14px; color: #777;">
              This OTP is valid for **5 minutes**. Do not share it with anyone.
            </p>
            <p style="font-size: 14px; color: #ff0000; font-weight: bold;">
              If you did NOT request this change, please ignore this email or contact support immediately.
            </p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;" />
            <p style="font-size: 12px; color: #999;">Tiger Cookies MNL | Secure Login System</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: "OTP sent successfully" };
  } catch (error) {
    return { success: false, message: "Failed to send OTP" };
  }
};

const generateOTP = () => Math.floor(1000 + Math.random() * 9000);

router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const firstName = user.firstName;
    const otp = generateOTP();
    const response = await sendMail(email, firstName, otp);

    user.otp = String(otp);
    user.otpExpires = Date.now() + 5 * 60 * 1000;

    await user.save();

    res.status(response.success ? 200 : 500).json(response);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res
      .status(400)
      .json({ success: false, message: "Email and OTP are required." });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    if (!user.otp || Date.now() > user.otpExpires) {
      return res.status(400).json({ success: false, message: "OTP expired." });
    }

    if (
      String(user.otp).replace(/\s+/g, "") !== String(otp).replace(/\s+/g, "")
    ) {
      return res.status(400).json({ success: false, message: "Invalid OTP." });
    }

    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({ success: true, message: "OTP verified successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

router.post("/reset-password", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required." });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    await user.save();

    res.json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

module.exports = router;
