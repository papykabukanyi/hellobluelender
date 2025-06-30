import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/permissions';
import redis from '@/lib/redis';

// API route to fetch leads
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and has permissions
    const currentAdmin = await requirePermission(request, 'viewApplications');
    
    // If requirePermission returns a NextResponse, it means unauthorized
    if ('status' in currentAdmin && currentAdmin.status === 403) {
      return currentAdmin;
    }
      // Check if user is a super admin (hardcoded correct email)
    const superAdminEmail = 'papy@hempire-entreprise.com';
    console.log('Leads API - Current admin:', currentAdmin.email, 'Super admin:', superAdminEmail);
    
    if (currentAdmin.email !== superAdminEmail) {
      console.log('Access denied: Not super admin');
      return NextResponse.json(
        { success: false, error: 'Only the super admin can access this endpoint' },
        { status: 403 }
      );
    }
    
    console.log('Super admin access granted for leads');
    
    // Get leads from Redis - chat leads and incomplete applications
    const leadKeys = await redis.keys('chat:lead:*');
    const chatSessionKeys = await redis.keys('chat:session:*');
    const incompleteAppKeys = await redis.keys('application:incomplete:*');
    
    const leads = [];
    
    // Process chat leads first (highest priority)
    for (const key of leadKeys) {
      const leadData = await redis.get(key);
      if (leadData) {
        try {
          const parsedLead = JSON.parse(leadData);
          const sessionId = key.split(':')[2]; // Extract session ID from key

          leads.push({
            id: parsedLead.id || sessionId,
            source: 'chat',
            priority: parsedLead.priority || 'medium',
            firstName: parsedLead.name ? parsedLead.name.split(' ')[0] : '',
            lastName: parsedLead.name && parsedLead.name.split(' ').length > 1 ? 
              parsedLead.name.split(' ').slice(1).join(' ') : '',
            email: parsedLead.email || '',
            phone: parsedLead.phone || '',
            businessName: parsedLead.businessName || '',
            businessType: parsedLead.businessType || '',
            loanAmount: parsedLead.loanAmount || '',
            monthlyRevenue: parsedLead.monthlyRevenue || '',
            creditScore: parsedLead.creditScore || '',
            qualificationScore: parsedLead.qualificationScore || 0,
            notes: parsedLead.notes || '',
            createdAt: parsedLead.createdAt || new Date().toISOString()
          });
        } catch (err) {
          console.error('Error parsing lead data:', err);
        }
      }
    }
    
    // Process chat sessions that aren't already identified as leads
    for (const key of chatSessionKeys) {
      const sessionId = key.split(':')[2];
      // Skip if we already processed this as a lead
      if (leads.some(lead => lead.id === sessionId)) {
        continue;
      }
      
      const chatData = await redis.get(key);
      if (chatData) {
        try {
          const parsedChat = JSON.parse(chatData);
          
          // Extract contact information from chat messages
          const userMessages = parsedChat.filter(msg => msg.role === 'user');
          const contactInfo = extractContactInfo(userMessages);
          
          if (contactInfo.email || contactInfo.phone) {
            leads.push({
              id: sessionId,
              source: 'chat',
              priority: 'low', // Lower priority since not explicitly marked as lead
              chatMessages: parsedChat.slice(0, 5), // Include first 5 messages
              createdAt: new Date().toISOString(), // Using current date as fallback
              ...contactInfo // Include extracted contact info
            });
          }
        } catch (err) {
          console.error('Error parsing chat data:', err);
        }
      }
    }
    
    // Process incomplete applications
    for (const key of incompleteAppKeys) {
      const appData = await redis.get(key);
      if (appData) {
        try {          
          const parsedApp = JSON.parse(appData);
          const sessionId = key.split(':')[2]; // Extract session ID from key
          
          // Extract relevant information
          const leadInfo: any = {
            id: sessionId,
            source: 'incomplete_application',
            priority: 'high', // High priority since they started an application
            createdAt: parsedApp.createdAt || new Date().toISOString()
          };
          
          if (parsedApp.personalInfo) {
            leadInfo.firstName = parsedApp.personalInfo.firstName;
            leadInfo.lastName = parsedApp.personalInfo.lastName;
            leadInfo.email = parsedApp.personalInfo.email;
            leadInfo.phone = parsedApp.personalInfo.phone;
          }
          
          if (parsedApp.businessInfo) {
            leadInfo.businessName = parsedApp.businessInfo.businessName;
          }
          
          leads.push(leadInfo);
        } catch (err) {
          console.error('Error parsing application data:', err);
        }
      }
    }
    
    // Sort leads by priority (high -> medium -> low)
    leads.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority || 'low'] - priorityOrder[b.priority || 'low'];
    });
    
    return NextResponse.json({ success: true, leads });
  } catch (error) {
    console.error('Error in leads API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

// Helper function to extract contact info from chat messages
function extractContactInfo(messages) {
  const contactInfo = {
    email: null,
    phone: null,
    firstName: null,
    lastName: null,
    businessName: null
  };
  
  // Regular expressions for email and phone
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const phoneRegex = /\b(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g;
  const nameRegex = /(?:my name is|I am|I'm) ([A-Z][a-z]+(?: [A-Z][a-z]+)?)/i;
  const businessRegex = /(?:my business|company|our business|our company) (?:is|name is) ([^,.]+)/i;
  
  for (const message of messages) {
    const content = message.content;
    
    // Find email
    if (!contactInfo.email) {
      const emailMatch = content.match(emailRegex);
      if (emailMatch) contactInfo.email = emailMatch[0];
    }
    
    // Find phone
    if (!contactInfo.phone) {
      const phoneMatch = content.match(phoneRegex);
      if (phoneMatch) contactInfo.phone = phoneMatch[0];
    }
    
    // Find name
    if (!contactInfo.firstName) {
      const nameMatch = content.match(nameRegex);
      if (nameMatch && nameMatch[1]) {
        const nameParts = nameMatch[1].trim().split(' ');
        if (nameParts.length >= 1) contactInfo.firstName = nameParts[0];
        if (nameParts.length >= 2) contactInfo.lastName = nameParts.slice(1).join(' ');
      }
    }
    
    // Find business name
    if (!contactInfo.businessName) {
      const businessMatch = content.match(businessRegex);
      if (businessMatch && businessMatch[1]) {
        contactInfo.businessName = businessMatch[1].trim();
      }
    }
  }
  
  return contactInfo;
}
