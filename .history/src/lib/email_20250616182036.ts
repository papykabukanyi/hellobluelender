import nodemailer from 'nodemailer';
import redis from '@/lib/redis';

// Create a reusable transporter object using SMTP transport
const createTransporter = async () => {
  try {
    // First try to get SMTP config from Redis
    const configJson = await redis.get('smtp:config');
    
    if (configJson) {
      const config = JSON.parse(configJson);
      return nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.username,
          pass: config.password,
        },
      });
    }
  } catch (error) {
    console.error('Error getting SMTP config from Redis:', error);
  }
  
  // Fall back to environment variables if Redis config fails
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
    
    const mailOptions = {
      from: process.env.SMTP_FROM || 'Blue Lender <noreply@bluelender.com>',
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
