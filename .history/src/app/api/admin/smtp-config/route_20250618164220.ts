import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';
import nodemailer from 'nodemailer';
import { SMTPConfig } from '@/types';
import { requirePermission } from '@/lib/permissions';

// Get SMTP config
export async function GET(request: NextRequest) {
  try {
    // Verify current admin has permission to manage SMTP
    const currentAdmin = await requirePermission(request, 'manageSmtp');
    
    // If requirePermission returns a NextResponse, it means unauthorized
    if ('status' in currentAdmin && currentAdmin.status === 403) {
      return currentAdmin;
    }
    
    // Get SMTP config from Redis
    const configJson = await redis.get('smtp:config');
    const config = configJson ? JSON.parse(configJson) : null;
    
    // Hide password in response
    if (config && config.password) {
      config.password = '********'; // Mask password
    }
    
    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error('Error getting SMTP config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get SMTP config' },
      { status: 500 }
    );
  }
}

// The Update POST method is removed since SMTP config is managed via .env.local only
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { success: false, error: 'SMTP configuration can only be updated in environment variables (.env.local)' },
    { status: 403 }
  );
}

// Test SMTP connection
export async function PUT(request: NextRequest) {
  try {
    const { testEmail } = await request.json();
    
    if (!testEmail) {
      return NextResponse.json(
        { success: false, error: 'Test email address is required' },
        { status: 400 }
      );
    }
    
    // Get SMTP config from Redis
    const configJson = await redis.get('smtp:config');
    if (!configJson) {
      return NextResponse.json(
        { success: false, error: 'SMTP configuration not found' },
        { status: 404 }
      );
    }
    
    const config: SMTPConfig = JSON.parse(configJson);
    
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.username,
        pass: config.password,
      },
    });
    
    // Send test email
    const info = await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to: testEmail,
      subject: 'Blue Lender SMTP Test',
      html: `
        <h1>SMTP Test</h1>
        <p>This email confirms that your SMTP configuration is working correctly.</p>
        <p>Date: ${new Date().toLocaleString()}</p>
      `,
    });
    
    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('Error testing SMTP configuration:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send test email',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
