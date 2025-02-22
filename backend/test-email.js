const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: "tcookiesmnl@gmail.com",
    clientId:
      "952940653217-an1a1e6bm1ncmpn1neu0bjiust4nm690.apps.googleusercontent.com",
    clientSecret: "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",
    refreshToken:
      "1//04WPMQtALgb45CgYIARAAGAQSNgF-L9IrbNoqiGEbwrbuhuP8z0p7ytV-5GiZjHV932IgnebQQVNdwJwdnLE1_Oq-HnZhXTZX9A",
  },
  tls: {
    rejectUnauthorized: false, // This disables SSL verification
  },
});

async function sendTestEmail() {
  try {
    const info = await transporter.sendMail({
      from: '"Tiger Cookies MNL" <tcookiesmnl@gmail.com>',
      to: "mikko.samaniego123@gmail.com", // Change this
      subject: "Test Email",
      text: "This is a test email from nodemailer",
    });

    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

sendTestEmail();
