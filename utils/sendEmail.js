const nodemailer = require('nodemailer');

const sendResetEmail = async function (email, resetLink){
    //console.log("restet",resetLink);
  const transporter = nodemailer.createTransport({
    host:process.env.EMAIL_HOST,
    port:process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: 'suomynona2309@gmail.com',
    to: email,
    subject: 'Password Reset Request',
    text: "hello",
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendResetEmail };