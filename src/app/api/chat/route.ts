import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';

// Enhanced lead generation bot configuration
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

// Enhanced pre-defined responses with multiple variations for learning
const RESPONSES = {
  greeting: [
    "Hello! I'm the EMPIRE Assistant. I specialize in helping businesses find the right financing solutions. What brings you here today?",
    "Hi there! Welcome to EMPIRE ENTREPRISE. I'd love to help you discover financing options that could accelerate your business growth. What's your biggest business challenge right now?",
    "Welcome! I'm here to help you explore smart financing solutions for your business. What type of business are you running?",
    "Good day! I'm the EMPIRE financing specialist. Whether you need equipment, working capital, or expansion funding, I'm here to help. What's your business focus?"
  ],
  products: [
    `We offer several powerful financing solutions:
• Equipment Financing - Purchase or upgrade business equipment (5-15% rates)
• Working Capital Loans - Boost cash flow and operations ($10K-$500K)
• SBA Loans - Government-backed loans with competitive rates
• Business Expansion Financing - Fuel your growth and scale

Which of these resonates most with your current needs?`,
    `Here are our core financing products:
🚀 Equipment Financing - Get the tools you need to succeed
💰 Working Capital - Keep operations flowing smoothly  
🏛️ SBA Loans - Government-backed, lower-rate options
📈 Expansion Financing - Scale your business to the next level

What's your primary business objective right now?`
  ],
  qualifications: [
    `Our basic requirements are designed to help established businesses:
✅ 6+ months in business (demonstrates stability)
✅ $10,000+ monthly revenue (shows cash flow)
✅ 550+ credit score (reasonable credit history)

Do these align with your business profile?`,
    `We work with businesses that meet these criteria:
• Operating for at least 6 months
• Generating $10K+ monthly revenue
• Personal credit score of 550 or higher

Where does your business stand on these requirements?`
  ],
  rates: [
    "Our rates are competitive, typically ranging from 5% to 15% based on your business strength, credit profile, and loan type. Many of our clients are pleasantly surprised by how affordable business financing can be. What's your approximate credit score?",
    "Interest rates depend on several factors including your business performance and credit profile. Our range is typically 5-15%, with many qualifying businesses getting rates on the lower end. Have you checked your business credit score recently?"
  ],
  contact: [
    `Our team is ready to help you succeed:
📧 Email: ${BOT_CONFIG.contact.email}
📞 Phone: ${BOT_CONFIG.contact.phone}

Would you prefer a quick call or email follow-up to discuss your specific needs?`,
    `You can reach our financing specialists directly:
• Email: ${BOT_CONFIG.contact.email} 
• Phone: ${BOT_CONFIG.contact.phone}

What's the best way for us to follow up with you?`
  ],
  application: [
    "Excellent! Our streamlined application takes about 10-15 minutes and you'll get a decision within 24-48 hours. To personalize your experience, what's your business name?",
    "Great choice! The application process is straightforward - just 10-15 minutes of your time for a potential game-changer for your business. Let's start with your business name."
  ]
};

// Intelligent response system
class LeadBot {
  static async generateResponse(message: string, sessionId: string, history: any[]): Promise<{response: string, leadData?: any}> {
    const lowerMessage = message.toLowerCase();
    const session = await this.getSession(sessionId);
    
    // Extract information from the message
    const extractedInfo = this.extractInformation(message, session);
    
    // Update session with new information
    if (extractedInfo) {
      await this.updateSession(sessionId, extractedInfo);
    }
    
    // Determine response strategy
    let response = "";
    let shouldAskQuestion = false;
    
    // Handle greetings
    if (this.isGreeting(lowerMessage)) {
      response = this.getRandomResponse(RESPONSES.greeting);
      shouldAskQuestion = true;
    }
    // Handle product inquiries
    else if (this.isProductInquiry(lowerMessage)) {
      response = this.getRandomResponse(RESPONSES.products);
      shouldAskQuestion = true;
    }
    // Handle qualification questions
    else if (this.isQualificationInquiry(lowerMessage)) {
      response = this.getRandomResponse(RESPONSES.qualifications);
      shouldAskQuestion = true;
    }
    // Handle rate inquiries
    else if (this.isRateInquiry(lowerMessage)) {
      response = this.getRandomResponse(RESPONSES.rates);
      shouldAskQuestion = false; // Already asking for credit score
    }
    // Handle contact requests
    else if (this.isContactRequest(lowerMessage)) {
      response = this.getRandomResponse(RESPONSES.contact);
      if (!session.contactInfo?.email) {
        response += "\n\nTo have someone reach out, what's the best email address to contact you?";
      }
    }
    // Handle application interest
    else if (this.isApplicationInterest(lowerMessage)) {
      response = this.getRandomResponse(RESPONSES.application);
      shouldAskQuestion = false; // Already asking for business name
    }
    // Provide helpful response and ask strategic question
    else {
      response = this.generateContextualResponse(message, session);
      shouldAskQuestion = true;
    }
    
    // Add strategic question if needed
    if (shouldAskQuestion) {
      const question = this.getNextStrategicQuestion(session);
      if (question) {
        response += "\n\n" + question;
      }
    }
    
    // Check if we have enough information to create a lead
    const leadData = this.createLeadIfReady(session);
    
    return { response, leadData };
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
      return {
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
        lastUpdated: new Date().toISOString()
      };
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
  
  // Enhanced conversation analytics
  static async trackConversationMetrics(sessionId: string, message: string, response: string): Promise<void> {
    try {
      const metrics = {
        timestamp: new Date().toISOString(),
        userMessage: message,
        botResponse: response,
        messageLength: message.length,
        responseLength: response.length,
        extractedInfo: this.analyzeInformationExtraction(message)
      };
      
      await redis.lpush(`conversation_metrics:${sessionId}`, JSON.stringify(metrics));
      await redis.expire(`conversation_metrics:${sessionId}`, 86400 * 7); // Keep for 7 days
      
      // Update global conversation analytics
      await this.updateGlobalAnalytics(metrics);
    } catch (error) {
      console.error('Error tracking conversation metrics:', error);
    }
  }
  
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
  
  // Notify admin of high-priority leads
  static async notifyAdminOfHighPriorityLead(leadData: any): Promise<void> {
    try {
      // Store high-priority lead notification
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
    const { response, leadData } = await LeadBot.generateResponse(message, chatSessionId, history);
    
    // Track conversation metrics for learning
    await LeadBot.trackConversationMetrics(chatSessionId, message, response);
    
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
          await LeadBot.notifyAdminOfHighPriorityLead(leadData);
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
      conversationQuality: leadData ? leadData.qualificationScore : 0
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
