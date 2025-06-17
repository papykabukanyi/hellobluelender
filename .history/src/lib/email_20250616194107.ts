import nodemailer from 'nodemailer';
import redis from '@/lib/redis';

// Create a reusable transporter object using SMTP transport always from env variables
const createTransporter = async () => {
  // Always use environment variables for SMTP configuration
  const host = process.env.SMTP_HOST || '';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';
  
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
  
  return transporter;
};

export const sendEmail = async ({ 
  to, 
  subject, 
  html, 
  attachments = [] 
}: { 
  to: string | string[]; 
  subject: string; 
  html: string; 
  attachments?: any[];
}) => {
  try {
    const transporter = await createTransporter();
      // Always use environment variables for from email
    const fromName = process.env.SMTP_FROM_NAME || 'Blue Lender';
    const fromEmail = process.env.SMTP_FROM || 'noreply@bluelender.com';
    const from = `"${fromName}" <${fromEmail}>`;
      const mailOptions = {
      from,
      to: Array.isArray(to) ? to.join(',') : to,
      subject,
      html,
      attachments,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};
