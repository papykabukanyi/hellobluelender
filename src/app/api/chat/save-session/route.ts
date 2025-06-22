import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, messages } = await request.json();
    
    if (!sessionId || !messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data' },
        { status: 400 }
      );
    }
    
    // Save the chat session to Redis
    await redis.set(`chat:session:${sessionId}`, JSON.stringify(messages));
    
    // Extract potential lead information more aggressively
    const userMessages = messages.filter(msg => msg.role === 'user');
    let potentialLead = false;
    let leadData = {
      email: null,
      phone: null,
      name: null,
      businessName: null,
      interestLevel: 'low'
    };
    
    // Improved regex patterns for better detection
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const phoneRegex = /\b(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g;
    const nameRegex = /(?:my name is|I am|I'm|this is) ([A-Z][a-z]+(?: [A-Z][a-z]+)?)/i;
    const businessRegex = /(?:my business|company|our business|our company) (?:is|name is|called) ([^,.]+)/i;
    
    // Keywords that indicate high interest
    const interestKeywords = ['loan', 'apply', 'application', 'interested', 'financing', 'money', 'funding', 'capital', 'help'];
    
    for (const message of userMessages) {
      const content = message.content.toLowerCase();
      
      // Check for contact information
      const emailMatch = message.content.match(emailRegex);
      if (emailMatch) {
        leadData.email = emailMatch[0];
        potentialLead = true;
      }
      
      const phoneMatch = message.content.match(phoneRegex);
      if (phoneMatch) {
        leadData.phone = phoneMatch[0];
        potentialLead = true;
      }
      
      const nameMatch = message.content.match(nameRegex);
      if (nameMatch && nameMatch[1]) {
        leadData.name = nameMatch[1];
      }
      
      const businessMatch = message.content.match(businessRegex);
      if (businessMatch && businessMatch[1]) {
        leadData.businessName = businessMatch[1];
      }
      
      // Check interest level
      if (interestKeywords.some(keyword => content.includes(keyword))) {
        leadData.interestLevel = 'high';
      }
    }
    
    if (potentialLead) {
      // Store the lead data for admin review
      await redis.set(`chat:lead:${sessionId}`, JSON.stringify(leadData));
      console.log('Potential lead captured:', sessionId, leadData);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving chat session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save chat session' },
      { status: 500 }
    );
  }
}
