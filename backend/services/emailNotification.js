require("dotenv").config();
const nodemailer = require("nodemailer");
const { google } = require("googleapis");

class emailNotification {
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
      const mailOptions = {
        from: `Tiger Cookies MNL <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html: htmlContent,
      };

      await transporter.sendMail(mailOptions);
    } catch (error) {}
  }

  async sendOvertimeRequestEmail(
    adminEmail,
    adminName,
    employeeName,
    overtimeTime,
    overtimeNote
  ) {
    const htmlContent = `
      <div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif; background-color: #f9f9f9; border-radius: 10px; text-align: center; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #ffcc00; padding: 15px; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px; color: #333;">⏳ Overtime Request Submitted</h1>
        </div>
        <div style="padding: 20px; background-color: #ffffff;">
          <p style="font-size: 18px; color: #555;">Hello ${adminName},</p>
          <p style="font-size: 16px; color: #777;">
            The employee <strong>${employeeName}</strong> has submitted an overtime request.
          </p>
          <div style="background-color: #ffcc00; padding: 10px; border-radius: 5px; display: inline-block; margin: 10px 0;">
            <h2 style="margin: 0; font-size: 20px; color: #333; font-weight: bold;">Overtime Details</h2>
          </div>
          <p style="font-size: 16px; color: #555;">
            <strong>Time:</strong> ${overtimeTime} hours <br>
            <strong>Note:</strong> ${overtimeNote}
          </p>
          <p style="font-size: 14px; color: #777;">You can log in to the system to review and take action.</p>
          <p style="font-size: 14px; color: #ff0000; font-weight: bold;">This is an automated notification. No reply is needed.</p>
        </div>
      </div>
    `;

    return this.sendEmail(
      adminEmail,
      "Overtime Request Notification",
      htmlContent
    );
  }

  async sendOvertimeStatusEmail(
    employeeEmail,
    employeeName,
    adminName,
    overtimeTime,
    overtimeNote,
    status
  ) {
    const statusColor = status === "Approved" ? "#28a745" : "#dc3545";
    const statusEmoji = status === "Approved" ? "✅" : "❌";

    const htmlContent = `
      <div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif; background-color: #f9f9f9; border-radius: 10px; text-align: center; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);">
        <div style="background-color: ${statusColor}; padding: 15px; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px; color: #ffffff;">Overtime Request ${status} ${statusEmoji}</h1>
        </div>
        <div style="padding: 20px; background-color: #ffffff;">
          <p style="font-size: 18px; color: #555;">Hello ${employeeName},</p>
          <p style="font-size: 16px; color: #777;">
            Your overtime request has been <strong style="color: ${statusColor}">${status}</strong> by ${adminName}.
          </p>
          <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: left;">
            <h2 style="margin: 0 0 10px 0; font-size: 18px; color: #333;">Request Details</h2>
            <p style="margin: 5px 0; font-size: 16px; color: #555;">
              <strong>Hours:</strong> ${overtimeTime} hours<br>
              <strong>Note:</strong> ${overtimeNote || "No note provided"}<br>
              <strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${status}</span><br>
              <strong>Reviewed by:</strong> ${adminName}<br>
              <strong>Review date:</strong> ${new Date().toLocaleDateString()}
            </p>
          </div>
          ${
            status === "Approved"
              ? `<p style="font-size: 16px; color: #28a745;">Your overtime hours will be included in your next payroll calculation.</p>`
              : `<p style="font-size: 16px; color: #777;">If you have any questions regarding this decision, please contact your supervisor.</p>`
          }
          <p style="font-size: 14px; color: #777; margin-top: 30px;">Thank you for your hard work and dedication.</p>
          <p style="font-size: 14px; color: #ff0000; font-weight: bold;">This is an automated notification. No reply is needed.</p>
        </div>
        <div style="padding: 15px; background-color: #f0f0f0; border-radius: 0 0 10px 10px;">
          <p style="margin: 0; font-size: 14px; color: #777;">© ${new Date().getFullYear()} Tiger Cookies MNL</p>
        </div>
      </div>
    `;

    return this.sendEmail(
      employeeEmail,
      `Overtime Request ${status}`,
      htmlContent
    );
  }
}

module.exports = new emailNotification();
