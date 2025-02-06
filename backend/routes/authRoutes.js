const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();

// Email credentials
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mikko.samaniego.cics@ust.edu.ph",
    pass: "Mikko54321?",
  },
  tls: {
    rejectUnauthorized: false, // Disable SSL verification
  },
});


// Function to generate a 4-digit OTP
const generateOTP = () => Math.floor(1000 + Math.random() * 9000);

router.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const otp = generateOTP();

  const mailOptions = {
    from: "tcookiesmnl@gmail.com",
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "OTP sent successfully", otp });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

module.exports = router;
