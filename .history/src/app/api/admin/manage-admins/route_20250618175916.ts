import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { v4 as uuidv4 } from 'uuid';
import { AdminUser } from '@/types';
import { hashPassword } from '@/lib/auth';
import { requirePermission } from '@/lib/permissions';

// Get all admins
export async function GET(request: NextRequest) {
  try {
    // Verify current admin has permissions
    const currentAdmin = await requirePermission(request, 'manageAdmins');
    
    // If requirePermission returns a NextResponse, it means unauthorized
    if ('status' in currentAdmin && currentAdmin.status === 403) {
      return currentAdmin;
    }
    
    // Get all admin keys
    const adminKeys = await redis.keys('admin:*');
    const admins: AdminUser[] = [];
    
    // Fetch admin details
    for (const key of adminKeys) {
      const adminJson = await redis.get(key);
      if (adminJson) {
        const admin = JSON.parse(adminJson);
        // Remove password from response
        const { password, ...adminWithoutPassword } = admin;
        admins.push(adminWithoutPassword as AdminUser);
      }
    }
    
    return NextResponse.json({ success: true, admins });
  } catch (error) {
    console.error('Error getting admins:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get admins' },
      { status: 500 }
    );
  }
}

// Add a new admin
export async function POST(request: NextRequest) {
  try {
    const { username, email, password, permissions } = await request.json();
    
    // Verify current admin has permissions
    const currentAdmin = await requirePermission(request, 'manageAdmins');
    
    // If requirePermission returns a NextResponse, it means unauthorized
    if ('status' in currentAdmin && currentAdmin.status === 403) {
      return currentAdmin;
    }
    
    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Username, email and password are required' },
        { status: 400 }
      );
    }
    
    // Check if email already exists
    const userExists = await redis.exists(`admin:${email}`);
    if (userExists) {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 400 }
      );
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create new admin
    const newAdmin: AdminUser = {
      id: uuidv4(),
      username,
      email,
      password: hashedPassword,
      role: 'sub-admin',
      permissions: {
        viewApplications: permissions?.viewApplications || true,
        manageAdmins: permissions?.manageAdmins || false,
        manageSmtp: permissions?.manageSmtp || false,
        manageRecipients: permissions?.manageRecipients || false,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      addedBy: currentAdmin.id,
    };
    
    // Store in Redis
    await redis.set(`admin:${newAdmin.email}`, JSON.stringify(newAdmin));
    
    // Remove password from response
    const { password: _, ...adminWithoutPassword } = newAdmin;
    
    return NextResponse.json({ 
      success: true, 
      admin: adminWithoutPassword 
    });
  } catch (error) {
    console.error('Error adding admin:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add admin' },
      { status: 500 }
    );
  }
}

// Update an admin
export async function PUT(request: NextRequest) {
  try {
    const { id, username, email, permissions, active } = await request.json();
    
    // Verify current admin has permissions
    const currentAdmin = await requirePermission(request, 'manageAdmins');
    
    // If requirePermission returns a NextResponse, it means unauthorized
    if ('status' in currentAdmin && currentAdmin.status === 403) {
      return currentAdmin;
    }
    
    if (!id || !email) {
      return NextResponse.json(
        { success: false, error: 'Admin ID and email are required' },
        { status: 400 }
      );
    }
    
    // Get existing admin
    const adminJson = await redis.get(`admin:${email}`);
    if (!adminJson) {
      return NextResponse.json(
        { success: false, error: 'Admin not found' },
        { status: 404 }
      );
    }
    
    const admin: AdminUser = JSON.parse(adminJson);
      // Don't allow changing role of super admin (SMTP User)
    const smtpEmail = process.env.SMTP_USER || 'admin@bluelender.com';
    if (email === smtpEmail) {
      return NextResponse.json(
        { success: false, error: 'Cannot modify the super admin' },
        { status: 400 }
      );
    }
    
    // Update admin
    const updatedAdmin: AdminUser = {
      ...admin,
      username: username || admin.username,
      permissions: {
        viewApplications: permissions?.viewApplications ?? admin.permissions.viewApplications,
        manageAdmins: permissions?.manageAdmins ?? admin.permissions.manageAdmins,
        manageSmtp: permissions?.manageSmtp ?? admin.permissions.manageSmtp,
        manageRecipients: permissions?.manageRecipients ?? admin.permissions.manageRecipients,
      },
      updatedAt: new Date().toISOString(),
    };
    
    // Store updated admin
    await redis.set(`admin:${updatedAdmin.email}`, JSON.stringify(updatedAdmin));
    
    // Remove password from response
    const { password, ...adminWithoutPassword } = updatedAdmin;
    
    return NextResponse.json({ 
      success: true, 
      admin: adminWithoutPassword 
    });
  } catch (error) {
    console.error('Error updating admin:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update admin' },
      { status: 500 }
    );
  }
}

// Delete an admin
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    // Verify current admin has permissions
    const currentAdmin = await requirePermission(request, 'manageAdmins');
    
    // If requirePermission returns a NextResponse, it means unauthorized
    if ('status' in currentAdmin && currentAdmin.status === 403) {
      return currentAdmin;
    }
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Admin email is required' },
        { status: 400 }
      );
    }
    
    // Don't allow deleting the main admin
    if (email === 'admin@bluelender.com') {
      return NextResponse.json(
        { success: false, error: 'Cannot delete the main admin' },
        { status: 400 }
      );
    }
    
    // Check if admin exists
    const adminExists = await redis.exists(`admin:${email}`);
    if (!adminExists) {
      return NextResponse.json(
        { success: false, error: 'Admin not found' },
        { status: 404 }
      );
    }
    
    // Delete admin
    await redis.del(`admin:${email}`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting admin:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete admin' },
      { status: 500 }
    );
  }
}
