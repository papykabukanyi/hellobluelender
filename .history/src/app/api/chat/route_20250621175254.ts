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
    }

    // Get the Gemini model (text-only model)
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Prepare chat history for context
    const formattedHistory = history.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));
    
    // Start a chat session
    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 800,
      },
      systemInstruction: SYSTEM_INSTRUCTIONS,
    });

    // Generate response
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    // Return the response
    return NextResponse.json({ 
      reply: text,
      status: 'success'
    });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process message', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
