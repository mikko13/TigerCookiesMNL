require("dotenv").config();
const nodemailer = require("nodemailer");
const { google } = require("googleapis");

class EmailService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      "https://developers.google.com/oauthplayground"
    );

    this.oauth2Client.setCredentials({
      refresh_token: process.env.REFRESH_TOKEN,
    });
  }

  async createTransporter() {
    try {
      const accessTokenResponse = await this.oauth2Client.getAccessToken();
      if (!accessTokenResponse || !accessTokenResponse.token) {
        throw new Error("Failed to obtain access token");
      }

      return nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: process.env.EMAIL_USER,
          clientId: process.env.CLIENT_ID,
          clientSecret: process.env.CLIENT_SECRET,
          refreshToken: process.env.REFRESH_TOKEN,
          accessToken: accessTokenResponse.token,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
    } catch (error) {
      
      return nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_APP_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
    }
  }

  async sendEmail(to, subject, htmlContent) {
    try {
      const transporter = await this.createTransporter();
      
      await transporter.verify();
      
      const mailOptions = {
        from: `Tiger Cookies MNL <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html: htmlContent,
      };

      const info = await transporter.sendMail(mailOptions);
      return { success: true, message: "Email sent successfully" };
    } catch (error) {
      return { 
        success: false, 
        message: `Failed to send email: ${error.message}`,
        details: error.stack
      };
    }
  }

  async sendOTPEmail(email, firstName, otp) {
    const htmlContent = `<div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif; background-color: #f9f9f9; border-radius: 10px; text-align: center; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);">
      <div style="background-color: #ffcc00; padding: 15px; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 24px; color: #333;">🔒 Password Reset Request</h1>
      </div>
      <div style="padding: 20px; background-color: #ffffff;">
        <p style="font-size: 18px; color: #555;">Hello <strong>${firstName}</strong>,</p>
        <p style="font-size: 16px; color: #777;">
          You have requested an OTP to change your password. Please use the code below to proceed:
        </p>
        <div style="background-color: #ffcc00; padding: 10px; border-radius: 5px; display: inline-block; margin: 10px 0;">
          <h2 style="margin: 0; font-size: 30px; color: #333; font-weight: bold;">${otp}</h2>
        </div>
        <p style="font-size: 14px; color: #777;">This OTP is valid for 5 minutes. Do not share it with anyone.</p>
        <p style="font-size: 14px; color: #ff0000; font-weight: bold;">If you did NOT request this change, please ignore this email.</p>
      </div>
    </div>`;

    return this.sendEmail(email, "Reset Your Password - OTP Code", htmlContent);
  }
}

module.exports = new EmailService();