import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';

// Comprehensive FAQ Knowledge Base for EMPIRE ENTREPRISE
const FAQ_KNOWLEDGE_BASE = {
  // Company Information
  company: {
    name: "EMPIRE ENTREPRISE", 
    founded: "2020",
    mission: "To provide fast, flexible financing solutions that help businesses grow and succeed.",
    values: ["Customer Success", "Transparency", "Speed", "Reliability"],
    team_size: "50+ professionals",
    headquarters: "United States",
    licenses: "Licensed in all 50 states",
    rating: "A+ BBB Rating"
  },

  // Products and Services
  products: {
    equipment_financing: {
      description: "Finance new or used business equipment with competitive rates",
      rates: "5-15% APR",
      terms: "12-84 months",
      amounts: "$5,000 - $5,000,000",
      approval_time: "24-48 hours",
      funding_time: "1-5 business days",
      requirements: "6+ months in business, $10K+ monthly revenue, 580+ credit score"
    },
    working_capital: {
      description: "Fast cash flow solutions for daily operations and growth",
      rates: "6-18% APR", 
      terms: "3-36 months",
      amounts: "$10,000 - $2,000,000",
      approval_time: "Same day possible",
      funding_time: "24-72 hours",
      requirements: "3+ months in business, $15K+ monthly revenue, 550+ credit score"
    },
    sba_loans: {
      description: "Government-backed loans with the lowest rates available",
      rates: "3-8% APR",
      terms: "5-25 years", 
      amounts: "$50,000 - $5,000,000",
      approval_time: "2-8 weeks",
      funding_time: "4-12 weeks",
      requirements: "2+ years in business, strong financials, 680+ credit score"
    },
    business_expansion: {
      description: "Funding for growth, acquisitions, and new locations",
      rates: "7-20% APR",
      terms: "6-60 months",
      amounts: "$25,000 - $10,000,000", 
      approval_time: "3-7 days",
      funding_time: "1-2 weeks",
      requirements: "12+ months in business, proven growth, 600+ credit score"
    }
  },

  // Application Process
  process: {
    steps: [
      "Complete online application (10-15 minutes)",
      "Upload required documents",
      "Receive initial approval decision (24-48 hours)",
      "Final underwriting and verification",
      "Funding (1-5 business days after approval)"
    ],
    required_documents: [
      "Last 3 months bank statements",
      "Business tax returns (last 1-2 years)", 
      "Valid government ID",
      "Business license or registration",
      "Financial statements (if available)"
    ],
    application_fee: "No application fees",
    prepayment_penalty: "Most products have no prepayment penalties"
  },

  // Qualification Requirements
  qualifications: {
    minimum: {
      time_in_business: "3-6 months minimum (varies by product)",
      monthly_revenue: "$10,000+ minimum",
      credit_score: "550+ personal credit score",
      business_type: "Most business types accepted"
    },
    preferred: {
      time_in_business: "12+ months",
      monthly_revenue: "$25,000+",
      credit_score: "650+",
      industry: "Established industries with stable cash flow"
    },
    excluded_industries: [
      "Adult entertainment",
      "Gambling", 
      "Illegal activities",
      "Multi-level marketing",
      "Speculative investments"
    ]
  },

  // Industries Served
  industries: [
    "Restaurants & Food Service",
    "Retail & E-commerce", 
    "Healthcare & Medical",
    "Construction & Contractors",
    "Professional Services",
    "Manufacturing",
    "Transportation & Logistics",
    "Technology",
    "Beauty & Wellness",
    "Automotive",
    "Real Estate",
    "Agriculture"
  ],

  // Contact and Support
  contact: {
    phone: "(123) 456-7890",
    email: "papy@hempire-enterprise.com",
    website: "https://empire-entreprise.com",
    hours: "Monday-Friday 8AM-8PM EST, Saturday 9AM-5PM EST",
    emergency: "24/7 online support for existing customers",
    response_time: "Under 2 hours during business hours"
  },

  // Common Questions
  faq: {
    "how_fast_approval": "Most applications receive an initial decision within 24-48 hours. SBA loans take 2-8 weeks due to government requirements.",
    "credit_requirements": "We work with businesses that have credit scores as low as 550, though better rates are available for higher scores.",
    "collateral_required": "Equipment financing uses the equipment as collateral. Other products may be unsecured or require business assets as collateral.",
    "early_payment": "Most of our financing products allow early payment without penalties, helping you save on interest.",
    "application_cost": "There are no application fees. You only pay if you accept and receive funding.",
    "business_age": "We work with businesses as new as 3-6 months, depending on the financing product.",
    "revenue_requirements": "Minimum monthly revenue varies by product, starting at $10,000 per month.",
    "approval_odds": "Over 80% of qualified applicants receive some form of financing offer.",
    "max_amount": "We provide financing up to $10,000,000 for qualified businesses.",
    "personal_guarantee": "Most business financing requires a personal guarantee from business owners."
  }
};

// Enhanced conversation learning system
class ConversationLearning {
  static async recordInteraction(sessionId: string, userMessage: string, botResponse: string, extractedInfo: any) {
    try {
      const interaction = {
        timestamp: new Date().toISOString(),
        sessionId,
        userMessage: userMessage.toLowerCase(),
        botResponse,
        extractedInfo,
        messageLength: userMessage.length,
        responseEffectiveness: await this.calculateResponseEffectiveness(userMessage, botResponse),
        topics: this.extractTopics(userMessage),
        intent: this.classifyIntent(userMessage),
        sentiment: this.analyzeSentiment(userMessage)
      };

      // Store interaction for learning
      await redis.lpush('conversation:learning:interactions', JSON.stringify(interaction));
      await redis.expire('conversation:learning:interactions', 86400 * 30); // Keep for 30 days

      // Update topic frequency for better responses
      await this.updateTopicFrequency(interaction.topics);
      
      // Track response patterns
      await this.trackResponsePatterns(interaction);

    } catch (error) {
      console.error('Error recording interaction for learning:', error);
    }
  }

  static async calculateResponseEffectiveness(userMessage: string, botResponse: string): Promise<number> {
    // Simple effectiveness score based on response relevance
    let score = 0.5; // Base score

    // Check if response addresses user's question
    const userKeywords = this.extractKeywords(userMessage);
    const responseKeywords = this.extractKeywords(botResponse);
    
    const overlap = userKeywords.filter(keyword => 
      responseKeywords.some(respKeyword => respKeyword.includes(keyword))
    ).length;
    
    score += (overlap / Math.max(userKeywords.length, 1)) * 0.3;

    // Bonus for providing specific information
    if (botResponse.includes('$') || botResponse.includes('%') || botResponse.includes('hours') || botResponse.includes('days')) {
      score += 0.2;
    }

    return Math.min(score, 1.0);
  }

  static extractTopics(message: string): string[] {
    const topics = [];
    const lowerMessage = message.toLowerCase();

    // Product topics
    if (lowerMessage.includes('equipment') || lowerMessage.includes('machinery')) topics.push('equipment_financing');
    if (lowerMessage.includes('working capital') || lowerMessage.includes('cash flow')) topics.push('working_capital');
    if (lowerMessage.includes('sba') || lowerMessage.includes('government')) topics.push('sba_loans');
    if (lowerMessage.includes('expansion') || lowerMessage.includes('grow')) topics.push('business_expansion');

    // Process topics
    if (lowerMessage.includes('apply') || lowerMessage.includes('application')) topics.push('application_process');
    if (lowerMessage.includes('qualify') || lowerMessage.includes('requirements')) topics.push('qualifications');
    if (lowerMessage.includes('rate') || lowerMessage.includes('interest')) topics.push('rates');
    if (lowerMessage.includes('time') || lowerMessage.includes('fast') || lowerMessage.includes('quick')) topics.push('timing');

    return topics;
  }

  static classifyIntent(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('apply') || lowerMessage.includes('start application')) return 'apply';
    if (lowerMessage.includes('qualify') || lowerMessage.includes('eligible')) return 'qualification_check';
    if (lowerMessage.includes('rate') || lowerMessage.includes('cost')) return 'pricing_inquiry';
    if (lowerMessage.includes('how long') || lowerMessage.includes('time')) return 'timeline_inquiry';
    if (lowerMessage.includes('contact') || lowerMessage.includes('speak to')) return 'contact_request';
    if (lowerMessage.includes('help') || lowerMessage.includes('information')) return 'information_request';
    
    return 'general_inquiry';
  }

  static analyzeSentiment(message: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['great', 'excellent', 'good', 'interested', 'yes', 'perfect', 'awesome', 'helpful'];
    const negativeWords = ['bad', 'terrible', 'no', 'not interested', 'expensive', 'slow', 'difficult'];
    
    const lowerMessage = message.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerMessage.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerMessage.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  static extractKeywords(text: string): string[] {
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'can', 'could', 'would', 'should', 'will'];
    
    return text.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word))
      .slice(0, 10); // Top 10 keywords
  }

  static async updateTopicFrequency(topics: string[]) {
    for (const topic of topics) {
      await redis.hincrby('conversation:learning:topic_frequency', topic, 1);
    }
  }

  static async trackResponsePatterns(interaction: any) {
    const patternKey = `response_pattern:${interaction.intent}:${interaction.sentiment}`;
    await redis.hincrby('conversation:learning:response_patterns', patternKey, 1);
  }

  static async getOptimalResponse(userMessage: string, context: any): Promise<string | null> {
    try {
      const topics = this.extractTopics(userMessage);
      const intent = this.classifyIntent(userMessage);
      
      // Get topic frequencies to understand what users ask about most
      const topicFreqs = await redis.hgetall('conversation:learning:topic_frequency');
      
      // Find the best matching FAQ response
      return this.findBestFAQMatch(userMessage, topics, intent, topicFreqs);
    } catch (error) {
      console.error('Error getting optimal response:', error);
      return null;
    }
  }

  static findBestFAQMatch(userMessage: string, topics: string[], intent: string, topicFreqs: any): string | null {
    const lowerMessage = userMessage.toLowerCase();
    
    // Direct FAQ matches
    for (const [key, answer] of Object.entries(FAQ_KNOWLEDGE_BASE.faq)) {
      if (this.messageMatchesFAQ(lowerMessage, key)) {
        return answer as string;
      }
    }

    // Product-specific responses
    if (topics.length > 0) {
      const primaryTopic = topics[0];
      if (FAQ_KNOWLEDGE_BASE.products[primaryTopic as keyof typeof FAQ_KNOWLEDGE_BASE.products]) {
        const product = FAQ_KNOWLEDGE_BASE.products[primaryTopic as keyof typeof FAQ_KNOWLEDGE_BASE.products];
        return this.generateProductResponse(product, intent);
      }
    }

    return null;
  }

  static messageMatchesFAQ(message: string, faqKey: string): boolean {
    const keywordMap = {
      'how_fast_approval': ['how fast', 'how long', 'approval time', 'decision time'],
      'credit_requirements': ['credit score', 'credit requirements', 'bad credit', 'minimum credit'],
      'collateral_required': ['collateral', 'security', 'what do you need'],
      'early_payment': ['early payment', 'pay off early', 'prepayment'],
      'application_cost': ['cost', 'fees', 'application fee', 'charges'],
      'business_age': ['how long in business', 'business age', 'new business'],
      'revenue_requirements': ['revenue', 'sales', 'income requirements'],
      'approval_odds': ['approval rate', 'chances', 'odds of approval'],
      'max_amount': ['maximum', 'highest amount', 'max loan'],
      'personal_guarantee': ['personal guarantee', 'personal liability']
    };

    const keywords = keywordMap[faqKey as keyof typeof keywordMap] || [];
    return keywords.some(keyword => message.includes(keyword));
  }

  static generateProductResponse(product: any, intent: string): string {
    switch (intent) {
      case 'pricing_inquiry':
        return `Our rates for this product range from ${product.rates} with terms from ${product.terms}. The exact rate depends on your business profile and creditworthiness.`;
      case 'timeline_inquiry':
        return `For this product, approval typically takes ${product.approval_time} and funding takes ${product.funding_time} after approval.`;
      case 'qualification_check':
        return `To qualify for this product, you'll need: ${product.requirements}. Would you like me to help you check if you qualify?`;
      default:
        return `${product.description} We offer amounts from ${product.amounts} with ${product.rates} rates. ${product.requirements}`;
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId, context } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    const chatSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Extract information for lead generation
    const extractedInfo = this.extractInformationFromMessage(message);
    
    // Try to get an optimal response using machine learning
    let response = await ConversationLearning.getOptimalResponse(message, context);
    
    // If no learned response, use rule-based system
    if (!response) {
      response = this.generateRuleBasedResponse(message, extractedInfo);
    }

    // Record this interaction for learning
    await ConversationLearning.recordInteraction(chatSessionId, message, response, extractedInfo);

    // Check if this creates a lead
    const leadData = await this.checkAndCreateLead(chatSessionId, extractedInfo);

    return NextResponse.json({
      message: response,
      sessionId: chatSessionId,
      extractedInfo,
      leadGenerated: !!leadData,
      knowledgeSource: response.includes('FAQ_KNOWLEDGE_BASE') ? 'learned' : 'rule_based'
    });

  } catch (error) {
    console.error('Error in enhanced chat endpoint:', error);
    
    return NextResponse.json({
      message: "I'm here to help you discover the perfect financing solution for your business! What type of business do you operate?",
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Helper methods for the main API
function extractInformationFromMessage(message: string): any {
  const extracted = {
    firstName: null,
    lastName: null,
    email: null,
    phone: null,
    businessName: null,
    businessType: null,
    loanAmount: null,
    monthlyRevenue: null,
    creditScore: null
  };

  // Enhanced regex patterns
  const patterns = {
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    phone: /\b(\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g,
    name: /(?:my name is|I am|I'm|this is|call me)\s+([A-Z][a-z]+)(?:\s+([A-Z][a-z]+))?/i,
    businessName: /(?:my business|company|our business|business name)\s+(?:is|called|name is)\s+([^,.!?]+)/i,
    loanAmount: /\$?([\d,]+)(?:k|thousand|million)?\s*(?:loan|financing|capital|dollars)/i,
    revenue: /\$?([\d,]+)(?:k|thousand|million)?\s*(?:month|monthly|revenue|sales)/i,
    creditScore: /(?:credit score|score|fico)\s*(?:is|of)?\s*(\d{3})/i
  };

  // Extract email
  const emailMatch = message.match(patterns.email);
  if (emailMatch) extracted.email = emailMatch[0];

  // Extract phone
  const phoneMatch = message.match(patterns.phone);
  if (phoneMatch) extracted.phone = phoneMatch[0];

  // Extract name
  const nameMatch = message.match(patterns.name);
  if (nameMatch) {
    extracted.firstName = nameMatch[1];
    if (nameMatch[2]) extracted.lastName = nameMatch[2];
  }

  // Extract business name
  const businessMatch = message.match(patterns.businessName);
  if (businessMatch) extracted.businessName = businessMatch[1].trim();

  // Extract loan amount
  const loanMatch = message.match(patterns.loanAmount);
  if (loanMatch) extracted.loanAmount = loanMatch[1];

  // Extract revenue
  const revenueMatch = message.match(patterns.revenue);
  if (revenueMatch) extracted.monthlyRevenue = revenueMatch[1];

  // Extract credit score
  const creditMatch = message.match(patterns.creditScore);
  if (creditMatch) extracted.creditScore = creditMatch[1];

  // Extract business type
  const businessTypes = ['restaurant', 'retail', 'construction', 'healthcare', 'medical', 'manufacturing', 'service', 'consulting', 'technology', 'automotive'];
  for (const type of businessTypes) {
    if (message.toLowerCase().includes(type)) {
      extracted.businessType = type;
      break;
    }
  }

  return extracted;
}

function generateRuleBasedResponse(message: string, extractedInfo: any): string {
  const lowerMessage = message.toLowerCase();
  
  // Greeting responses
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    const responses = [
      "Hello! I'm your EMPIRE ENTREPRISE financing specialist. I'm here to help you find the perfect funding solution for your business. What brings you here today?",
      "Hi there! Welcome to EMPIRE ENTREPRISE. I specialize in helping businesses like yours access the capital they need to grow. What type of business do you operate?",
      "Welcome! I'm here to help you explore our comprehensive financing solutions. Whether you need equipment financing, working capital, or expansion funding, I can guide you to the right option. How can I help you today?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Product inquiries
  if (lowerMessage.includes('products') || lowerMessage.includes('services') || lowerMessage.includes('what do you offer')) {
    return `We offer four main financing solutions:

🏭 **Equipment Financing** - 5-15% APR, up to $5M
💰 **Working Capital Loans** - 6-18% APR, up to $2M  
🏛️ **SBA Loans** - 3-8% APR, up to $5M (government-backed)
📈 **Business Expansion Financing** - 7-20% APR, up to $10M

Which type of financing interests you most? I can provide detailed information about rates, terms, and requirements.`;
  }

  // Qualification questions
  if (lowerMessage.includes('qualify') || lowerMessage.includes('requirements') || lowerMessage.includes('eligible')) {
    return `Our basic qualification requirements are:
✅ 3-6+ months in business (varies by product)
✅ $10,000+ monthly revenue
✅ 550+ personal credit score
✅ Valid business registration

Better rates and terms are available for businesses with:
⭐ 12+ months in business
⭐ $25,000+ monthly revenue  
⭐ 650+ credit score

What's your current business situation? I can help determine which products you'd likely qualify for.`;
  }

  // Rate inquiries
  if (lowerMessage.includes('rate') || lowerMessage.includes('interest') || lowerMessage.includes('cost')) {
    return `Our rates are competitive and vary by product:

📊 **Equipment Financing**: 5-15% APR
📊 **Working Capital**: 6-18% APR
📊 **SBA Loans**: 3-8% APR (lowest rates available)
📊 **Business Expansion**: 7-20% APR

Your exact rate depends on:
• Your credit score and business credit
• Time in business and financial strength
• Loan amount and term length
• Industry and business type

What's your approximate credit score? This helps me give you a more accurate rate estimate.`;
  }

  // Timeline questions
  if (lowerMessage.includes('how long') || lowerMessage.includes('fast') || lowerMessage.includes('time')) {
    return `Our timeline varies by product:

⚡ **Working Capital**: Same-day approval possible, funding in 24-72 hours
⚡ **Equipment Financing**: 24-48 hour approval, funding in 1-5 days  
⚡ **Business Expansion**: 3-7 day approval, funding in 1-2 weeks
⚡ **SBA Loans**: 2-8 weeks approval, 4-12 weeks funding (government process)

Most of our clients are surprised by how fast we can work! What type of financing timeline do you need?`;
  }

  // Contact requests
  if (lowerMessage.includes('contact') || lowerMessage.includes('speak to') || lowerMessage.includes('call')) {
    return `I'd be happy to connect you with our team:

📞 **Phone**: (123) 456-7890
📧 **Email**: papy@hempire-enterprise.com
🕒 **Hours**: Mon-Fri 8AM-8PM EST, Sat 9AM-5PM EST
💬 **Response Time**: Under 2 hours during business hours

Would you prefer a call or email follow-up? I can also continue helping you right here to get you pre-qualified!`;
  }

  // Application interest
  if (lowerMessage.includes('apply') || lowerMessage.includes('application') || lowerMessage.includes('start')) {
    return `Excellent! Our application process is simple and fast:

1️⃣ **Complete Application** (10-15 minutes online)
2️⃣ **Upload Documents** (bank statements, tax returns, ID)
3️⃣ **Get Decision** (24-48 hours for most products)
4️⃣ **Receive Funding** (1-5 days after approval)

💡 **No application fees** and **no prepayment penalties** on most products.

To get started, I'll need some basic information. What's your business name and what type of business do you operate?`;
  }

  // Handle extracted information
  if (extractedInfo.firstName) {
    return `Nice to meet you, ${extractedInfo.firstName}! I'm excited to help you find the right financing solution. ${extractedInfo.businessName ? `Tell me more about ${extractedInfo.businessName} - ` : ''}what type of business do you operate and what are your financing needs?`;
  }

  if (extractedInfo.email) {
    return `Perfect! I have your email as ${extractedInfo.email}. This helps me provide personalized follow-up. Now, what type of financing are you most interested in? Equipment, working capital, expansion funding, or are you exploring your options?`;
  }

  // Default helpful response
  return `I'm here to help you find the perfect financing solution for your business. EMPIRE ENTREPRISE offers equipment financing, working capital loans, SBA loans, and expansion funding with competitive rates and fast approval.

What specific questions do you have about business financing? I can help with:
• Product information and rates
• Qualification requirements  
• Application process
• Timeline and funding speed
• Industry-specific solutions`;
}

async function checkAndCreateLead(sessionId: string, extractedInfo: any): Promise<any> {
  // Determine if we have enough info for a lead
  const hasContactInfo = extractedInfo.email || extractedInfo.phone;
  const hasBusinessInfo = extractedInfo.businessName || extractedInfo.businessType;
  const hasFinancingInterest = extractedInfo.loanAmount || extractedInfo.monthlyRevenue;

  if (hasContactInfo && (hasBusinessInfo || hasFinancingInterest)) {
    const leadData = {
      id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      firstName: extractedInfo.firstName || '',
      lastName: extractedInfo.lastName || '',
      email: extractedInfo.email || '',
      phone: extractedInfo.phone || '',
      businessName: extractedInfo.businessName || '',
      businessType: extractedInfo.businessType || '',
      loanAmount: extractedInfo.loanAmount || '',
      monthlyRevenue: extractedInfo.monthlyRevenue || '',
      creditScore: extractedInfo.creditScore || '',
      source: 'Enhanced Chat Bot',
      status: 'New',
      priority: hasFinancingInterest ? 'high' : 'medium',
      createdAt: new Date().toISOString(),
      notes: `Lead generated from AI chat. Extracted: ${Object.entries(extractedInfo).filter(([k,v]) => v).map(([k,v]) => `${k}: ${v}`).join(', ')}`
    };

    try {
      await redis.set(`chat:lead:${sessionId}`, JSON.stringify(leadData));
      await redis.sadd('leads', leadData.id);
      console.log('Lead created from enhanced chat:', leadData.id);
      return leadData;
    } catch (error) {
      console.error('Error saving lead:', error);
    }
  }

  return null;
}
