const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS, // App Password
  },
});

const sendMail = async (to, subject, html) => {
  const mailOptions = {
    from: `${process.env.PROJECT_NAME} <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendMail;
