import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

async function sendOtpEmail(receivers: string, otp: string) {
  try {
    const info = await transporter.sendMail({
      from: `"SamaKitaAja" <${process.env.EMAIL}>`, // sender address with service name
      to: receivers, // list of receivers
      subject: 'Your OTP Code', // Subject line
      text: `Dear user,\n\nYour One-Time Password (OTP) is ${otp}. It will expire in 10 minutes.\n\nIf you did not request this, please contact support immediately.\n\nThank you!`, // plain text body
      html: `
      <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
        <h2 style="color: #4CAF50;">Your OTP Code</h2>
        <p>Dear user,</p>
        <p>Your One-Time Password (OTP) is:</p>
        <div style="font-size: 24px; font-weight: bold; color: #4CAF50; text-align: center; border: 1px dashed #ddd; padding: 10px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This OTP is valid for <strong>1 minutes</strong>. Please use it to complete your login.</p>
        <p>If you did not request this code, please ignore this email or contact our support team immediately.</p>
        <hr style="border: 1px solid #ddd; margin: 20px 0;" />
        <p style="font-size: 12px; color: #555;">This is an automated message. Please do not reply to this email.</p>
        <p style="font-size: 12px; color: #555;">&copy; 2024 SamaKitaAja. All rights reserved.</p>
      </div>
      `,
    });

    console.log('OTP email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
}

export default sendOtpEmail;
