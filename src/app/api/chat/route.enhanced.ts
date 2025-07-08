import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';

// Enhanced business context and patterns for better conversation
const BUSINESS_CONTEXT = {
  name: "EMPIRE Assistant",
  company: "EMPIRE ENTREPRISE",
  contact: {
    email: "papy@hempire-enterprise.com",
    phone: "(123) 456-7890"
  },
  services: {
    equipment_financing: {
      keywords: ['equipment', 'machinery', 'tools', 'vehicles', 'construction', 'manufacturing'],
      min_amount: 5000,
      max_amount: 5000000,
      terms: '12-84 months',
      rate: '5-15% APR'
    },
    working_capital: {
      keywords: ['working capital', 'cash flow', 'inventory', 'payroll', 'operations'],
      min_amount: 10000,
      max_amount: 1000000,
      terms: '3-24 months',
      rate: '8-25% APR'
    },
    sba_loans: {
      keywords: ['sba', 'government', 'long term', 'expansion', 'real estate'],
      min_amount: 50000,
      max_amount: 5000000,
      terms: '5-25 years',
      rate: '6-12% APR'
    },
    business_expansion: {
      keywords: ['expansion', 'growth', 'new location', 'hire', 'scale'],
      min_amount: 25000,
      max_amount: 2000000,
      terms: '6-60 months',
      rate: '7-20% APR'
    }
  }
};

// Enhanced conversation patterns for natural responses
const CONVERSATION_PATTERNS = {
  greetings: [
    "Hello! I'm your business financing specialist at EMPIRE ENTREPRISE. How can I help grow your business today?",
    "Hi there! Welcome to EMPIRE ENTREPRISE. I'm here to help you find the perfect financing solution. What brings you here?",
    "Good day! I'm the EMPIRE Assistant, specializing in business loans and equipment financing. What can I help you with?",
    "Welcome! I'm excited to help you explore financing options for your business. Tell me about your company!"
  ],
  
  business_discovery: [
    "That sounds like an interesting business! Tell me more about what you do day-to-day.",
    "I'd love to learn more about your operations. What's your main revenue source?",
    "What's the biggest challenge your business is facing right now?",
    "How long have you been operating this business?",
    "What are your main business goals for the next 12 months?"
  ],
  
  financing_needs: [
    "What would you use the financing for if approved?",
    "Do you have a specific amount in mind that would help your business?",
    "Are you looking to purchase equipment, improve cash flow, or expand operations?",
    "What's driving the need for financing right now?",
    "How quickly do you need access to funds?"
  ],
  
  qualification_questions: [
    "How long has your business been operating?",
    "What's your approximate monthly revenue?",
    "Do you have any existing business debt?",
    "What's your estimated credit score range?",
    "Are you the business owner or decision maker?"
  ],
  
  next_steps: [
    "Based on what you've told me, I think we have some excellent options for you. Would you like me to connect you with a specialist?",
    "I'd love to get you pre-qualified quickly. Can I get your contact information to send you personalized options?",
    "You sound like a great fit for our programs! When would be a good time for a brief consultation call?",
    "Let me get you connected with one of our financing specialists who can provide exact terms. What's your preferred contact method?"
  ]
};

// Enhanced intent recognition with context awareness
class SmartChatBot {
  static analyzeIntent(message: string, context: any = {}) {
    const msg = message.toLowerCase();
    
    // Intent categories with weighted keywords
    const intents = {
      greeting: {
        keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
        weight: 1.0
      },
      financing_inquiry: {
        keywords: ['loan', 'financing', 'money', 'fund', 'capital', 'credit', 'cash'],
        weight: 1.2
      },
      equipment_need: {
        keywords: ['equipment', 'machinery', 'tools', 'vehicle', 'truck', 'construction'],
        weight: 1.1
      },
      business_info: {
        keywords: ['business', 'company', 'revenue', 'sales', 'customers', 'employees'],
        weight: 1.0
      },
      application_intent: {
        keywords: ['apply', 'application', 'qualify', 'start', 'begin', 'process'],
        weight: 1.3
      },
      contact_sharing: {
        keywords: ['email', 'phone', 'call', 'contact', 'reach', 'send'],
        weight: 0.9
      },
      objection: {
        keywords: ['not interested', 'too expensive', 'think about it', 'maybe later'],
        weight: 0.8
      }
    };

    let bestIntent = 'general';
    let highestScore = 0;

    Object.entries(intents).forEach(([intent, data]) => {
      let score = 0;
      data.keywords.forEach(keyword => {
        if (msg.includes(keyword)) {
          score += data.weight;
        }
      });
      
      if (score > highestScore) {
        highestScore = score;
        bestIntent = intent;
      }
    });

    return { intent: bestIntent, confidence: highestScore };
  }

  static extractBusinessInfo(message: string) {
    const info = {};
    const msg = message.toLowerCase();

    // Extract business type
    const businessTypes = {
      'restaurant': ['restaurant', 'food', 'dining', 'cafe', 'bar'],
      'retail': ['retail', 'store', 'shop', 'boutique', 'clothing'],
      'construction': ['construction', 'contractor', 'building', 'renovation'],
      'manufacturing': ['manufacturing', 'factory', 'production', 'assembly'],
      'technology': ['tech', 'software', 'app', 'website', 'digital'],
      'healthcare': ['medical', 'dental', 'clinic', 'healthcare', 'therapy'],
      'professional': ['law', 'accounting', 'consulting', 'agency', 'marketing']
    };

    Object.entries(businessTypes).forEach(([type, keywords]) => {
      if (keywords.some(keyword => msg.includes(keyword))) {
        info.type = type;
      }
    });

    // Extract revenue information
    const revenuePatterns = [
      /(\$?\d+[,.]?\d*)\s*(k|thousand)/i,
      /(\$?\d+[,.]?\d*)\s*(million|m)/i,
      /(\$?\d+[,.]?\d*)\s*per\s*month/i,
      /monthly.*(\$?\d+[,.]?\d*)/i
    ];

    revenuePatterns.forEach(pattern => {
      const match = message.match(pattern);
      if (match) {
        info.revenue = match[1];
      }
    });

    // Extract time in business
    const timePatterns = [
      /(\d+)\s*years?/i,
      /(\d+)\s*months?/i,
      /(new|just started|startup)/i
    ];

    timePatterns.forEach(pattern => {
      const match = message.match(pattern);
      if (match) {
        info.timeInBusiness = match[1] || match[0];
      }
    });

    return Object.keys(info).length > 0 ? info : null;
  }

  static generateContextualResponse(message: string, sessionData: any = {}) {
    const intent = this.analyzeIntent(message, sessionData);
    const businessInfo = this.extractBusinessInfo(message);
    
    // Update session data if we extracted new info
    if (businessInfo) {
      sessionData.businessInfo = { ...sessionData.businessInfo, ...businessInfo };
    }

    // Generate response based on intent and context
    switch (intent.intent) {
      case 'greeting':
        return this.getRandomResponse(CONVERSATION_PATTERNS.greetings);
        
      case 'financing_inquiry':
        if (!sessionData.businessInfo?.type) {
          return "I'd be happy to help you explore financing options! " + 
                 this.getRandomResponse(CONVERSATION_PATTERNS.business_discovery);
        }
        return this.getFinancingResponse(sessionData);
        
      case 'equipment_need':
        return this.getEquipmentResponse(message, sessionData);
        
      case 'application_intent':
        return this.getApplicationResponse(sessionData);
        
      case 'business_info':
        return this.getBusinessInfoResponse(businessInfo, sessionData);
        
      case 'objection':
        return this.handleObjection(message);
        
      default:
        return this.getConversationalResponse(message, sessionData);
    }
  }

  static getFinancingResponse(sessionData: any) {
    if (sessionData.businessInfo?.type) {
      const businessType = sessionData.businessInfo.type;
      const service = this.matchBusinessToService(businessType);
      
      return `Great! For ${businessType} businesses, I often recommend our ${service.name}. ` +
             `We typically provide $${service.min_amount.toLocaleString()} to $${service.max_amount.toLocaleString()} ` +
             `with ${service.terms} terms at ${service.rate}. ` +
             this.getRandomResponse(CONVERSATION_PATTERNS.financing_needs);
    }
    
    return this.getRandomResponse(CONVERSATION_PATTERNS.financing_needs);
  }

  static getEquipmentResponse(message: string, sessionData: any) {
    const service = BUSINESS_CONTEXT.services.equipment_financing;
    return `Equipment financing is one of our most popular programs! ` +
           `We can finance up to $${service.max_amount.toLocaleString()} for equipment purchases ` +
           `with rates as low as ${service.rate.split('-')[0]}. ` +
           `What type of equipment are you looking to purchase?`;
  }

  static getApplicationResponse(sessionData: any) {
    if (this.hasEnoughInfoForPrequalification(sessionData)) {
      return "Perfect! Based on our conversation, you look like a strong candidate. " +
             "I can get you pre-qualified in just 2 minutes. " +
             "What's the best email address to send your personalized financing options?";
    }
    
    return "I'd love to help you get started with an application! " +
           "Let me ask a few quick questions to find the best program for you. " +
           this.getRandomResponse(CONVERSATION_PATTERNS.qualification_questions);
  }

  static getBusinessInfoResponse(businessInfo: any, sessionData: any) {
    let response = "That's helpful information! ";
    
    if (businessInfo?.type) {
      response += `${businessInfo.type.charAt(0).toUpperCase() + businessInfo.type.slice(1)} businesses are a great fit for our programs. `;
    }
    
    if (businessInfo?.revenue) {
      response += `With your revenue level, you should qualify for our premium rates. `;
    }
    
    return response + this.getRandomResponse(CONVERSATION_PATTERNS.financing_needs);
  }

  static handleObjection(message: string) {
    const objectionResponses = {
      'not interested': "I understand! No pressure at all. If your financing needs change in the future, we'll be here to help. Is there anything specific about business financing I can answer for you?",
      'too expensive': "I appreciate your honesty! Our rates are actually very competitive - many clients are surprised by how affordable our options are. Would you like me to show you our lowest-rate programs?",
      'think about it': "Absolutely! It's a big decision. Would it be helpful if I sent you some information to review? No obligation, just educational material about your options.",
      'maybe later': "Perfect timing is important! When do you think might be a better time? I can follow up then, or just send you our contact info for when you're ready."
    };
    
    const msg = message.toLowerCase();
    for (const [objection, response] of Object.entries(objectionResponses)) {
      if (msg.includes(objection)) {
        return response;
      }
    }
    
    return "I understand you might have some concerns. What questions can I answer to help you make the best decision for your business?";
  }

  static getConversationalResponse(message: string, sessionData: any) {
    // Default conversational response based on what info we're missing
    if (!sessionData.contactInfo?.name) {
      return "I'd love to personalize our conversation better. What should I call you?";
    }
    
    if (!sessionData.businessInfo?.type) {
      return `Thanks ${sessionData.contactInfo.name}! ` + 
             this.getRandomResponse(CONVERSATION_PATTERNS.business_discovery);
    }
    
    if (!sessionData.businessInfo?.revenue) {
      return this.getRandomResponse(CONVERSATION_PATTERNS.qualification_questions);
    }
    
    return this.getRandomResponse(CONVERSATION_PATTERNS.next_steps);
  }

  static matchBusinessToService(businessType: string) {
    const services = BUSINESS_CONTEXT.services;
    
    // Match business type to most suitable service
    const businessServiceMap = {
      'restaurant': services.working_capital,
      'retail': services.working_capital,
      'construction': services.equipment_financing,
      'manufacturing': services.equipment_financing,
      'technology': services.business_expansion,
      'healthcare': services.equipment_financing,
      'professional': services.business_expansion
    };
    
    return businessServiceMap[businessType] || services.working_capital;
  }

  static hasEnoughInfoForPrequalification(sessionData: any) {
    return sessionData.businessInfo?.type && 
           sessionData.businessInfo?.revenue && 
           (sessionData.contactInfo?.email || sessionData.contactInfo?.phone);
  }

  static getRandomResponse(responses: string[]) {
    return responses[Math.floor(Math.random() * responses.length)];
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId, history = [] } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    // Generate session ID if not provided
    const chatSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Get existing session data
    let sessionData = {};
    try {
      const existingSession = await redis.get(`chat_session_data:${chatSessionId}`);
      if (existingSession) {
        sessionData = JSON.parse(existingSession);
      }
    } catch (error) {
      console.log('No existing session data found');
    }
    
    // Generate intelligent response using enhanced patterns
    const response = SmartChatBot.generateContextualResponse(message, sessionData);
    
    // Extract and update session information
    const businessInfo = SmartChatBot.extractBusinessInfo(message);
    if (businessInfo) {
      sessionData.businessInfo = { ...sessionData.businessInfo, ...businessInfo };
    }
    
    // Extract contact information
    const emailMatch = message.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = message.match(/(\(?[\d\s\-\.\(\)]{10,}\)?)/);
    
    if (emailMatch) {
      sessionData.contactInfo = { ...sessionData.contactInfo, email: emailMatch[0] };
    }
    if (phoneMatch) {
      sessionData.contactInfo = { ...sessionData.contactInfo, phone: phoneMatch[0] };
    }
    
    // Update session data
    await redis.set(`chat_session_data:${chatSessionId}`, JSON.stringify(sessionData));
    await redis.expire(`chat_session_data:${chatSessionId}`, 86400 * 7); // Keep for 7 days
    
    // Store conversation history
    const conversationEntry = {
      timestamp: new Date().toISOString(),
      userMessage: message,
      botResponse: response,
      sessionId: chatSessionId
    };
    
    await redis.lpush(`chat_session:${chatSessionId}`, JSON.stringify(conversationEntry));
    await redis.expire(`chat_session:${chatSessionId}`, 86400 * 7); // Keep for 7 days
    
    // Check if we can create a lead
    const readyForApplication = SmartChatBot.hasEnoughInfoForPrequalification(sessionData);
    
    return NextResponse.json({ 
      message: response,
      sessionId: chatSessionId,
      readyForApplication: readyForApplication,
      leadGenerated: readyForApplication
    });
    
  } catch (error) {
    console.error('Error in enhanced chat endpoint:', error);
    
    // Fallback responses
    const fallbackResponses = [
      "Hi! I'm here to help you explore business financing options. What type of business do you operate?",
      "Welcome to EMPIRE ENTREPRISE! I specialize in business loans and equipment financing. How can I help you today?",
      "Hello! I'm your business financing specialist. What brings you here today?",
      "Hi there! I'd love to help you find the perfect financing solution for your business. Tell me about your company!"
    ];
    
    const fallbackResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    
    return NextResponse.json({ 
      message: fallbackResponse,
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
