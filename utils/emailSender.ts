import nodemailer from 'nodemailer';

function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendAccountCreationEmail(userEmail: string, password: string, message: string): Promise<void> {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: '"NCIC Website" <no-reply@ncic.com>',
    to: userEmail,
    subject: 'Your NCIC Admin Account',
    html: `<p>${message}</p><p>Your temporary password is: <strong>${password}</strong></p><p>Please <strong>change your password</strong> after logging in.</p><p>You are blessed!</p>`,
  });
}

export async function sendOtpEmail(userEmail: string, otp: string, name: string): Promise<void> {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: '"NCIC Website" <no-reply@ncic.com>',
    to: userEmail,
    subject: 'Password Reset OTP',
    html: `<p>Hello ${name},</p><p>Your password reset OTP is: <strong style="font-size:24px;letter-spacing:4px">${otp}</strong></p><p>This OTP expires in <strong>15 minutes</strong>.</p><p>If you did not request this, please ignore this email.</p>`,
  });
}
