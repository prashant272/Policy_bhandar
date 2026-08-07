const axios = require('axios');
const nodemailer = require('nodemailer');

// Brevo SMTP Transporter
const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
  port: process.env.BREVO_SMTP_PORT || 587,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

/**
 * Send OTP via Email using Brevo SMTP
 */
exports.sendEmailOTP = async (toEmail, name, otp) => {
  if (!process.env.BREVO_SMTP_USER || !process.env.BREVO_SMTP_PASS) {
    console.warn('Brevo SMTP credentials missing. Mocking Email OTP:', otp);
    return true;
  }

  try {
    const mailOptions = {
      from: `Policybhandar <${process.env.BREVO_FROM_EMAIL || 'noreply@policybhandar.com'}>`,
      to: toEmail,
      subject: 'Policybhandar Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #4f46e5; text-align: center;">Welcome to Policybhandar!</h2>
          <p>Hi ${name},</p>
          <p>Your verification code is:</p>
          <div style="text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111827; background: #f3f4f6; padding: 10px 20px; border-radius: 8px;">${otp}</span>
          </div>
          <p>This code is valid for 10 minutes. Please do not share it with anyone.</p>
          <p>Best Regards,<br/>Policybhandar Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email OTP sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending Email OTP:', error.message);
    return false;
  }
};

/**
 * Send OTP via WhatsApp API
 */
exports.sendWhatsAppOTP = async (mobileNumber, otp) => {
  const apiKey = process.env.WA_API_KEY;
  const fromNumber = process.env.WA_FROM_NUMBER;

  if (!apiKey || !fromNumber) {
    console.warn('WhatsApp API key or from number missing. Mocking WhatsApp OTP:', otp);
    return true;
  }

  try {
    // Format mobile number (ensure it has +91)
    let formattedNumber = mobileNumber.replace(/[^0-9]/g, '');
    if (formattedNumber.length === 10) {
      formattedNumber = '+91' + formattedNumber;
    } else if (!formattedNumber.startsWith('+')) {
       formattedNumber = '+' + formattedNumber;
    }

    const payload = {
      from: fromNumber, 
      campaignName: "api-test", 
      to: formattedNumber,
      templateName: "otp_verification",
      otp: otp,
      type: "template",
      language: {
          code: "en_GB"
      }
    };

    const res = await axios.post(
      'https://api.aoc-portal.com/v1/whatsapp',
      payload,
      {
        headers: {
          'apikey': apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    if (res.data && res.data.message === "Message Sent Successfully!") {
      console.log(`WhatsApp OTP sent successfully to ${formattedNumber}`);
      return true;
    } else {
      console.error(`WhatsApp OTP failed to send to ${formattedNumber}:`, res.data);
      return false;
    }
  } catch (error) {
    console.error('Error sending WhatsApp OTP:', error.response?.data || error.message);
    return false;
  }
};
