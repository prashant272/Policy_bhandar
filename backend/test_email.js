const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'cs3001.bigrock.com', // Outgoing Server
  port: 465,                  // SMTP Port for SSL
  secure: true,               // true for 465
  name: 'ownvibes.in',        // Sent in EHLO/HELO
  auth: {
    user: 'noreplay@ownvibes.in', // Username
    pass: 'Primeimpact12345'       // Password
  }
});

// Setup email data
const mailOptions = {
  from: '"ownvibes" <noreplay@ownvibes.in>', // Sender address
  to: 'prashantkrjha12@gmail.com', // You can change this to your actual email for testing
  subject: 'hello how are you', // Subject line
  text: 'hello how are you', // Plain text body
  html: '<b>hello how are you</b>' // HTML body
};

console.log('Attempting to send email...');

// Send the email
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('Error occurred while sending email:');
    console.error(error);
  } else {
    console.log('Email sent successfully!');
    console.log('Message ID: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  }
});
