#!/usr/bin/env node

/**
 * This script verifies that the email functionality is working
 * by sending a test email using the configured SMTP settings.
 * 
 * Usage: node verify-email.js [recipient]
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local if it exists
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  console.log(`Loading environment variables from ${envPath}`);
  dotenv.config({ path: envPath });
}

// Required SMTP variables
const requiredVars = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'SMTP_FROM'
];

// Check for missing variables
const missingVars = requiredVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('\x1b[31m%s\x1b[0m', '❌ Missing required environment variables:');
  missingVars.forEach(varName => console.error(`- ${varName}`));
  process.exit(1);
}

// Get recipient from command line argument or use SMTP_USER
const recipient = process.argv[2] || process.env.SMTP_USER;
if (!recipient) {
  console.error('\x1b[31m%s\x1b[0m', '❌ No recipient specified and SMTP_USER not set.');
  process.exit(1);
}

console.log('\x1b[36m%s\x1b[0m', '📧 Sending test email with current environment configuration');
console.log(`SMTP Host: ${process.env.SMTP_HOST}`);
console.log(`SMTP Port: ${process.env.SMTP_PORT}`);
console.log(`SMTP User: ${process.env.SMTP_USER}`);
console.log(`From: ${process.env.SMTP_FROM || process.env.SMTP_USER}`);
console.log(`From Name: ${process.env.SMTP_FROM_NAME || 'Hempire Enterprise'}`);
console.log(`To: ${recipient}`);

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // Add connection pool settings for improved reliability
  pool: true,
  // Add timeouts to prevent hanging connections
  connectionTimeout: 10000,
  socketTimeout: 20000,
});

// Verify connection
console.log('\x1b[36m%s\x1b[0m', '🔄 Verifying SMTP connection...');
transporter.verify()
  .then(() => {
    console.log('\x1b[32m%s\x1b[0m', '✅ SMTP connection successful!');
    
    // Send test email
    console.log('\x1b[36m%s\x1b[0m', '📤 Sending test email...');
    return transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'Hempire Enterprise'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: recipient,
      subject: 'Hempire Enterprise - Email Configuration Test',
      text: 'This is a test email to verify your SMTP configuration is working correctly.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #336699;">Email Configuration Test</h1>
          <p>If you're receiving this email, your SMTP configuration is working correctly.</p>
          <h2 style="color: #336699;">Environment Information:</h2>
          <ul>
            <li><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</li>
            <li><strong>SMTP Host:</strong> ${process.env.SMTP_HOST}</li>
            <li><strong>SMTP Port:</strong> ${process.env.SMTP_PORT}</li>
            <li><strong>From Email:</strong> ${process.env.SMTP_FROM || process.env.SMTP_USER}</li>
            <li><strong>Test Time:</strong> ${new Date().toLocaleString()}</li>
          </ul>
          <p style="color: #666;">This is an automated test message sent from verify-email.js script.</p>
        </div>
      `,
    });
  })
  .then(info => {
    console.log('\x1b[32m%s\x1b[0m', '✅ Test email sent successfully!');
    console.log(`Message ID: ${info.messageId}`);
    process.exit(0);
  })
  .catch(error => {
    console.error('\x1b[31m%s\x1b[0m', '❌ Error sending email:');
    console.error(error);
    
    // Provide troubleshooting tips based on error
    console.log('\n\x1b[33m%s\x1b[0m', '🔍 Troubleshooting tips:');
    
    if (error.code === 'EAUTH') {
      console.log('- Authentication failed. Check your SMTP_USER and SMTP_PASS.');
      console.log('- If using Gmail, make sure you\'re using an App Password, not your regular password.');
      console.log('- To create an App Password: https://myaccount.google.com/apppasswords');
    }
    
    if (error.code === 'ESOCKET' || error.code === 'ETIMEDOUT') {
      console.log('- Connection to SMTP server failed. Check SMTP_HOST and SMTP_PORT.');
      console.log('- Make sure your network allows connections to the SMTP server.');
      console.log('- Check if your SMTP provider requires SSL/TLS.');
    }
    
    if (error.code === 'EENVELOPE') {
      console.log('- Recipient or sender address is invalid. Check email formats.');
    }
    
    process.exit(1);
  });
