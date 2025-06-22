import nodemailer from 'nodemailer';

// Cache the transporter to prevent creating a new one for every email
let cachedTransporter: nodemailer.Transporter | null = null;
let lastTransporterCreationTime: number = 0;
const TRANSPORTER_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

// Create a reusable transporter object using SMTP transport always from env variables
const createTransporter = async () => {
  const currentTime = Date.now();
  
  // Check if we can use the cached transporter
  if (
    cachedTransporter && 
    currentTime - lastTransporterCreationTime < TRANSPORTER_CACHE_DURATION
  ) {
    return cachedTransporter;
  }
  
  // Always use environment variables for SMTP configuration
  const host = process.env.SMTP_HOST || '';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';
  
  if (!host || !user || !pass) {
    throw new Error('Missing SMTP configuration. Check environment variables.');
  }
  
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    // Add connection pool settings for improved reliability
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    // Add timeouts to prevent hanging connections
    connectionTimeout: 10000,
    socketTimeout: 20000,
    // Enable TLS options for security
    tls: {
      rejectUnauthorized: true // Verify TLS certificates
    }
  });
  
  try {
    // Verify connection configuration
    await transporter.verify();
    console.log('SMTP server connection verified');
    
    // Cache the transporter
    cachedTransporter = transporter;
    lastTransporterCreationTime = currentTime;
    
    return transporter;
  } catch (error) {
    console.error('Failed to verify SMTP connection:', error);
    throw error;
  }
};

/**
 * Send an email with robust error handling and retry mechanism
 */
export const sendEmail = async ({ 
  to, 
  subject, 
  html, 
  attachments = [],
  retryCount = 0
}: { 
  to: string | string[]; 
  subject: string; 
  html: string; 
  attachments?: any[];
  retryCount?: number;
}) => {  try {
    // Enhanced validation for input data
    if (!to || (Array.isArray(to) && to.length === 0)) {
      throw new Error('No recipients specified');
    }
    
    if (!subject || !html) {
      throw new Error('Email subject and content are required');
    }
    
    // Validate email format for all recipients
    const validateEmail = (email: string) => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    };
    
    // Filter invalid emails
    let validRecipients: string[] = [];
    if (Array.isArray(to)) {
      validRecipients = to.filter(email => validateEmail(email));
      if (validRecipients.length === 0) {
        throw new Error('No valid email recipients found');
      }
    } else {
      if (!validateEmail(to)) {
        throw new Error('Invalid recipient email format');
      }
      validRecipients = [to];
    }
    
    const transporter = await createTransporter();
    
    // Always use environment variables for from email
    const fromName = process.env.SMTP_FROM_NAME || 'Hempire Enterprise';
    const fromEmail = process.env.SMTP_FROM || 'noreply@hempireenterprise.com';
    const from = `"${fromName}" <${fromEmail}>`;
    
    const mailOptions = {
      from,
      to: Array.isArray(to) ? to.join(',') : to,
      subject,
      html,
      attachments,
      // Add message ID for tracking and deduplication
      messageId: `<${Date.now()}-${Math.random().toString(36).substring(2, 15)}@hempireenterprise.com>`,
      // Add headers for compliance and deliverability
      headers: {
        'X-Priority': '1', // High priority
        'X-Company': 'Hempire Enterprise'
      }
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully: ${info.messageId} to ${mailOptions.to}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    
    // Implement retry mechanism for transient failures
    if (retryCount < 3) {
      console.log(`Retrying email send (attempt ${retryCount + 1})...`);
      return new Promise(resolve => {
        // Exponential backoff: wait longer for each retry
        setTimeout(() => {
          resolve(sendEmail({ 
            to, 
            subject, 
            html, 
            attachments, 
            retryCount: retryCount + 1 
          }));
        }, Math.pow(2, retryCount) * 1000); // 1s, 2s, 4s
      });
    }
    
    return { success: false, error };
  }
};
