import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';

// Helper function to calculate session duration
function calculateSessionDuration(messages: any[]): number {
  if (messages.length < 2) return 0;
  
  const firstMessage = new Date(messages[0].timestamp || Date.now());
  const lastMessage = new Date(messages[messages.length - 1].timestamp || Date.now());
  
  return Math.round((lastMessage.getTime() - firstMessage.getTime()) / 1000); // Duration in seconds
}

// Enhanced information extraction
function extractEnhancedInfo(messages: any[]): any {
  const userMessages = messages.filter(msg => msg.role === 'user');
  const allText = userMessages.map(msg => msg.content).join(' ').toLowerCase();
  
  const extracted = {
    email: null,
    phone: null,
    name: null,
    businessName: null,
    businessType: null,
    loanAmount: null,
    revenue: null,
    keywords: []
  };
  
  // Enhanced regex patterns
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const phoneRegex = /\b(\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g;
  const nameRegex = /(?:my name is|I am|I'm|this is|call me) ([A-Z][a-z]+(?: [A-Z][a-z]+)?)/i;
  const businessRegex = /(?:my business|company|our business|our company|business name) (?:is|name is|called|:) ([^,.!?]+)/i;
  const loanAmountRegex = /\$?([\d,]+)(?:k|thousand|million)?\s*(?:loan|financing|capital|dollars)/i;
  const revenueRegex = /\$?([\d,]+)(?:k|thousand|million)?\s*(?:month|monthly|revenue|sales)/i;
  
  // Extract information from all user messages
  for (const message of userMessages) {
    const content = message.content;
    
    // Email extraction
    const emailMatch = content.match(emailRegex);
    if (emailMatch && !extracted.email) {
      extracted.email = emailMatch[0];
    }
    
    // Phone extraction
    const phoneMatch = content.match(phoneRegex);
    if (phoneMatch && !extracted.phone) {
      extracted.phone = phoneMatch[0];
    }
    
    // Name extraction
    const nameMatch = content.match(nameRegex);
    if (nameMatch && !extracted.name) {
      extracted.name = nameMatch[1];
    }
    
    // Business name extraction
    const businessMatch = content.match(businessRegex);
    if (businessMatch && !extracted.businessName) {
      extracted.businessName = businessMatch[1].trim();
    }
    
    // Loan amount extraction
    const loanMatch = content.match(loanAmountRegex);
    if (loanMatch && !extracted.loanAmount) {
      extracted.loanAmount = loanMatch[1];
    }
    
    // Revenue extraction
    const revenueMatch = content.match(revenueRegex);
    if (revenueMatch && !extracted.revenue) {
      extracted.revenue = revenueMatch[1];
    }
  }
  
  // Extract business type keywords
  const businessTypes = ['restaurant', 'retail', 'construction', 'manufacturing', 'service', 'consulting', 'medical', 'dental', 'automotive', 'technology'];
  for (const type of businessTypes) {
    if (allText.includes(type)) {
      extracted.businessType = type;
      break;
    }
  }
  
  // Extract relevant keywords
  const importantKeywords = ['loan', 'financing', 'capital', 'equipment', 'expansion', 'startup', 'cash flow', 'apply', 'interested'];
  for (const keyword of importantKeywords) {
    if (allText.includes(keyword)) {
      extracted.keywords.push(keyword);
    }
  }
  
  return extracted;
}

// Enhanced lead detection
function detectLeadCandidate(messages: any[]): any {
  const extractedInfo = extractEnhancedInfo(messages);
  const userMessages = messages.filter(msg => msg.role === 'user');
  const allText = userMessages.map(msg => msg.content).join(' ').toLowerCase();
  
  // High-interest keywords
  const highInterestKeywords = ['need', 'urgent', 'asap', 'apply', 'application', 'start', 'when can', 'how fast'];
  const mediumInterestKeywords = ['interested', 'looking for', 'considering', 'help me', 'tell me more'];
  const lowInterestKeywords = ['maybe', 'just looking', 'browsing', 'not sure'];
  
  let priority = 'low';
  let interestLevel = 'low';
  
  // Calculate interest level
  if (highInterestKeywords.some(keyword => allText.includes(keyword))) {
    interestLevel = 'high';
    priority = 'high';
  } else if (mediumInterestKeywords.some(keyword => allText.includes(keyword))) {
    interestLevel = 'medium';
    priority = 'medium';
  }
  
  // Determine if this is a lead
  const hasContactInfo = extractedInfo.email || extractedInfo.phone;
  const hasBusinessInfo = extractedInfo.businessName || extractedInfo.businessType;
  const hasFinancingInterest = extractedInfo.keywords.length > 0;
  const isLead = hasContactInfo && (hasBusinessInfo || hasFinancingInterest);
  
  // Boost priority if we have complete information
  if (isLead && extractedInfo.email && extractedInfo.businessName && extractedInfo.loanAmount) {
    priority = 'high';
  }
  
  return {
    isLead,
    priority,
    interestLevel,
    extractedInfo,
    messageCount: userMessages.length,
    sessionLength: calculateSessionDuration(messages),
    createdAt: new Date().toISOString()
  };
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId, messages } = await request.json();

    if (!sessionId || !messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Session ID and messages array are required' },
        { status: 400 }
      );
    }

    // Enhanced session data with analytics
    const sessionData = {
      sessionId,
      messages,
      lastUpdated: new Date().toISOString(),
      messageCount: messages.length,
      userMessageCount: messages.filter(msg => msg.role === 'user').length,
      sessionDuration: calculateSessionDuration(messages),
      extractedInfo: extractEnhancedInfo(messages)
    };

    // Save the conversation session with expiration
    await redis.set(`chat:session:${sessionId}`, JSON.stringify(sessionData), 'EX', 86400 * 7); // 7 days

    // Enhanced lead detection
    const leadCandidate = detectLeadCandidate(messages);
    
    if (leadCandidate.isLead) {
      const leadKey = `chat:potential_lead:${sessionId}`;
      await redis.set(leadKey, JSON.stringify(leadCandidate), 'EX', 86400 * 30); // 30 days
      await redis.sadd('potential_leads', sessionId);
      
      console.log('Potential lead detected:', sessionId, leadCandidate.priority);
    }

    // Update comprehensive analytics
    const today = new Date().toISOString().split('T')[0];
    await redis.hincrby(`chat:analytics:daily:${today}`, 'sessions', 1);
    await redis.hincrby(`chat:analytics:daily:${today}`, 'messages', messages.length);
    await redis.hincrby('chat:analytics:sessions', 'total_sessions', 1);
    await redis.hincrby('chat:analytics:sessions', 'total_messages', messages.length);
    
    if (leadCandidate.isLead) {
      await redis.hincrby(`chat:analytics:daily:${today}`, 'leads_detected', 1);
      await redis.hincrby('chat:analytics:leads', 'potential_leads_detected', 1);
      await redis.hincrby('chat:analytics:leads', leadCandidate.priority, 1);
    }

    return NextResponse.json({ 
      success: true,
      sessionId,
      messagesSaved: messages.length,
      leadDetected: leadCandidate.isLead,
      leadPriority: leadCandidate.isLead ? leadCandidate.priority : null,
      extractedInfo: leadCandidate.extractedInfo
    });

  } catch (error) {
    console.error('Error saving chat session:', error);
    return NextResponse.json(
      { error: 'Failed to save chat session' },
      { status: 500 }
    );
  }
}
