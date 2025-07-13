'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface FormField {
  name: string;
  value: string;
  type: string;
  required: boolean;
}

interface ApplicationData {
  step: number;
  formData: {
    personalInfo: any;
    businessInfo: any;
    loanInfo: any;
    bankInfo: any;
  };
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [collectedInfo, setCollectedInfo] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    loanAmount: '',
    purpose: ''
  });
  const [applicationData, setApplicationData] = useState<ApplicationData>({
    step: 0,
    formData: {
      personalInfo: {},
      businessInfo: {},
      loanInfo: {},
      bankInfo: {},
    }
  });

  // Check if we have enough information to consider the conversation complete
  const checkIfConversationComplete = (messages: Message[]) => {
    const conversation = messages.map(m => m.content).join(' ').toLowerCase();
    const userMessages = messages.filter(m => m.role === 'user').map(m => m.content).join(' ');
    
    // Check if we have collected sufficient information
    const hasName = /name.{0,20}(is|:|am|i'm).{0,50}[a-z]{2,}/i.test(conversation) || 
                   /my name.{0,20}[a-z]{2,}/i.test(conversation) ||
                   /i'm\s+[a-z]{2,}/i.test(conversation);
    
    const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(conversation);
    
    const hasPhone = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b|\(\d{3}\)\s*\d{3}[-.]?\d{4}/.test(conversation);
    
    const hasBusinessInfo = /business|company|store|shop|restaurant|construction|retail/i.test(conversation);
    
    const hasLoanInfo = /\$\d+|\d+k|\d+ thousand|\d+ million|loan|financing|capital/i.test(conversation);
    
    // If we have at least 3 pieces of key information, consider it complete
    const infoCount = [hasName, hasEmail, hasPhone, hasBusinessInfo, hasLoanInfo].filter(Boolean).length;
    
    return infoCount >= 3 && userMessages.length >= 3; // At least 3 exchanges and 3 pieces of info
  };

  // Auto-close function
  const autoCloseChat = () => {
    const thankYouMessage: Message = {
      id: (Date.now() + 999).toString(),
      role: 'assistant',
      content: `🎉 Thank you so much for providing that information! I have everything I need to connect you with one of our financing specialists. 

📞 **Next Steps:**
• Our team will review your information within 24 hours
• You'll receive a call or email with pre-qualified options
• We'll help you find the perfect financing solution

✨ **What to expect:**
• Competitive rates starting at 5%
• Fast approval process
• Dedicated support throughout

Have a wonderful day! This chat will close automatically in a few seconds. 🚀`,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, thankYouMessage]);
    setIsCompleted(true);

    // Auto-close after showing thank you message
    setTimeout(() => {
      setIsOpen(false);
      setIsCompleted(false);
      // Reset messages for next conversation
      setTimeout(() => {
        setMessages([{
          id: '1',
          role: 'assistant',
          content: '🚀 Hello! I\'m the HELLO BLUE LENDERS intelligent assistant. I use advanced learning to help businesses find perfect financing solutions with the power of blue. I can answer any questions about our products, rates, requirements, and get you pre-qualified instantly. What brings you here today?',
          timestamp: new Date()
        }]);
      }, 1000);
    }, 4000); // Close after 4 seconds
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  // Generate or retrieve a session ID for this conversation
  const [sessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      const existingId = localStorage.getItem('chatSessionId');
      if (existingId) return existingId;
      const newId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('chatSessionId', newId);
      return newId;
    }
    return Math.random().toString(36).substring(2, 15);
  });
  
  // Save conversation to Redis for lead capture
  const saveConversation = async (conversation: Message[]) => {
    try {
      if (conversation.length < 2) return; // Don't save very short conversations
      
      const messageData = conversation.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      await fetch('/api/chat/save-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId,
          messages: messageData
        })
      });
    } catch (error) {
      console.error('Error saving chat conversation:', error);
    }
  };

  // Check if current page is admin page to disable chatbot
  const [isAdminPage, setIsAdminPage] = useState(false);
  
  useEffect(() => {
    // Check if current path is admin path
    if (typeof window !== 'undefined') {
      const isAdmin = window.location.pathname.startsWith('/admin');
      setIsAdminPage(isAdmin);
      console.log('Is admin page:', isAdmin);
    }
  }, []);
  
  // Initial greeting message and auto-popup after 90 seconds
  useEffect(() => {
    // Don't run on admin pages
    if (isAdminPage) return;

    // Set initial greeting message
    if (messages.length === 0) {
      const greetings = [
        '🚀 Hello! I\'m the HELLO BLUE LENDERS intelligent assistant. I use advanced learning to help businesses find perfect financing solutions with the power of blue. I can answer any questions about our products, rates, requirements, and get you pre-qualified instantly. What brings you here today?',
        '💼 Hi there! Welcome to HELLO BLUE LENDERS. I\'m your smart financing specialist with access to comprehensive blue-class lending knowledge. I can help you explore options, check qualifications, and connect you with our team. What type of business do you operate?',
        '⚡ Welcome! I\'m the Blue Lenders AI assistant, trained on thousands of successful business financing cases. I can answer questions, help you qualify, and capture your info for our specialists. What\'s your biggest business challenge right now?',
        '🎯 Good day! I\'m here to help you discover smart financing solutions using our advanced learning system. From same-day decisions to long-term SBA loans, I know it all. What type of business growth are you planning?'
      ];
      
      const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
      
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: randomGreeting,
          timestamp: new Date()
        }
      ]);
    }
    
    // Auto-popup after 90 seconds (90000 ms) of user presence
    const autoPopupTimer = setTimeout(() => {
      if (!isOpen && !isAdminPage) {
        setIsOpen(true);
        // Play notification sound if available
        try {
          const notificationSound = new Audio('/notification.mp3');
          notificationSound.play().catch(error => {
            console.log('Notification sound failed to play:', error);
          });
        } catch (error) {
          console.log('Error with notification sound:', error);
        }
      }
    }, 90000);
    
    // Clear the timeout when component unmounts or if chat is manually opened
    return () => clearTimeout(autoPopupTimer);
  }, [messages.length, isOpen]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Save conversation any time messages update, to improve lead capture
  useEffect(() => {
    if (messages.length > 2) { // Only save once we have meaningful conversation
      saveConversation(messages);
    }
  }, [messages]);

  // FAQ questions and answers
  const faqData = {
    'loan types': 'We offer Equipment Financing, Working Capital Loans, SBA Loans, and Business Expansion Financing.',
    'interest rates': 'Our interest rates typically range from 5% to 15% depending on your business credit, loan type, and term length.',
    'application process': 'Our application process is simple: 1) Fill out the online application, 2) Submit required documents, 3) Receive a decision within 24-48 hours, 4) Get funded quickly after approval.',
    'required documents': 'You\'ll need: Business bank statements (last 3 months), Business tax returns (last year), Valid ID, and Proof of business ownership.',
    'loan terms': 'Our loan terms range from 3 months to 10 years depending on the financing type.',
    'minimum requirements': 'To qualify, you generally need: 6+ months in business, $10,000+ in monthly revenue, and a 550+ credit score.',
    'payment frequency': 'We offer flexible payment options including weekly, bi-weekly, or monthly payments.',
    'funding time': 'After approval, funding typically takes 1-3 business days.',
    'prepayment penalties': 'Most of our financing options have no prepayment penalties.',
    'industries': 'We serve most industries including retail, healthcare, construction, hospitality, professional services, and manufacturing.',
    'contact information': 'You can reach our customer support at papykabukanyi@gmail.com or call us at (123) 456-7890 during business hours.',
  };

  // Check if the user's message is a FAQ
  const findFaqMatch = (userInput: string): string | null => {
    const normalizedInput = userInput.toLowerCase();
    
    for (const [keyword, answer] of Object.entries(faqData)) {
      if (normalizedInput.includes(keyword)) {
        return answer;
      }
    }
    
    return null;
  };

  // Process incoming message with Gemini AI
  const processMessage = async (userMessage: string) => {
    // Add user message to chat
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);

    // Check if conversation is complete after adding the new message
    if (checkIfConversationComplete(updatedMessages)) {
      setIsTyping(false);
      autoCloseChat();
      return;
    }

    // Check if it's a FAQ first
    const faqAnswer = findFaqMatch(userMessage.toLowerCase());
    
    if (faqAnswer) {
      // If it's a FAQ, respond with the pre-defined answer
      setTimeout(() => {
        const botReply: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: faqAnswer,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botReply]);
        setIsTyping(false);
      }, 1000);
      return;
    }

    // If user is starting or working on an application
    if (applicationData.step > 0 || 
        userMessage.toLowerCase().includes('apply') || 
        userMessage.toLowerCase().includes('application') || 
        userMessage.toLowerCase().includes('start') ||
        userMessage.toLowerCase().includes('loan')) {
      
      await handleApplicationFlow(userMessage);
      return;
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage,
          sessionId: sessionId,
          history: messages.slice(-10) // Include last 10 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const botReply: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botReply]);
      
      // Show lead generation success message if applicable
      if (data.leadGenerated && data.readyForApplication) {
        setTimeout(() => {
          const applicationRedirectMessage: Message = {
            id: (Date.now() + 2).toString(),
            role: 'assistant',
            content: "🎉 Perfect! Based on our conversation, you're an excellent candidate for our financing programs. I have everything I need to get you started.\n\n**Would you like to proceed with the full application now?** I can redirect you to our secure application form where you can complete the process and get approved within 24-48 hours.\n\n[**START APPLICATION →**](/application)",
            timestamp: new Date()
          };
          setMessages(prev => [...prev, applicationRedirectMessage]);
          
          // Auto-redirect after 5 seconds if no response
          setTimeout(() => {
            if (confirm("You seem qualified for our financing! Would you like to start your application now?")) {
              window.location.href = '/application';
            }
          }, 5000);
        }, 2000);
      } else if (data.leadGenerated && data.conversationQuality > 6) {
        setTimeout(() => {
          const leadSuccessMessage: Message = {
            id: (Date.now() + 2).toString(),
            role: 'assistant',
            content: "🎉 Excellent! I've captured your information and you appear to be a strong candidate for our financing programs. Our specialist team will reach out within 24 hours with personalized rates and terms. \n\nIn the meantime, I can answer any questions about our products, process, or requirements. What else would you like to know?",
            timestamp: new Date()
          };
          setMessages(prev => [...prev, leadSuccessMessage]);
        }, 2000);
      } else if (data.leadGenerated && data.conversationQuality > 4) {
        setTimeout(() => {
          const leadSuccessMessage: Message = {
            id: (Date.now() + 2).toString(),
            role: 'assistant',
            content: "Great! I've saved your information. To get you the best financing options, could you share a bit more about your business? What industry are you in and what's your approximate monthly revenue?",
            timestamp: new Date()
          };
          setMessages(prev => [...prev, leadSuccessMessage]);
        }, 1500);
      }
      
    } catch (error) {
      console.error('Error processing message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered a technical issue. Let me try to help you anyway! What type of business financing are you interested in learning about?',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle application flow
  const handleApplicationFlow = async (userMessage: string) => {
    const steps = [
      {
        name: 'intro',
        message: 'Great! I can help you start a financing application. This will take about 5 minutes. Would you like to continue?',
        nextTriggers: ['yes', 'yeah', 'sure', 'continue', 'start', 'begin']
      },
      {
        name: 'personalInfo',
        message: 'Let\'s start with your personal information. What\'s your full name?',
        field: { name: 'fullName', type: 'text', required: true },
        nextField: { name: 'email', message: 'What\'s your email address?' },
      },
      {
        name: 'email',
        message: 'What\'s your email address?',
        field: { name: 'email', type: 'email', required: true },
        nextField: { name: 'phone', message: 'What\'s your phone number?' },
      },
      {
        name: 'phone',
        message: 'What\'s your phone number?',
        field: { name: 'phone', type: 'tel', required: true },
        nextField: { name: 'businessName', message: 'What\'s your business name?' },
      },
      {
        name: 'businessInfo',
        message: 'What\'s your business name?',
        field: { name: 'businessName', type: 'text', required: true },
        nextField: { name: 'businessType', message: 'What type of business do you have? (LLC, Corporation, Sole Proprietorship, etc.)' },
      },
      {
        name: 'businessType',
        message: 'What type of business do you have? (LLC, Corporation, Sole Proprietorship, etc.)',
        field: { name: 'businessType', type: 'text', required: true },
        nextField: { name: 'timeInBusiness', message: 'How long have you been in business? (years/months)' },
      },
      {
        name: 'timeInBusiness',
        message: 'How long have you been in business? (years/months)',
        field: { name: 'timeInBusiness', type: 'text', required: true },
        nextField: { name: 'loanAmount', message: 'How much financing are you looking for?' },
      },
      {
        name: 'loanInfo',
        message: 'How much financing are you looking for?',
        field: { name: 'loanAmount', type: 'number', required: true },
        nextField: { name: 'loanPurpose', message: 'What\'s the purpose of this financing?' },
      },
      {
        name: 'loanPurpose',
        message: 'What\'s the purpose of this financing?',
        field: { name: 'loanPurpose', type: 'text', required: true },
        nextField: { name: 'complete', message: 'Thank you for providing this information! Would you like to submit this pre-application now?' },
      },
      {
        name: 'complete',
        message: 'Thank you for providing this information! Would you like to submit this pre-application now?',
        nextTriggers: ['yes', 'yeah', 'sure', 'submit', 'complete']
      },
    ];

    const currentStep = applicationData.step;
    
    // Starting the application
    if (currentStep === 0) {
      if (userMessage.toLowerCase().includes('apply') || 
          userMessage.toLowerCase().includes('application') || 
          userMessage.toLowerCase().includes('start') ||
          userMessage.toLowerCase().includes('loan')) {
        
        setApplicationData(prev => ({ ...prev, step: 1 }));
        
        const botReply: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: steps[0].message,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botReply]);
        setIsTyping(false);
        return;
      }
    }
    // Continuing with "yes"
    else if (currentStep === 1) {
      const userResponse = userMessage.toLowerCase();
      if (steps[0].nextTriggers.some(trigger => userResponse.includes(trigger))) {
        setApplicationData(prev => ({ ...prev, step: 2 }));
        
        const botReply: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: steps[1].message,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botReply]);
        setIsTyping(false);
        return;
      } else {
        const botReply: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'No problem. Feel free to ask me about our financing options or anything else when you\'re ready.',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botReply]);
        setIsTyping(false);
        setApplicationData(prev => ({ ...prev, step: 0 }));
        return;
      }
    }
    // Collecting name
    else if (currentStep === 2) {
      // Store name and ask for email
      const nameParts = userMessage.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
      
      setApplicationData(prev => ({
        ...prev,
        step: 3,
        formData: {
          ...prev.formData,
          personalInfo: {
            ...prev.formData.personalInfo,
            firstName,
            lastName,
          }
        }
      }));
      
      const botReply: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: steps[2].message,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botReply]);
      setIsTyping(false);
      return;
    }
    // Collecting email
    else if (currentStep === 3) {
      const email = userMessage.trim();
      
      setApplicationData(prev => ({
        ...prev,
        step: 4,
        formData: {
          ...prev.formData,
          personalInfo: {
            ...prev.formData.personalInfo,
            email,
          }
        }
      }));
      
      const botReply: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: steps[3].message,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botReply]);
      setIsTyping(false);
      return;
    }
    // Collecting phone
    else if (currentStep === 4) {
      const phone = userMessage.trim();
      
      setApplicationData(prev => ({
        ...prev,
        step: 5,
        formData: {
          ...prev.formData,
          personalInfo: {
            ...prev.formData.personalInfo,
            phone,
          }
        }
      }));
      
      const botReply: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: steps[4].message,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botReply]);
      setIsTyping(false);
      return;
    }
    // Collecting business name
    else if (currentStep === 5) {
      const businessName = userMessage.trim();
      
      setApplicationData(prev => ({
        ...prev,
        step: 6,
        formData: {
          ...prev.formData,
          businessInfo: {
            ...prev.formData.businessInfo,
            businessName,
          }
        }
      }));
      
      const botReply: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: steps[5].message,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botReply]);
      setIsTyping(false);
      return;
    }
    // Collecting business type
    else if (currentStep === 6) {
      const businessType = userMessage.trim();
      
      setApplicationData(prev => ({
        ...prev,
        step: 7,
        formData: {
          ...prev.formData,
          businessInfo: {
            ...prev.formData.businessInfo,
            businessType,
          }
        }
      }));
      
      const botReply: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: steps[6].message,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botReply]);
      setIsTyping(false);
      return;
    }
    // Collecting time in business
    else if (currentStep === 7) {
      const timeInBusiness = userMessage.trim();
      
      setApplicationData(prev => ({
        ...prev,
        step: 8,
        formData: {
          ...prev.formData,
          businessInfo: {
            ...prev.formData.businessInfo,
            timeInBusiness,
          }
        }
      }));
      
      const botReply: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: steps[7].message,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botReply]);
      setIsTyping(false);
      return;
    }
    // Collecting loan amount
    else if (currentStep === 8) {
      const loanAmount = userMessage.trim().replace(/[$,]/g, '');
      
      setApplicationData(prev => ({
        ...prev,
        step: 9,
        formData: {
          ...prev.formData,
          loanInfo: {
            ...prev.formData.loanInfo,
            loanAmount: parseFloat(loanAmount),
          }
        }
      }));
      
      const botReply: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: steps[8].message,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botReply]);
      setIsTyping(false);
      return;
    }
    // Collecting loan purpose
    else if (currentStep === 9) {
      const loanPurpose = userMessage.trim();
      
      setApplicationData(prev => ({
        ...prev,
        step: 10,
        formData: {
          ...prev.formData,
          loanInfo: {
            ...prev.formData.loanInfo,
            loanPurpose,
            loanType: 'Working Capital', // Default
          }
        }
      }));
      
      const botReply: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: steps[9].message,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botReply]);
      setIsTyping(false);
      return;
    }
    // Submitting application
    else if (currentStep === 10) {
      const userResponse = userMessage.toLowerCase();
      
      if (steps[9].nextTriggers.some(trigger => userResponse.includes(trigger))) {
        // Submit pre-application
        try {
          const botReply: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: 'Submitting your application...',
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, botReply]);
          
          // Submit pre-application to the server
          const response = await fetch('/api/pre-application', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(applicationData.formData),
          });

          if (!response.ok) {
            throw new Error('Failed to submit application');
          }

          const data = await response.json();
          
          const successReply: Message = {
            id: (Date.now() + 2).toString(),
            role: 'assistant',
            content: `Thank you! Your pre-application has been submitted successfully. A member of our team will contact you shortly at ${applicationData.formData.personalInfo.email} or ${applicationData.formData.personalInfo.phone}. Would you like to proceed to the full application now?`,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, successReply]);
          
          // Reset application data but keep personal info for full application if needed
          setApplicationData({
            step: 0,
            formData: {
              personalInfo: applicationData.formData.personalInfo,
              businessInfo: {},
              loanInfo: {},
              bankInfo: {},
            }
          });
        } catch (error) {
          console.error('Error submitting pre-application:', error);
          
          const errorMessage: Message = {
            id: (Date.now() + 2).toString(),
            role: 'assistant',
            content: 'Sorry, there was an error submitting your application. Please try again later or contact our support team.',
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, errorMessage]);
          setApplicationData(prev => ({ ...prev, step: 0 }));
        } finally {
          setIsTyping(false);
        }
      } else {
        const botReply: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'No problem. I\'ve saved your information. You can continue the application whenever you\'re ready. Is there anything else I can help you with?',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botReply]);
        setIsTyping(false);
        setApplicationData(prev => ({ ...prev, step: 0 }));
      }
      return;
    }

    // If we get here, use Gemini AI for a response
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const botReply: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botReply]);
    } catch (error) {
      console.error('Error processing message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again later.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isTyping) {
      processMessage(input.trim());
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  
  // Don't render anything if on admin page
  if (isAdminPage) {
    return null;
  }

  return (
    <>
      {/* Chat button fixed at bottom right - Modern design */}
      <button 
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 ${
          isOpen ? 'bg-gradient-to-r from-red-500 to-red-600 text-white rotate-45' : 'bg-gradient-to-r from-primary to-primary-dark text-white'
        }`}
        onClick={() => setIsOpen(prev => !prev)}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
        {/* Notification pulse */}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse">
            <div className="absolute inset-0 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
          </div>
        )}
      </button>

      {/* Chat window - Modern design */}
      <div 
        className={`fixed bottom-24 right-6 z-40 w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 transform border border-gray-100 ${
          isOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95 pointer-events-none'
        }`}
        style={{ height: "550px" }}
      >
        {/* Chat header - Modern gradient */}
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-lg">Blue Lenders Assistant</h2>
              <p className="text-xs text-white text-opacity-80">Your Smart Financing Guide</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {/* Chat messages - Modern styling */}
        <div className="p-4 h-96 overflow-y-auto bg-gray-50 bg-opacity-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 ${message.role === 'user' ? 'text-right' : ''}`}
            >
              <div 
                className={`inline-block rounded-2xl px-4 py-3 max-w-xs sm:max-w-md shadow-sm
                  ${message.role === 'user' 
                    ? 'bg-gradient-to-r from-primary to-primary-dark text-white rounded-br-md' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-md'
                  }
                `}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              </div>
              <p className="text-xs text-gray-400 mt-1 px-2">{formatTime(message.timestamp)}</p>
            </div>
          ))}
          
          {isTyping && (
            <div className="mb-4">
              <div className="inline-block rounded-2xl rounded-bl-md px-4 py-3 bg-white border border-gray-100 shadow-sm">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Chat input - Modern styling */}
        <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              className="flex-grow px-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 transition-all"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping || isCompleted}
            />
            <button
              type="submit"
              className="w-12 h-12 bg-gradient-to-r from-primary to-primary-dark text-white rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={!input.trim() || isTyping || isCompleted}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ChatBot;
