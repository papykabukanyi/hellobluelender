import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { v4 as uuidv4 } from 'uuid';
import { EmailRecipient } from '@/types';
import { requirePermission } from '@/lib/permissions';

// Get all email recipients
export async function GET(request: NextRequest) {
  try {
    // Verify current admin has permission to manage recipients
    const currentAdmin = await requirePermission(request, 'manageRecipients');
    
    // If requirePermission returns a NextResponse, it means unauthorized
    if ('status' in currentAdmin && currentAdmin.status === 403) {
      return currentAdmin;
    }
    
    // Get recipients from Redis
    const recipientsJson = await redis.get('email:recipients');
    const recipients = recipientsJson ? JSON.parse(recipientsJson) : [];
    
    return NextResponse.json({ success: true, recipients });
  } catch (error) {
    console.error('Error getting email recipients:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get email recipients' },
      { status: 500 }
    );
  }
}

// Add a new email recipient
export async function POST(request: NextRequest) {
  try {
    // Verify current admin has permission to manage recipients
    const currentAdmin = await requirePermission(request, 'manageRecipients');
    
    // If requirePermission returns a NextResponse, it means unauthorized
    if ('status' in currentAdmin && currentAdmin.status === 403) {
      return currentAdmin;
    }
    
    const { name, email } = await request.json();
    
    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required' },
        { status: 400 }
      );
    }
    
    // Get existing recipients
    const recipientsJson = await redis.get('email:recipients');
    const recipients = recipientsJson ? JSON.parse(recipientsJson) : [];
    
    // Check if email already exists
    const emailExists = recipients.some((r: EmailRecipient) => r.email === email);
    if (emailExists) {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 400 }
      );
    }
      // Check if we should set this recipient as main admin (SMTP owner)
    // This is determined by checking if this email matches the SMTP_USER from environment
    const smtpUser = process.env.SMTP_USER || '';
    const isMainAdmin = email === smtpUser;
    
    // If this will be marked as main admin, we need to remove that flag from any existing recipient
    if (isMainAdmin) {
      // Find any existing main admin and remove the flag
      const mainAdminIndex = recipients.findIndex((r: EmailRecipient) => r.isMainAdmin === true);
      if (mainAdminIndex !== -1) {
        recipients[mainAdminIndex].isMainAdmin = false;
      }
    }
    
    // Create new recipient
    const newRecipient: EmailRecipient = {
      id: uuidv4(),
      name,
      email,
      active: true,
      isMainAdmin, // Set this based on whether the email matches SMTP_USER
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Add to recipients list
    recipients.push(newRecipient);
    
    // Save back to Redis
    await redis.set('email:recipients', JSON.stringify(recipients));
    
    return NextResponse.json({ 
      success: true, 
      recipient: newRecipient 
    });
  } catch (error) {
    console.error('Error adding email recipient:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add email recipient' },
      { status: 500 }
    );
  }
}

// Update an email recipient
export async function PUT(request: NextRequest) {
  try {
    // Verify current admin has permission to manage recipients
    const currentAdmin = await requirePermission(request, 'manageRecipients');
    
    // If requirePermission returns a NextResponse, it means unauthorized
    if ('status' in currentAdmin && currentAdmin.status === 403) {
      return currentAdmin;
    }
    
    const { id, name, email, active } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Recipient ID is required' },
        { status: 400 }
      );
    }
    
    // Get current recipients
    const recipientsJson = await redis.get('email:recipients');
    const recipients: EmailRecipient[] = recipientsJson ? JSON.parse(recipientsJson) : [];
    
    // Find recipient index
    const recipientIndex = recipients.findIndex(recipient => recipient.id === id);
    if (recipientIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Recipient not found' },
        { status: 404 }
      );
    }
    
    // Update recipient
    const updatedRecipient: EmailRecipient = {
      ...recipients[recipientIndex],
      name: name !== undefined ? name : recipients[recipientIndex].name,
      email: email !== undefined ? email : recipients[recipientIndex].email,
      active: active !== undefined ? active : recipients[recipientIndex].active,
      updatedAt: new Date().toISOString(),
    };
    
    // Replace in array
    recipients[recipientIndex] = updatedRecipient;
    await redis.set('email:recipients', JSON.stringify(recipients));
    
    return NextResponse.json({
      success: true,
      recipient: updatedRecipient,
    });
  } catch (error) {
    console.error('Error updating email recipient:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update email recipient' },
      { status: 500 }
    );
  }
}

// Delete an email recipient
export async function DELETE(request: NextRequest) {
  try {
    // Verify current admin has permission to manage recipients
    const currentAdmin = await requirePermission(request, 'manageRecipients');
    
    // If requirePermission returns a NextResponse, it means unauthorized
    if ('status' in currentAdmin && currentAdmin.status === 403) {
      return currentAdmin;
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Recipient ID is required' },
        { status: 400 }
      );
    }
    
    // Get current recipients
    const recipientsJson = await redis.get('email:recipients');
    const recipients: EmailRecipient[] = recipientsJson ? JSON.parse(recipientsJson) : [];
      // Find the recipient to delete
    const recipientToDelete = recipients.find(recipient => recipient.id === id);
    
    if (!recipientToDelete) {
      return NextResponse.json(
        { success: false, error: 'Recipient not found' },
        { status: 404 }
      );
    }
    
    // Check if this is the SMTP super admin email
    const smtpUser = process.env.SMTP_USER || 'admin@bluelender.com';
    if (recipientToDelete.email === smtpUser) {
      return NextResponse.json(
        { success: false, error: 'Cannot remove the SMTP email from recipients list' },
        { status: 400 }
      );
    }
    
    // Filter out the recipient to delete
    const updatedRecipients = recipients.filter(recipient => recipient.id !== id);
    }
    
    // Save updated list
    await redis.set('email:recipients', JSON.stringify(updatedRecipients));
    
    return NextResponse.json({
      success: true,
      message: 'Recipient deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting email recipient:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete email recipient' },
      { status: 500 }
    );
  }
}
