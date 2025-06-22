import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI SDK with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyA1SSntDhuucrYrT7Xaj4ZSC4IKrFM6C-8');

// Knowledge base for the AI to use
const FINANCING_KNOWLEDGE = {
  products: [
    "Equipment Financing", 
    "Working Capital Loans", 
    "SBA Loans", 
    "Business Expansion Financing"
  ],
  interestRates: "5% to 15% depending on business credit, loan type, and term length",
  loanTerms: "3 months to 10 years depending on financing type",
  qualifications: "6+ months in business, $10,000+ in monthly revenue, and 550+ credit score",
  contact: {
    email: "papykabukanyi@gmail.com",
    phone: "(123) 456-7890"
  }
};

export async function POST(request: NextRequest) {
  try {
    const { message, history = [] } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }    // Get the Gemini model (text-only model)
    // The model name might have changed in newer versions of the API
    const model = genAI.getGenerativeModel({ model: 'gemini-1.0-pro' });

    // Prepare chat history for context
    const formattedHistory = history.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));
      // Prepare prompt with role-based instructions
    const prompt = `You are a helpful, friendly assistant for Hempire Enterprise, a business financing company.
Your name is Hempire Assistant. Keep responses brief and professional, focusing on business financing topics.

Here's information about our products and services:
- Products: ${FINANCING_KNOWLEDGE.products.join(', ')}
- Interest rates: ${FINANCING_KNOWLEDGE.interestRates}
- Loan terms: ${FINANCING_KNOWLEDGE.loanTerms}
- Qualification requirements: ${FINANCING_KNOWLEDGE.qualifications}
- Contact: Email ${FINANCING_KNOWLEDGE.contact.email}, Phone ${FINANCING_KNOWLEDGE.contact.phone}

Based on this conversation history and the user's latest message, provide a helpful response:
${message}`;    // Use a try-catch block to handle API errors
    try {
      // Get the text-only generative model
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      return NextResponse.json({ message: text });
    } catch (error) {
      console.error('Error in chat endpoint:', error);
      return NextResponse.json({ message: "I'm sorry, I'm having trouble processing your request right now. Please try again later or contact customer support for immediate assistance." }, { status: 500 });
    }  } catch (outerError) {
    console.error('Outer error in chat endpoint:', outerError);
    
    return NextResponse.json(
      { 
        error: 'Failed to process message', 
        details: outerError instanceof Error ? outerError.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
