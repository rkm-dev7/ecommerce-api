const nodemailer = require("nodemailer");
const { smtpUsername, smtpPassword } = require("../secret");
const { logger } = require("../controllers/loggerController");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: smtpUsername,
    pass: smtpPassword,
  },
});

const emailWithNodeMail = async (emailData) => {
  try {
    mailOptions = {
      from: smtpUsername, // sender address
      to: emailData.email, // list of receivers
      subject: emailData.subject, // Subject line
      html: emailData.html, // html body
    };
    const info = await transporter.sendMail(mailOptions);
    logger.log("ingo", "Message sent: %s", info.response);
  } catch (error) {
    logger.log("error", "Error occured while sending email:", error);
    throw error;
  }
};

module.exports = emailWithNodeMail;
