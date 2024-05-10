const nodeMailer = require("nodemailer");

const sendEmail = async (options) => {
  //three steps ..
  //1)create a transporter
  const transporter = nodeMailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  //2)define the options
  const mailOptions = {
    from: "ahmad <ahmad@io.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  //3)actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
