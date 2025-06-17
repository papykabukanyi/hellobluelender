import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { v4 as uuidv4 } from 'uuid';
import { EmailRecipient } from '@/types';

// Get all email recipients
export async function GET() {
  try {
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
    
    // Create new recipient
    const newRecipient: EmailRecipient = {
      id: uuidv4(),
      name,
      email,
      active: true,
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
