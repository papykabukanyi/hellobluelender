import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';

// Enhanced lead generation bot configuration with comprehensive FAQ
const BOT_CONFIG = {
  name: "EMPIRE Assistant",
  company: "EMPIRE ENTREPRISE",
  contact: {
    email: "papy@hempire-enterprise.com",
    phone: "(123) 456-7890"
  },
  products: [
    "Equipment Financing", 
    "Working Capital Loans", 
    "SBA Loans", 
    "Business Expansion Financing"
  ],
  qualifications: "6+ months in business, $10,000+ monthly revenue, 550+ credit score",
  learningEnabled: true,
  conversationGoals: [
    "capture_contact_info",
    "understand_business_needs", 
    "qualify_financing_requirements",
    "schedule_follow_up"
  ]
};

// Comprehensive FAQ Knowledge Base
const FAQ_RESPONSES = {
  company_info: {
    keywords: ['who are you', 'about company', 'about empire', 'tell me about'],
    response: `EMPIRE ENTREPRISE is a leading business financing company founded in 2020. We've helped thousands of businesses access over $500M in funding with:

✅ A+ BBB Rating
✅ Licensed in all 50 states  
✅ 50+ financing professionals
✅ 24-48 hour approval times
✅ Transparent, no-hidden-fee approach

Our mission is simple: provide fast, flexible financing that helps businesses grow and succeed. What would you like to know about our services?`
  },

  products_overview: {
    keywords: ['products', 'services', 'what do you offer', 'types of loans', 'financing options'],
    response: `We offer four comprehensive financing solutions:

🏭 **Equipment Financing** 
   • 5-15% APR • Up to $5M • 12-84 months
   • Finance new/used equipment with the equipment as collateral

💰 **Working Capital Loans**
   • 6-18% APR • Up to $2M • 3-36 months  
   • Fast cash flow solutions for operations and growth

🏛️ **SBA Loans**
   • 3-8% APR • Up to $5M • 5-25 years
   • Government-backed loans with the lowest rates available

📈 **Business Expansion Financing** 
   • 7-20% APR • Up to $10M • 6-60 months
   • Funding for growth, acquisitions, new locations

Which type interests you most? I can provide detailed requirements and rates.`
  },

  rates_and_terms: {
    keywords: ['rates', 'interest', 'apr', 'cost', 'terms', 'payment'],
    response: `Our rates are competitive and depend on several factors:

📊 **Rate Ranges by Product:**
• Equipment Financing: 5-15% APR
• Working Capital: 6-18% APR  
• SBA Loans: 3-8% APR (lowest available)
• Business Expansion: 7-20% APR

🎯 **Your rate depends on:**
• Personal & business credit scores
• Time in business & financial strength
• Loan amount & term length
• Industry type & cash flow stability

💡 **Better rates available for:** 12+ months in business, $25K+ monthly revenue, 650+ credit score

What's your approximate credit score? This helps me estimate your potential rate.`
  },

  qualification_requirements: {
    keywords: ['qualify', 'requirements', 'eligible', 'criteria', 'minimum'],
    response: `Here are our qualification requirements:

📋 **Minimum Requirements:**
✅ 3-6+ months in business (varies by product)
✅ $10,000+ monthly revenue
✅ 550+ personal credit score
✅ Valid business registration/license
✅ US-based business

⭐ **Preferred Qualifications (better rates):**
• 12+ months in business
• $25,000+ monthly revenue
• 650+ credit score
• Strong business & personal credit history

❌ **Industries we don't serve:**
Adult entertainment, gambling, MLM, illegal activities

Do you meet these basic requirements? I can help determine which products you'd likely qualify for.`
  },

  application_process: {
    keywords: ['application', 'apply', 'process', 'how to apply', 'get started'],
    response: `Our application process is simple and efficient:

1️⃣ **Online Application** (10-15 minutes)
   • Basic business & personal information
   • Financial details & funding needs

2️⃣ **Document Upload** 
   • Last 3 months bank statements
   • Business tax returns (1-2 years)
   • Valid government ID
   • Business license/registration

3️⃣ **Review & Decision** (24-48 hours)
   • Our underwriting team reviews your application
   • Initial approval decision provided quickly

4️⃣ **Final Approval & Funding** (1-5 business days)
   • Complete verification process
   • Receive funds via ACH transfer

💡 **No application fees** • **No prepayment penalties** (most products)

Ready to get started? What's your business name and type?`
  },

  timing_and_speed: {
    keywords: ['how long', 'fast', 'quick', 'time', 'speed', 'urgent'],
    response: `We pride ourselves on speed! Here are our typical timelines:

⚡ **Approval Times:**
• Working Capital: Same-day possible
• Equipment Financing: 24-48 hours
• Business Expansion: 3-7 days
• SBA Loans: 2-8 weeks (government process)

💨 **Funding After Approval:**
• Working Capital: 24-72 hours
• Equipment Financing: 1-5 business days
• Business Expansion: 1-2 weeks  
• SBA Loans: 4-12 weeks

🚀 **Fastest Options:** Working Capital loans can sometimes be approved and funded within 24 hours for qualified businesses.

What's your timeline? Do you need funding urgently or can you wait for better rates with SBA loans?`
  },

  contact_and_support: {
    keywords: ['contact', 'phone', 'call', 'speak to', 'talk to human'],
    response: `I'd love to connect you with our expert team:

📞 **Phone**: (123) 456-7890
📧 **Email**: papy@hempire-enterprise.com

🕒 **Business Hours:**
Monday-Friday: 8AM-8PM EST
Saturday: 9AM-5PM EST
Sunday: Closed

⚡ **Response Times:**
• Phone: Immediate during business hours
• Email: Under 2 hours during business hours
• Chat: 24/7 with AI, human backup available

💬 **Prefer to continue here?** I can pre-qualify you and answer questions right now!

What would you like to discuss about your financing needs?`
  }
};

// Enhanced pre-defined responses with learning capabilities
const SMART_RESPONSES = {
  greeting: [
    "Hello! I'm your EMPIRE ENTREPRISE financing specialist. I help businesses access the capital they need to grow and thrive. What brings you here today?",
    "Hi there! Welcome to EMPIRE ENTREPRISE. Whether you need equipment financing, working capital, or expansion funding, I'm here to find the perfect solution for your business. What type of business do you operate?",
    "Welcome! I'm the EMPIRE financing assistant, and I specialize in matching businesses with the right funding solutions. We've helped thousands of companies access over $500M in financing. How can I help your business today?",
    "Good day! I'm here to help you explore our comprehensive business financing options. From same-day working capital to long-term SBA loans, we have solutions for every business need. What's your biggest business challenge right now?"
  ],

  lead_capture_questions: [
    "To provide the most accurate information, could you share your name and the best email to reach you?",
    "I'd love to personalize our conversation. What's your name, and what's your business called?",
    "To help you get pre-qualified quickly, I'll need your name and contact information. What's the best email address to reach you?",
    "Let me get some basic information to provide tailored recommendations. What's your name and your business name?",
    "I can provide much more specific guidance with a few details. What's your name, and what type of business do you run?"
  ],

  business_questions: [
    "What type of business do you operate, and how long have you been in business?",
    "Tell me about your business - what industry are you in and what's your approximate monthly revenue?",
    "To recommend the best financing options, what's your business type and how much are you looking to borrow?",
    "What kind of business do you run, and what would you use the financing for?",
    "Help me understand your business better - what industry, how long operating, and what are your financing needs?"
  ],

  follow_up_questions: [
    "Based on what you've told me, it sounds like you might be a great fit for our programs. What's the best way to follow up with you?",
    "I'd love to have one of our specialists reach out with a personalized proposal. What's your preferred contact method?",
    "You seem like an ideal candidate for our financing solutions. Should I have someone call you, or would you prefer email?",
    "I can connect you with our funding specialists who can get you pre-approved quickly. What's your phone number?",
    "Our team would love to discuss specific rates and terms with you. What's the best time to reach you?"
  ]
};

// Question templates for lead generation
const LEAD_QUESTIONS = [
  {
    category: "business_info",
    questions: [
      "What type of business do you operate?",
      "How long have you been in business?",
      "What's your approximate monthly revenue?",
      "How many employees do you have?",
      "What industry are you in?"
    ]
  },
  {
    category: "financing_needs",
    questions: [
      "What amount of financing are you looking for?",
      "What would you use the financing for?",
      "When do you need the funds?",
      "Have you applied for business financing before?",
      "What's your current credit score range?"
    ]
  },
  {
    category: "contact_info",
    questions: [
      "What's your name?",
      "What's your business name?",
      "What's the best email to reach you?",
      "What's your phone number?",
      "Where is your business located?"
    ]
  }
];

// Enhanced intelligent response system with machine learning
class EnhancedLeadBot {
  static async generateResponse(message: string, sessionId: string, history: any[]): Promise<{response: string, leadData?: any}> {
    const lowerMessage = message.toLowerCase();
    const session = await this.getSession(sessionId);
    
    // Extract information from the message
    const extractedInfo = this.extractInformation(message, session);
    
    // Update session with new information
    if (extractedInfo) {
      await this.updateSession(sessionId, extractedInfo);
    }
    
    // Check for FAQ matches first (machine learning approach)
    let response = this.findFAQMatch(lowerMessage);
    
    if (!response) {
      // Use conversation flow logic
      response = await this.generateConversationResponse(message, session, lowerMessage);
    }
    
    // Add strategic follow-up question if appropriate
    const followUpQuestion = this.getStrategicFollowUp(session, response);
    if (followUpQuestion) {
      response += "\n\n" + followUpQuestion;
    }
    
    // Record interaction for machine learning
    await this.recordConversationForLearning(sessionId, message, response, extractedInfo);
    
    // Check if we have enough information to create a lead
    const leadData = this.createLeadIfReady(session);
    
    return { response, leadData };
  }

  static findFAQMatch(message: string): string | null {
    // Check each FAQ category for keyword matches
    for (const [category, faq] of Object.entries(FAQ_RESPONSES)) {
      const matchScore = faq.keywords.reduce((score, keyword) => {
        return score + (message.includes(keyword) ? 1 : 0);
      }, 0);
      
      // If we have a strong match (2+ keywords or 1 exact match)
      if (matchScore >= 1 || faq.keywords.some(keyword => message.includes(keyword))) {
        return faq.response;
      }
    }
    return null;
  }

  static async generateConversationResponse(message: string, session: any, lowerMessage: string): Promise<string> {
    // Handle greetings
    if (this.isGreeting(lowerMessage)) {
      return this.getRandomResponse(SMART_RESPONSES.greeting);
    }
    
    // If we don't have contact info, prioritize getting it
    if (!session.contactInfo?.email && !session.contactInfo?.name) {
      if (Math.random() < 0.7) { // 70% chance to ask for contact info
        return this.getRandomResponse(SMART_RESPONSES.lead_capture_questions);
      }
    }
    
    // If we have contact info but no business info, ask business questions
    if ((session.contactInfo?.email || session.contactInfo?.name) && !session.businessInfo?.type && !session.businessInfo?.revenue) {
      return this.getRandomResponse(SMART_RESPONSES.business_questions);
    }
    
    // If we have good information, offer to connect them with specialists
    if (session.informationScore >= 6) {
      return this.getRandomResponse(SMART_RESPONSES.follow_up_questions);
    }
    
    // Default contextual response
    return this.generateContextualResponse(message, session);
  }

  static getStrategicFollowUp(session: any, response: string): string | null {
    // Don't add follow-up if response already contains a question
    if (response.includes('?')) {
      return null;
    }
    
    // Prioritize contact information
    if (!session.contactInfo?.name) {
      return "By the way, I'd love to personalize our conversation. What's your name?";
    }
    
    if (!session.contactInfo?.email && !session.contactInfo?.phone) {
      return "What's the best email address to send you detailed information about our financing options?";
    }
    
    // Then business information
    if (!session.businessInfo?.type) {
      return "What type of business do you operate?";
    }
    
    if (!session.businessInfo?.revenue) {
      return "What's your approximate monthly revenue? This helps me recommend the best financing options.";
    }
    
    if (!session.financingNeeds?.amount) {
      return "How much financing are you looking for?";
    }
    
    // Encourage application if we have good info
    if (session.informationScore > 7) {
      return "Based on what you've shared, you look like a strong candidate for our financing programs. Would you like me to connect you with a specialist for personalized rates and terms?";
    }
    
    return null;
  }

  static async recordConversationForLearning(sessionId: string, userMessage: string, botResponse: string, extractedInfo: any): Promise<void> {
    try {
      const learningData = {
        timestamp: new Date().toISOString(),
        sessionId,
        userMessage: userMessage.toLowerCase(),
        botResponse,
        extractedInfo,
        messageLength: userMessage.length,
        topics: this.extractTopics(userMessage),
        intent: this.classifyIntent(userMessage),
        sentiment: this.analyzeSentiment(userMessage),
        responseType: botResponse.includes('FAQ_RESPONSES') ? 'faq' : 'conversational'
      };

      // Store for machine learning
      await redis.lpush('chat:learning:conversations', JSON.stringify(learningData));
      await redis.expire('chat:learning:conversations', 86400 * 30); // 30 days

      // Update topic frequency for learning
      for (const topic of learningData.topics) {
        await redis.hincrby('chat:learning:topic_frequency', topic, 1);
      }

      // Track successful information extraction
      if (Object.values(extractedInfo).some(val => val !== null)) {
        await redis.hincrby('chat:learning:extraction_success', new Date().toISOString().split('T')[0], 1);
      }

    } catch (error) {
      console.error('Error recording conversation for learning:', error);
    }
  }

  static extractTopics(message: string): string[] {
    const topics = [];
    const lowerMessage = message.toLowerCase();

    // Product topics
    if (lowerMessage.includes('equipment') || lowerMessage.includes('machinery')) topics.push('equipment');
    if (lowerMessage.includes('working capital') || lowerMessage.includes('cash flow')) topics.push('working_capital');
    if (lowerMessage.includes('sba') || lowerMessage.includes('government')) topics.push('sba');
    if (lowerMessage.includes('expansion') || lowerMessage.includes('grow')) topics.push('expansion');

    // Process topics
    if (lowerMessage.includes('apply') || lowerMessage.includes('application')) topics.push('application');
    if (lowerMessage.includes('qualify') || lowerMessage.includes('requirements')) topics.push('qualification');
    if (lowerMessage.includes('rate') || lowerMessage.includes('interest')) topics.push('rates');
    if (lowerMessage.includes('time') || lowerMessage.includes('fast')) topics.push('timing');

    // Business topics
    if (lowerMessage.includes('restaurant') || lowerMessage.includes('retail') || lowerMessage.includes('construction')) topics.push('industry');
    if (lowerMessage.includes('revenue') || lowerMessage.includes('sales')) topics.push('revenue');
    if (lowerMessage.includes('credit') || lowerMessage.includes('score')) topics.push('credit');

    return topics;
  }

  static classifyIntent(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('apply') || lowerMessage.includes('start application')) return 'apply';
    if (lowerMessage.includes('qualify') || lowerMessage.includes('eligible')) return 'check_qualification';
    if (lowerMessage.includes('rate') || lowerMessage.includes('cost')) return 'pricing_inquiry';
    if (lowerMessage.includes('how long') || lowerMessage.includes('time')) return 'timeline_inquiry';
    if (lowerMessage.includes('contact') || lowerMessage.includes('speak to')) return 'contact_request';
    if (lowerMessage.includes('products') || lowerMessage.includes('services')) return 'product_inquiry';
    if (lowerMessage.includes('help') || lowerMessage.includes('information')) return 'information_request';
    
    return 'general_inquiry';
  }

  static analyzeSentiment(message: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['great', 'excellent', 'good', 'interested', 'yes', 'perfect', 'awesome', 'helpful', 'thanks', 'thank you'];
    const negativeWords = ['bad', 'terrible', 'no', 'not interested', 'expensive', 'slow', 'difficult', 'confused', 'frustrated'];
    
    const lowerMessage = message.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerMessage.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerMessage.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  static async trackConversationMetrics(sessionId: string, message: string, response: string): Promise<void> {
    try {
      const metrics = {
        timestamp: new Date().toISOString(),
        sessionId,
        userMessage: message,
        botResponse: response,
        messageLength: message.length,
        responseLength: response.length,
        topics: this.extractTopics(message),
        intent: this.classifyIntent(message),
        sentiment: this.analyzeSentiment(message)
      };
      
      await redis.lpush(`conversation_metrics:${sessionId}`, JSON.stringify(metrics));
      await redis.expire(`conversation_metrics:${sessionId}`, 86400 * 7); // Keep for 7 days
      
    } catch (error) {
      console.error('Error tracking conversation metrics:', error);
    }
  }

  static async notifyAdminOfHighPriorityLead(leadData: any): Promise<void> {
    try {
      const notification = {
        type: 'high_priority_lead',
        leadId: leadData.id,
        message: `New high-priority lead: ${leadData.name} from ${leadData.businessName}`,
        timestamp: new Date().toISOString(),
        leadSummary: {
          name: leadData.name,
          email: leadData.email,
          businessName: leadData.businessName,
          loanAmount: leadData.loanAmount,
          qualificationScore: leadData.qualificationScore
        }
      };
      
      await redis.lpush('admin_notifications', JSON.stringify(notification));
      await redis.expire('admin_notifications', 86400 * 7); // Keep for 7 days
      
      console.log('High-priority lead notification created:', leadData.id);
    } catch (error) {
      console.error('Error notifying admin of high-priority lead:', error);
    }
  }
  
  static async getSession(sessionId: string): Promise<any> {
    try {
      const sessionData = await redis.get(`chat_session:${sessionId}`);
      return sessionData ? JSON.parse(sessionData) : {
        businessInfo: {},
        financingNeeds: {},
        contactInfo: {},
        conversationData: [],
        questionsAsked: [],
        informationScore: 0
      };
    } catch (error) {
      console.error('Error getting session:', error);
      return {
        businessInfo: {},
        financingNeeds: {},
        contactInfo: {},
        conversationData: [],
        questionsAsked: [],
        informationScore: 0
      };
    }
  }
  
  static async updateSession(sessionId: string, newInfo: any): Promise<void> {
    try {
      const session = await this.getSession(sessionId);
      
      // Merge new information
      if (newInfo.businessInfo) {
        session.businessInfo = { ...session.businessInfo, ...newInfo.businessInfo };
      }
      if (newInfo.financingNeeds) {
        session.financingNeeds = { ...session.financingNeeds, ...newInfo.financingNeeds };
      }
      if (newInfo.contactInfo) {
        session.contactInfo = { ...session.contactInfo, ...newInfo.contactInfo };
      }
      
      // Update information score
      session.informationScore = this.calculateInformationScore(session);
      
      // Store updated session
      await redis.set(`chat_session:${sessionId}`, JSON.stringify(session), 'EX', 86400); // 24 hours
    } catch (error) {
      console.error('Error updating session:', error);
    }
  }
  
  static extractInformation(message: string, session: any): any {
    const extracted: any = {};
    const lowerMessage = message.toLowerCase();
    
    // Extract business information
    if (this.containsBusinessType(lowerMessage)) {
      extracted.businessInfo = { ...extracted.businessInfo, type: this.extractBusinessType(lowerMessage) };
    }
    
    if (this.containsRevenue(lowerMessage)) {
      extracted.businessInfo = { ...extracted.businessInfo, revenue: this.extractRevenue(lowerMessage) };
    }
    
    if (this.containsEmployeeCount(lowerMessage)) {
      extracted.businessInfo = { ...extracted.businessInfo, employees: this.extractEmployeeCount(lowerMessage) };
    }
    
    if (this.containsTimeInBusiness(lowerMessage)) {
      extracted.businessInfo = { ...extracted.businessInfo, timeInBusiness: this.extractTimeInBusiness(lowerMessage) };
    }
    
    // Extract financing needs
    if (this.containsLoanAmount(lowerMessage)) {
      extracted.financingNeeds = { ...extracted.financingNeeds, amount: this.extractLoanAmount(lowerMessage) };
    }
    
    if (this.containsLoanPurpose(lowerMessage)) {
      extracted.financingNeeds = { ...extracted.financingNeeds, purpose: this.extractLoanPurpose(lowerMessage) };
    }
    
    if (this.containsCreditScore(lowerMessage)) {
      extracted.financingNeeds = { ...extracted.financingNeeds, creditScore: this.extractCreditScore(lowerMessage) };
    }
    
    // Extract contact information
    if (this.containsEmail(message)) {
      extracted.contactInfo = { ...extracted.contactInfo, email: this.extractEmail(message) };
    }
    
    if (this.containsPhone(message)) {
      extracted.contactInfo = { ...extracted.contactInfo, phone: this.extractPhone(message) };
    }
    
    if (this.containsName(message, session)) {
      extracted.contactInfo = { ...extracted.contactInfo, name: this.extractName(message) };
    }
    
    if (this.containsBusinessName(message, session)) {
      extracted.contactInfo = { ...extracted.contactInfo, businessName: this.extractBusinessName(message) };
    }
    
    return Object.keys(extracted).length > 0 ? extracted : null;
  }
  
  // Utility methods for pattern matching and extraction
  static isGreeting(message: string): boolean {
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'];
    return greetings.some(greeting => message.includes(greeting));
  }
  
  static isProductInquiry(message: string): boolean {
    const keywords = ['products', 'services', 'loans', 'financing', 'what do you offer', 'options'];
    return keywords.some(keyword => message.includes(keyword));
  }
  
  static isQualificationInquiry(message: string): boolean {
    const keywords = ['qualify', 'requirements', 'eligible', 'criteria', 'do i qualify'];
    return keywords.some(keyword => message.includes(keyword));
  }
  
  static isRateInquiry(message: string): boolean {
    const keywords = ['rate', 'interest', 'apr', 'cost', 'percentage'];
    return keywords.some(keyword => message.includes(keyword));
  }
  
  static isContactRequest(message: string): boolean {
    const keywords = ['contact', 'call me', 'reach out', 'speak to someone', 'human'];
    return keywords.some(keyword => message.includes(keyword));
  }
  
  static isApplicationInterest(message: string): boolean {
    const keywords = ['apply', 'application', 'start', 'begin', 'get started'];
    return keywords.some(keyword => message.includes(keyword));
  }
  
  static containsBusinessType(message: string): boolean {
    const types = ['restaurant', 'retail', 'construction', 'manufacturing', 'service', 'consulting', 'medical', 'dental'];
    return types.some(type => message.includes(type));
  }
  
  static extractBusinessType(message: string): string {
    const types = ['restaurant', 'retail', 'construction', 'manufacturing', 'service', 'consulting', 'medical', 'dental'];
    return types.find(type => message.includes(type)) || '';
  }
  
  static containsRevenue(message: string): boolean {
    return /\$\d+[\d,]*\s*(month|monthly|per month|revenue|sales)/i.test(message) || 
           /\d+[\d,]*\s*(dollars|k|thousand|million)\s*(month|monthly|revenue|sales)/i.test(message);
  }
  
  static extractRevenue(message: string): string {
    const match = message.match(/\$?([\d,]+)\s*(?:k|thousand|million)?\s*(?:month|monthly|revenue|sales)/i);
    return match ? match[1] : '';
  }
  
  static containsEmployeeCount(message: string): boolean {
    return /\d+\s*employees?/i.test(message) || /team of \d+/i.test(message);
  }
  
  static extractEmployeeCount(message: string): string {
    const match = message.match(/(\d+)\s*(?:employees?|team)/i);
    return match ? match[1] : '';
  }
  
  static containsTimeInBusiness(message: string): boolean {
    return /\d+\s*(?:years?|months?)\s*(?:in business|operating|established)/i.test(message);
  }
  
  static extractTimeInBusiness(message: string): string {
    const match = message.match(/(\d+\s*(?:years?|months?))/i);
    return match ? match[1] : '';
  }
  
  static containsLoanAmount(message: string): boolean {
    return /\$\d+[\d,]*(?:\s*(?:k|thousand|million))?(?:\s*(?:loan|financing|capital))?/i.test(message) ||
           /(?:need|looking for|want)\s*\$?\d+/i.test(message);
  }
  
  static extractLoanAmount(message: string): string {
    const match = message.match(/\$?([\d,]+)\s*(?:k|thousand|million)?/i);
    return match ? match[1] : '';
  }
  
  static containsLoanPurpose(message: string): boolean {
    const purposes = ['equipment', 'inventory', 'expansion', 'working capital', 'payroll', 'marketing'];
    return purposes.some(purpose => message.includes(purpose));
  }
  
  static extractLoanPurpose(message: string): string {
    const purposes = ['equipment', 'inventory', 'expansion', 'working capital', 'payroll', 'marketing'];
    return purposes.find(purpose => message.includes(purpose)) || '';
  }
  
  static containsCreditScore(message: string): boolean {
    return /credit score|score|fico|credit rating/i.test(message) || /\d{3}\s*(?:credit|score|fico)/i.test(message);
  }
  
  static extractCreditScore(message: string): string {
    const match = message.match(/(\d{3})/);
    return match ? match[1] : '';
  }
  
  static containsEmail(message: string): boolean {
    return /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i.test(message);
  }
  
  static extractEmail(message: string): string {
    const match = message.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i);
    return match ? match[0] : '';
  }
  
  static containsPhone(message: string): boolean {
    return /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(message);
  }
  
  static extractPhone(message: string): string {
    const match = message.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    return match ? match[0] : '';
  }
  
  static containsName(message: string, session: any): boolean {
    // Look for "my name is", "i'm", etc.
    return /(?:my name is|i'm|i am|call me)\s+([a-zA-Z\s]+)/i.test(message) && !session.contactInfo?.name;
  }
  
  static extractName(message: string): string {
    const match = message.match(/(?:my name is|i'm|i am|call me)\s+([a-zA-Z\s]+)/i);
    return match ? match[1].trim() : '';
  }
  
  static containsBusinessName(message: string, session: any): boolean {
    return /(?:business name|company|business)\s+(?:is\s+)?([a-zA-Z\s&]+)/i.test(message) && !session.contactInfo?.businessName;
  }
  
  static extractBusinessName(message: string): string {
    const match = message.match(/(?:business name|company|business)\s+(?:is\s+)?([a-zA-Z\s&]+)/i);
    return match ? match[1].trim() : '';
  }
  
  static generateContextualResponse(message: string, session: any): string {
    const responses = [
      "That's interesting! I'd love to learn more about your business to see how we can help.",
      "Thanks for sharing that information. Let me ask you a question to better understand your needs.",
      "I appreciate you telling me that. It helps me provide more personalized assistance.",
      "Great! That gives me a better picture of your situation.",
      "Thank you for that information. It's helpful in finding the right financing solution for you."
    ];
    
    return this.getRandomResponse(responses);
  }
  
  static getNextStrategicQuestion(session: any): string | null {
    // Prioritize getting contact information first
    if (!session.contactInfo?.name) {
      return "By the way, what's your name? I'd like to personalize our conversation.";
    }
    
    if (!session.contactInfo?.businessName) {
      return "What's the name of your business?";
    }
    
    // Then business information
    if (!session.businessInfo?.type) {
      return "What type of business do you operate?";
    }
    
    if (!session.businessInfo?.timeInBusiness) {
      return "How long have you been in business?";
    }
    
    if (!session.businessInfo?.revenue) {
      return "What's your approximate monthly revenue?";
    }
    
    // Then financing needs
    if (!session.financingNeeds?.amount) {
      return "What amount of financing are you looking for?";
    }
    
    if (!session.financingNeeds?.purpose) {
      return "What would you use the financing for?";
    }
    
    // Finally contact information for follow-up
    if (!session.contactInfo?.email) {
      return "What's the best email address to reach you at?";
    }
    
    if (!session.contactInfo?.phone) {
      return "What's your phone number in case we need to reach you?";
    }
    
    // If we have most information, encourage application
    if (session.informationScore > 7) {
      return "Based on what you've told me, it sounds like we might be able to help! Would you like to start a quick application?";
    }
    
    return null;
  }
  
  static calculateInformationScore(session: any): number {
    let score = 0;
    
    // Contact information (most important for lead generation)
    if (session.contactInfo?.name) score += 2;
    if (session.contactInfo?.email) score += 3; // Email is crucial
    if (session.contactInfo?.phone) score += 2;
    if (session.contactInfo?.businessName) score += 1;
    
    // Business information (important for qualification)
    if (session.businessInfo?.type) score += 1;
    if (session.businessInfo?.timeInBusiness) score += 1;
    if (session.businessInfo?.revenue) score += 2; // Revenue is crucial for qualification
    if (session.businessInfo?.employees) score += 0.5;
    
    // Financing needs (important for matching products)
    if (session.financingNeeds?.amount) score += 1.5;
    if (session.financingNeeds?.purpose) score += 1;
    if (session.financingNeeds?.creditScore) score += 1;
    
    return score;
  }
  
  static createLeadIfReady(session: any): any {
    // Enhanced lead qualification
    const hasMinimumInfo = session.informationScore >= 4;
    const hasContactInfo = session.contactInfo?.email || session.contactInfo?.phone;
    const hasBusinessInfo = session.businessInfo?.type || session.businessInfo?.revenue;
    
    if (hasMinimumInfo && hasContactInfo && hasBusinessInfo) {
      const leadData = {
        id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: session.contactInfo.name || 'Unknown',
        email: session.contactInfo.email || '',
        phone: session.contactInfo.phone || '',
        businessName: session.contactInfo.businessName || '',
        businessType: session.businessInfo.type || '',
        timeInBusiness: session.businessInfo.timeInBusiness || '',
        monthlyRevenue: session.businessInfo.revenue || '',
        employees: session.businessInfo.employees || '',
        loanAmount: session.financingNeeds.amount || '',
        loanPurpose: session.financingNeeds.purpose || '',
        creditScore: session.financingNeeds.creditScore || '',
        source: 'Chat Bot Conversation',
        status: 'New',
        priority: this.calculateLeadPriority(session),
        qualificationScore: session.informationScore,
        interestLevel: this.determineInterestLevel(session),
        notes: this.generateLeadNotes(session),
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        readyForApplication: session.informationScore >= 8 // Flag to indicate if ready for application redirect
      };
      
      return leadData;
    }
    return null;
  }
  
  static calculateLeadPriority(session: any): 'high' | 'medium' | 'low' {
    const score = session.informationScore;
    const hasRevenue = session.businessInfo?.revenue;
    const hasLoanAmount = session.financingNeeds?.amount;
    const hasTimeInBusiness = session.businessInfo?.timeInBusiness;
    
    // High priority: Complete information with strong qualifications
    if (score >= 8 && hasRevenue && hasLoanAmount && hasTimeInBusiness) {
      return 'high';
    }
    
    // Medium priority: Good information with some qualifications
    if (score >= 5 && (hasRevenue || hasLoanAmount)) {
      return 'medium';
    }
    
    // Low priority: Basic information only
    return 'low';
  }
  
  static determineInterestLevel(session: any): 'high' | 'medium' | 'low' {
    // Analyze conversation for interest indicators
    const conversationData = session.conversationData || [];
    const userMessages = conversationData.filter(msg => msg.role === 'user').map(msg => msg.content.toLowerCase());
    
    const highInterestKeywords = ['need', 'urgent', 'asap', 'immediately', 'apply', 'start application', 'when can', 'how fast'];
    const mediumInterestKeywords = ['interested', 'looking for', 'considering', 'might need', 'thinking about'];
    const lowInterestKeywords = ['maybe', 'just looking', 'just browsing', 'not sure'];
    
    const allText = userMessages.join(' ');
    
    if (highInterestKeywords.some(keyword => allText.includes(keyword))) {
      return 'high';
    }
    
    if (mediumInterestKeywords.some(keyword => allText.includes(keyword))) {
      return 'medium';
    }
    
    return 'low';
  }
  
  static generateLeadNotes(session: any): string {
    const notes = [];
    
    if (session.businessInfo?.type) {
      notes.push(`Business Type: ${session.businessInfo.type}`);
    }
    
    if (session.businessInfo?.revenue) {
      notes.push(`Monthly Revenue: ${session.businessInfo.revenue}`);
    }
    
    if (session.financingNeeds?.amount) {
      notes.push(`Financing Amount: ${session.financingNeeds.amount}`);
    }
    
    if (session.financingNeeds?.purpose) {
      notes.push(`Purpose: ${session.financingNeeds.purpose}`);
    }
    
    notes.push(`Qualification Score: ${session.informationScore}/12`);
    notes.push(`Interest Level: ${this.determineInterestLevel(session)}`);
    
    return notes.join(' | ');
  }
  
  // Enhanced conversation analytics (moved to avoid duplication)
  static async updateGlobalAnalytics(metrics: any): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const analyticsKey = `chat_analytics:${today}`;
      
      // Increment conversation count
      await redis.hincrby(analyticsKey, 'total_conversations', 1);
      
      // Track information extraction success
      if (Object.keys(metrics.extractedInfo).length > 0) {
        await redis.hincrby(analyticsKey, 'successful_extractions', 1);
      }
      
      // Set expiration for analytics data (30 days)
      await redis.expire(analyticsKey, 86400 * 30);
    } catch (error) {
      console.error('Error updating global analytics:', error);
    }
  }
  
  static analyzeInformationExtraction(message: string): any {
    const extracted = {};
    const lowerMessage = message.toLowerCase();
    
    // Track what types of information were extracted
    if (this.containsEmail(message)) extracted['email'] = true;
    if (this.containsPhone(message)) extracted['phone'] = true;
    if (this.containsBusinessType(lowerMessage)) extracted['businessType'] = true;
    if (this.containsRevenue(lowerMessage)) extracted['revenue'] = true;
    if (this.containsLoanAmount(lowerMessage)) extracted['loanAmount'] = true;
    
    return extracted;
  }
  
  static getRandomResponse(responses: string[]): string {
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
    
    // Generate intelligent response
    const { response, leadData } = await EnhancedLeadBot.generateResponse(message, chatSessionId, history);
    
    // Track conversation metrics for learning
    await EnhancedLeadBot.trackConversationMetrics(chatSessionId, message, response);
    
    // Store conversation in session
    const conversationEntry = {
      timestamp: new Date().toISOString(),
      userMessage: message,
      botResponse: response,
      sessionId: chatSessionId
    };
    
    await redis.lpush(`chat_session:${chatSessionId}`, JSON.stringify(conversationEntry));
    await redis.expire(`chat_session:${chatSessionId}`, 86400 * 7); // Keep for 7 days
    
    // Save lead if we have enough information
    let leadId = null;
    if (leadData) {
      try {
        leadId = leadData.id;
        await redis.set(`chat:lead:${chatSessionId}`, JSON.stringify(leadData));
        await redis.sadd('leads', leadId);
        await redis.expire(`chat:lead:${chatSessionId}`, 86400 * 30); // Keep leads for 30 days
        
        console.log('New lead created from chat:', leadId);
        
        // Send notification to admin about new high-priority lead
        if (leadData.priority === 'high') {
          await EnhancedLeadBot.notifyAdminOfHighPriorityLead(leadData);
        }
      } catch (leadError) {
        console.error('Error saving lead:', leadError);
      }
    }
    
    return NextResponse.json({ 
      message: response,
      sessionId: chatSessionId,
      leadGenerated: !!leadData,
      leadId: leadId,
      conversationQuality: leadData ? leadData.qualificationScore : 0,
      readyForApplication: leadData ? leadData.readyForApplication : false
    });
    
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    
    // Enhanced fallback responses based on error type
    const fallbackResponses = [
      "I'm here to help you discover the perfect financing solution for your business! What type of business do you operate?",
      "Welcome to EMPIRE ENTREPRISE! I specialize in business financing. How can I help accelerate your business growth today?",
      "Hi there! I'm your business financing specialist. What's your biggest business challenge right now?",
      "Hello! I'm here to help you explore smart financing options. What brings you to EMPIRE ENTREPRISE today?"
    ];
    
    const fallbackResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    
    return NextResponse.json({ 
      message: fallbackResponse,
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
