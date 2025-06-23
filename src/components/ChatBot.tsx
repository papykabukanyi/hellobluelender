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
  const [applicationData, setApplicationData] = useState<ApplicationData>({
    step: 0,
    formData: {
      personalInfo: {},
      businessInfo: {},
      loanInfo: {},
      bankInfo: {},
    }
  });  const messagesEndRef = useRef<HTMLDivElement>(null);
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
  // Initial greeting message and auto-popup after 90 seconds
  useEffect(() => {
    // Set initial greeting message
    if (messages.length === 0) {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: 'Hello! I\'m the EMPIRE ENTREPRISE assistant. I can help you with questions about our financing options or assist you in starting a new application. To better assist you, could you please share your name and email address?',
          timestamp: new Date()
        }
      ]);
    }
    
    // Auto-popup after 90 seconds (90000 ms) of user presence
    const autoPopupTimer = setTimeout(() => {
      if (!isOpen) {
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
    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setIsTyping(true);

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

  return (
    <>
      {/* Chat button fixed at bottom right */}
      <button 
        className={`fixed bottom-5 right-5 z-50 rounded-full p-4 shadow-lg transition-all duration-300 ${isOpen ? 'bg-red-500 text-white rotate-45' : 'bg-green-600 text-white'}`}
        onClick={() => setIsOpen(prev => !prev)}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Chat window */}
      <div 
        className={`fixed bottom-20 right-5 z-40 w-full max-w-sm bg-white rounded-lg shadow-xl overflow-hidden transition-all duration-300 transform ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}
        style={{ height: "500px" }}
      >
        {/* Chat header */}
        <div className="bg-green-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <h2 className="font-semibold">Hempire Assistant</h2>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-white focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {/* Chat messages */}
        <div className="p-4 h-96 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-3 ${message.role === 'user' ? 'text-right' : ''}`}
            >
              <div 
                className={`inline-block rounded-lg px-4 py-2 max-w-xs sm:max-w-md
                  ${message.role === 'user' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'}
                `}
              >
                <p className="text-sm">{message.content}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">{formatTime(message.timestamp)}</p>
            </div>
          ))}
          
          {isTyping && (
            <div className="mb-3">
              <div className="inline-block rounded-lg px-4 py-2 bg-gray-200 text-gray-800">
                <div className="flex items-center">
                  <div className="dot-typing"></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Chat input */}
        <form onSubmit={handleSend} className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <input
              type="text"
              className="flex-grow px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-r-lg hover:bg-green-700 transition disabled:opacity-50"
              disabled={!input.trim() || isTyping}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      {/* CSS for typing animation */}
      <style jsx>{`
        .dot-typing {
          position: relative;
          left: -9999px;
          width: 6px;
          height: 6px;
          border-radius: 3px;
          background-color: #666;
          color: #666;
          box-shadow: 9984px 0 0 0 #666, 9999px 0 0 0 #666, 10014px 0 0 0 #666;
          animation: dotTyping 1s infinite linear;
        }

        @keyframes dotTyping {
          0% {
            box-shadow: 9984px 0 0 0 #666, 9999px 0 0 0 #666, 10014px 0 0 0 #666;
          }
          16.667% {
            box-shadow: 9984px -5px 0 0 #666, 9999px 0 0 0 #666, 10014px 0 0 0 #666;
          }
          33.333% {
            box-shadow: 9984px 0 0 0 #666, 9999px 0 0 0 #666, 10014px 0 0 0 #666;
          }
          50% {
            box-shadow: 9984px 0 0 0 #666, 9999px -5px 0 0 #666, 10014px 0 0 0 #666;
          }
          66.667% {
            box-shadow: 9984px 0 0 0 #666, 9999px 0 0 0 #666, 10014px 0 0 0 #666;
          }
          83.333% {
            box-shadow: 9984px 0 0 0 #666, 9999px 0 0 0 #666, 10014px -5px 0 0 #666;
          }
          100% {
            box-shadow: 9984px 0 0 0 #666, 9999px 0 0 0 #666, 10014px 0 0 0 #666;
          }
        }
      `}</style>
    </>
  );
};

export default ChatBot;
