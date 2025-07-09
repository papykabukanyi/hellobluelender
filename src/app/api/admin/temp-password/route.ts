import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

// In-memory storage for temp passwords (in production, use Redis or database)
const tempPasswords = new Map<string, {
  hashedPassword: string;
  email: string;
  permissions: any;
  expires: Date;
  username?: string;
}>();

export async function POST(request: NextRequest) {
  try {
    const { email, permissions, username } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Generate temporary password
    const tempPassword = crypto.randomBytes(12).toString('hex').slice(0, 12);
    const hashedTempPassword = await bcrypt.hash(tempPassword, 10);
    
    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Store temporary password (expires in 24 hours)
    tempPasswords.set(token, {
      hashedPassword: hashedTempPassword,
      email,
      permissions,
      username,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    // Send email with temporary password and setup link
    try {
      const emailContent = `
        <h2>Welcome to Blue Lender Admin Portal</h2>
        <p>An administrator account has been created for you with the following details:</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Your Account Details:</h3>
          <p><strong>Email:</strong> ${email}</p>
          ${username ? `<p><strong>Username:</strong> ${username}</p>` : ''}
          <p><strong>Temporary Password:</strong> <code style="background-color: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${tempPassword}</code></p>
        </div>

        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <h3>Your Access Permissions:</h3>
          <ul>
            <li>View Applications: ${permissions.viewApplications ? '✅ Yes' : '❌ No'}</li>
            <li>Manage Admins: ${permissions.manageAdmins ? '✅ Yes' : '❌ No'}</li>
            <li>Manage SMTP: ${permissions.manageSmtp ? '✅ Yes' : '❌ No'}</li>
            <li>Manage Recipients: ${permissions.manageRecipients ? '✅ Yes' : '❌ No'}</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/setup-password?token=${token}" 
             style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
            Complete Account Setup
          </a>
        </div>

        <p><strong>Important:</strong></p>
        <ul>
          <li>This temporary password expires in 24 hours</li>
          <li>You must click the setup link to create your permanent password</li>
          <li>Save your login credentials in a secure location</li>
        </ul>

        <p>If you have any questions, please contact your system administrator.</p>
      `;

      const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject: 'Blue Lender Admin Account Created - Complete Your Setup',
          html: emailContent,
        }),
      });

      if (!emailResponse.ok) {
        console.error('Failed to send email:', await emailResponse.text());
        return NextResponse.json({ 
          error: 'Failed to send setup email',
          tempPassword, // Return temp password for manual sharing if email fails
          setupLink: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/setup-password?token=${token}`
        }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Admin account created and setup email sent',
        setupLink: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/setup-password?token=${token}`
      });

    } catch (emailError) {
      console.error('Email sending error:', emailError);
      return NextResponse.json({ 
        error: 'Failed to send setup email',
        tempPassword, // Return temp password for manual sharing
        setupLink: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/setup-password?token=${token}`
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error creating admin with temp password:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const tempData = tempPasswords.get(token);
    if (!tempData) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    if (tempData.expires < new Date()) {
      tempPasswords.delete(token);
      return NextResponse.json({ error: 'Token has expired' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true,
      email: tempData.email,
      username: tempData.username,
      permissions: tempData.permissions
    });

  } catch (error) {
    console.error('Error validating token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { token, tempPassword, newPassword } = await request.json();

    if (!token || !tempPassword || !newPassword) {
      return NextResponse.json({ error: 'Token, temporary password, and new password are required' }, { status: 400 });
    }

    const tempData = tempPasswords.get(token);
    if (!tempData) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    if (tempData.expires < new Date()) {
      tempPasswords.delete(token);
      return NextResponse.json({ error: 'Token has expired' }, { status: 400 });
    }

    // Verify temporary password
    const isValidTempPassword = await bcrypt.compare(tempPassword, tempData.hashedPassword);
    if (!isValidTempPassword) {
      return NextResponse.json({ error: 'Invalid temporary password' }, { status: 400 });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Create the actual admin account
    const createAdminResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/manage-admins`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: tempData.email,
        username: tempData.username,
        password: hashedNewPassword,
        permissions: tempData.permissions,
        isHashedPassword: true // Flag to indicate password is already hashed
      }),
    });

    if (!createAdminResponse.ok) {
      const errorData = await createAdminResponse.json();
      return NextResponse.json({ error: errorData.error || 'Failed to create admin account' }, { status: 500 });
    }

    // Clean up temporary password
    tempPasswords.delete(token);

    // Send confirmation email
    try {
      const confirmationEmailContent = `
        <h2>Account Setup Complete!</h2>
        <p>Your Blue Lender admin account has been successfully created and activated.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Your Login Details:</h3>
          <p><strong>Email:</strong> ${tempData.email}</p>
          ${tempData.username ? `<p><strong>Username:</strong> ${tempData.username}</p>` : ''}
          <p><strong>Password:</strong> The password you just created</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/login" 
             style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
            Login to Admin Portal
          </a>
        </div>

        <p>You can now access the admin portal using your email and the password you created.</p>
      `;

      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: tempData.email,
          subject: 'Blue Lender Admin Account Activated',
          html: confirmationEmailContent,
        }),
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Admin account created successfully',
      loginUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/login`
    });

  } catch (error) {
    console.error('Error completing admin setup:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
