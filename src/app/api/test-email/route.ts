import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

/**
 * Test endpoint for verifying SMTP configuration
 * GET /api/test-email
 * 
 * Returns information about the email configuration and sends a test email
 * to the configured SMTP_USER, which is also the super admin.
 */
export async function GET(request: NextRequest) {
  try {
    console.log('Testing SMTP configuration...');
    
    // Get SMTP configuration from environment variables
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM;
    const smtpFromName = process.env.SMTP_FROM_NAME;
    
    console.log('SMTP Host:', smtpHost);
    console.log('SMTP Port:', smtpPort);
    console.log('SMTP User:', smtpUser || 'NOT CONFIGURED');
    console.log('SMTP Password configured:', smtpPass ? 'YES' : 'NO');
    console.log('SMTP From:', smtpFrom || 'NOT CONFIGURED');
    console.log('SMTP From Name:', smtpFromName || 'NOT CONFIGURED');
    console.log('Deployment environment:', process.env.NODE_ENV || 'development');
    
    // Check if essential SMTP configuration exists
    if (!smtpHost || !smtpUser || !smtpPass) {
      console.error('Missing critical SMTP configuration');
      return NextResponse.json({
        success: false,
        error: 'Missing critical SMTP configuration. Check environment variables.',
        environment: process.env.NODE_ENV || 'development',
        smtpConfig: {
          SMTP_HOST: smtpHost ? '✓' : '✗ MISSING',
          SMTP_PORT: smtpPort ? '✓' : '✗ MISSING',
          SMTP_USER: smtpUser ? '✓' : '✗ MISSING',
          SMTP_PASS: smtpPass ? '✓' : '✗ MISSING',
          SMTP_FROM: smtpFrom ? '✓' : '✗ MISSING',
          SMTP_FROM_NAME: smtpFromName ? '✓' : '✗ MISSING'
        }
      }, { status: 500 });
    }
      
    // Send the test email to the configured SMTP_USER (super admin)
    const toEmail = smtpUser; // Send to the super admin
    console.log(`Sending test email to ${toEmail}...`);
    
    const result = await sendEmail({
      to: toEmail,
      subject: 'Hempire Enterprise - Email Configuration Test',
      html: `
        <h1>Email Configuration Test</h1>
        <p>If you're receiving this email, your SMTP configuration is working correctly.</p>
        <h2>Environment Information:</h2>
        <ul>
          <li><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</li>
          <li><strong>Deployment Platform:</strong> ${process.env.RAILWAY_ENVIRONMENT ? 'Railway' : (process.env.VERCEL_ENV ? 'Vercel' : 'Local')}</li>
          <li><strong>SMTP Host:</strong> ${smtpHost}</li>
          <li><strong>SMTP Port:</strong> ${smtpPort}</li>
          <li><strong>From Email:</strong> ${smtpFrom || smtpUser}</li>
          <li><strong>From Name:</strong> ${smtpFromName || 'Hempire Enterprise'}</li>
          <li><strong>Date/Time:</strong> ${new Date().toISOString()}</li>
        </ul>
        <p>This is an automated message. Please do not reply.</p>
      `
    });
    
    console.log('Email test result:', result);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Test email sent successfully to ${toEmail}`,
        messageId: result.messageId,
        environment: process.env.NODE_ENV || 'development',
        platform: process.env.RAILWAY_ENVIRONMENT ? 'Railway' : (process.env.VERCEL_ENV ? 'Vercel' : 'Local'),
        smtpConfig: {
          SMTP_HOST: smtpHost,
          SMTP_PORT: smtpPort,
          SMTP_USER: '✓ CONFIGURED',
          SMTP_PASS: '✓ CONFIGURED',
          SMTP_FROM: smtpFrom ? '✓ CONFIGURED' : '✗ USING SMTP_USER',
          SMTP_FROM_NAME: smtpFromName ? '✓ CONFIGURED' : '✗ USING DEFAULT'
        }
      });
    } else {
      console.error('Email sending failed with result:', result);
      return NextResponse.json({
        success: false,
        error: result.error instanceof Error ? result.error.message : String(result.error),
        environment: process.env.NODE_ENV || 'development',
        platform: process.env.RAILWAY_ENVIRONMENT ? 'Railway' : (process.env.VERCEL_ENV ? 'Vercel' : 'Local'),
        smtpConfig: {
          SMTP_HOST: smtpHost,
          SMTP_PORT: smtpPort,
          SMTP_USER: smtpUser ? '✓ CONFIGURED' : '✗ MISSING',
          SMTP_PASS: smtpPass ? '✓ CONFIGURED' : '✗ MISSING',
          SMTP_FROM: smtpFrom ? '✓ CONFIGURED' : '✗ MISSING',
          SMTP_FROM_NAME: smtpFromName ? '✓ CONFIGURED' : '✗ MISSING'
        }
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Test email endpoint error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      environment: process.env.NODE_ENV || 'development',
      platform: process.env.RAILWAY_ENVIRONMENT ? 'Railway' : (process.env.VERCEL_ENV ? 'Vercel' : 'Local'),
      smtpConfig: {
        SMTP_HOST: process.env.SMTP_HOST ? '✓' : '✗ MISSING',
        SMTP_PORT: process.env.SMTP_PORT ? '✓' : '✗ MISSING',
        SMTP_USER: process.env.SMTP_USER ? '✓' : '✗ MISSING',
        SMTP_PASS: process.env.SMTP_PASS ? '✓' : '✗ MISSING',
        SMTP_FROM: process.env.SMTP_FROM ? '✓' : '✗ MISSING',
        SMTP_FROM_NAME: process.env.SMTP_FROM_NAME ? '✓' : '✗ MISSING'
      }
    }, { status: 500 });
  }
}
