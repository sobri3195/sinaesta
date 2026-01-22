import nodemailer from 'nodemailer';

// For development, we'll use a mock or log to console
// In production, this would use a real SMTP service
export const sendEmail = async (to: string, subject: string, html: string) => {
  console.log(`Sending email to ${to}: ${subject}`);
  console.log(`Content: ${html}`);
  
  // Example of how to use nodemailer if configured
  /*
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
  */
  
  return true;
};

export const sendVerificationEmail = async (to: string, token: string) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
  const html = `
    <h1>Verify Your Email</h1>
    <p>Please click the link below to verify your email address:</p>
    <a href="${verificationUrl}">${verificationUrl}</a>
  `;
  return sendEmail(to, 'Verify Your Email - Sinaesta', html);
};

export const sendPasswordResetEmail = async (to: string, token: string) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
  const html = `
    <h1>Reset Your Password</h1>
    <p>You requested a password reset. Please click the link below to reset your password:</p>
    <a href="${resetUrl}">${resetUrl}</a>
    <p>If you didn't request this, please ignore this email.</p>
  `;
  return sendEmail(to, 'Reset Your Password - Sinaesta', html);
};
