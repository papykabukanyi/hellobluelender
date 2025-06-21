'use client';

import * as tf from '@tensorflow/tfjs';
import { createWorker } from 'tesseract.js';

// Document types the system can recognize
export enum DocumentType {
  BUSINESS_LICENSE = 'Business License',
  ID_DOCUMENT = 'ID Document',
  TAX_RETURN = 'Tax Return',
  BANK_STATEMENT = 'Bank Statement',
  UTILITY_BILL = 'Utility Bill',
  FINANCIAL_STATEMENT = 'Financial Statement',
  UNKNOWN = 'Unknown',
}

// Extracted data structure
export interface ExtractedDocumentData {
  documentType: DocumentType;
  confidence: number;
  data: Record<string, string>;
  text: string;
  dates?: string[];
  numbers?: string[];
  entities?: Record<string, string>;
}

// Main document scanner class
export class DocumentScanner {
  private worker: any = null;
  private model: tf.LayersModel | null = null;
  private isInitialized = false;

  constructor() {
    this.initializeOCR();
  }

  // Initialize Tesseract OCR worker
  private async initializeOCR() {
    try {
      console.log('Initializing Tesseract worker...');
      this.worker = await createWorker('eng');
      this.isInitialized = true;
      console.log('Tesseract worker initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Tesseract worker:', error);
    }
  }

  // Extract text from an uploaded document
  public async extractText(file: File): Promise<string> {
    if (!this.isInitialized || !this.worker) {
      await this.initializeOCR();
    }

    try {
      // Convert file to base64 for Tesseract
      const base64 = await this.fileToBase64(file);
      
      // Process with Tesseract
      const result = await this.worker.recognize(base64);
      return result.data.text;
    } catch (error) {
      console.error('Error extracting text from document:', error);
      throw new Error('Failed to extract text from document');
    }
  }

  // Classify document type based on extracted text
  public classifyDocumentType(text: string): { type: DocumentType; confidence: number } {
    // Simple rule-based classification - would be replaced with ML model in production
    const textLower = text.toLowerCase();
    
    // Check for business license indicators
    if (
      textLower.includes('business license') ||
      textLower.includes('certificate of formation') ||
      textLower.includes('registration certificate') ||
      textLower.includes('license to operate')
    ) {
      return { type: DocumentType.BUSINESS_LICENSE, confidence: 0.85 };
    }
    
    // Check for ID document indicators
    if (
      textLower.includes('driver') ||
      textLower.includes('license') ||
      textLower.includes('identification') ||
      textLower.includes('passport') ||
      textLower.includes('birth date') ||
      textLower.includes('date of birth')
    ) {
      return { type: DocumentType.ID_DOCUMENT, confidence: 0.9 };
    }
    
    // Check for tax return indicators
    if (
      textLower.includes('form 1040') ||
      textLower.includes('form 1120') ||
      textLower.includes('schedule c') ||
      textLower.includes('tax return') ||
      textLower.includes('tax year')
    ) {
      return { type: DocumentType.TAX_RETURN, confidence: 0.85 };
    }
    
    // Check for bank statement indicators
    if (
      textLower.includes('account statement') ||
      textLower.includes('bank statement') ||
      textLower.includes('balance') ||
      textLower.includes('transaction history') ||
      textLower.includes('beginning balance') ||
      textLower.includes('ending balance')
    ) {
      return { type: DocumentType.BANK_STATEMENT, confidence: 0.8 };
    }
    
    // Check for utility bill indicators
    if (
      textLower.includes('utility') ||
      textLower.includes('electric') ||
      textLower.includes('water') ||
      textLower.includes('gas') ||
      textLower.includes('bill amount') ||
      textLower.includes('service address')
    ) {
      return { type: DocumentType.UTILITY_BILL, confidence: 0.75 };
    }
    
    // Check for financial statement indicators
    if (
      textLower.includes('income statement') ||
      textLower.includes('balance sheet') ||
      textLower.includes('cash flow') ||
      textLower.includes('financial statement') ||
      textLower.includes('profit and loss') ||
      textLower.includes('assets') ||
      textLower.includes('liabilities')
    ) {
      return { type: DocumentType.FINANCIAL_STATEMENT, confidence: 0.85 };
    }
    
    return { type: DocumentType.UNKNOWN, confidence: 0.5 };
  }

  // Extract relevant data based on document type
  public extractRelevantData(text: string, documentType: DocumentType): Record<string, string> {
    const data: Record<string, string> = {};
    
    // Extract dates from the text
    const dates = this.extractDates(text);
    if (dates.length > 0) {
      data['dates'] = dates.join(', ');
    }
    
    // Extract monetary amounts
    const amounts = this.extractMonetaryAmounts(text);
    if (amounts.length > 0) {
      data['monetaryAmounts'] = amounts.join(', ');
    }
    
    switch (documentType) {
      case DocumentType.BUSINESS_LICENSE:
        data['businessName'] = this.extractBusinessName(text);
        data['expirationDate'] = this.extractExpirationDate(text);
        data['licenseNumber'] = this.extractLicenseNumber(text);
        break;
        
      case DocumentType.ID_DOCUMENT:
        data['fullName'] = this.extractFullName(text);
        data['dateOfBirth'] = this.extractDateOfBirth(text);
        data['documentNumber'] = this.extractIDNumber(text);
        data['expirationDate'] = this.extractExpirationDate(text);
        break;
        
      case DocumentType.BANK_STATEMENT:
        data['accountNumber'] = this.extractAccountNumber(text);
        data['bankName'] = this.extractBankName(text);
        data['statementPeriod'] = this.extractStatementPeriod(text);
        data['endingBalance'] = this.extractEndingBalance(text);
        break;
      
      // Add more document types as needed
      default:
        // Extract any name-like or number-like entities 
        const entities = this.extractEntities(text);
        Object.assign(data, entities);
    }
    
    return data;
  }
  
  // Helper method to convert File to base64
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  
  // Extract dates using regex
  private extractDates(text: string): string[] {
    const dateRegex = /\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\b/g;
    return text.match(dateRegex) || [];
  }
  
  // Extract monetary amounts using regex
  private extractMonetaryAmounts(text: string): string[] {
    const moneyRegex = /\$\s?\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d{1,3}(?:,\d{3})*(?:\.\d{2})?\s?(?:dollars|USD)/g;
    return text.match(moneyRegex) || [];
  }
  
  // Extract business name - simplified version
  private extractBusinessName(text: string): string {
    // Look for patterns like "Business Name: XYZ" or "Name of Business: XYZ"
    const nameMatches = text.match(/(?:business\s+name|company\s+name|name\s+of\s+business)(?:\s*):?\s*([A-Za-z0-9\s&.,\'\"()-]{2,50})/i);
    if (nameMatches && nameMatches[1]) {
      return nameMatches[1].trim();
    }
    return '';
  }
  
  // Extract license number
  private extractLicenseNumber(text: string): string {
    // Look for patterns like "License #: 12345" or "License Number: 12345"
    const licenseMatches = text.match(/(?:license|registration|permit)(?:\s+\#|\s+no\.?|\s+number)?(?:\s*):?\s*([A-Za-z0-9\-]{5,20})/i);
    if (licenseMatches && licenseMatches[1]) {
      return licenseMatches[1].trim();
    }
    return '';
  }
  
  // Extract expiration date
  private extractExpirationDate(text: string): string {
    // Look for patterns like "Expires: MM/DD/YYYY" or "Expiration Date: MM/DD/YYYY"
    const expirationMatches = text.match(/(?:expir(?:es|ation)|valid\s+until|valid\s+through)(?:\s*):?\s*([A-Za-z0-9\/\-\.\s,]{5,20})/i);
    if (expirationMatches && expirationMatches[1]) {
      return expirationMatches[1].trim();
    }
    return '';
  }
  
  // Extract full name
  private extractFullName(text: string): string {
    // Look for name patterns
    const nameMatches = text.match(/(?:name|full\s+name)(?:\s*):?\s*([A-Za-z\s\'\-\.]{5,50})/i);
    if (nameMatches && nameMatches[1]) {
      return nameMatches[1].trim();
    }
    return '';
  }
  
  // Extract date of birth
  private extractDateOfBirth(text: string): string {
    // Look for DOB patterns
    const dobMatches = text.match(/(?:birth|dob|born|date\s+of\s+birth)(?:\s*):?\s*([A-Za-z0-9\/\-\.\s,]{5,20})/i);
    if (dobMatches && dobMatches[1]) {
      return dobMatches[1].trim();
    }
    return '';
  }
  
  // Extract ID number
  private extractIDNumber(text: string): string {
    // Look for ID number patterns
    const idMatches = text.match(/(?:id|identification|driver|license|passport|document)(?:\s+\#|\s+no\.?|\s+number)?(?:\s*):?\s*([A-Za-z0-9\-]{5,20})/i);
    if (idMatches && idMatches[1]) {
      return idMatches[1].trim();
    }
    return '';
  }
  
  // Extract account number
  private extractAccountNumber(text: string): string {
    // Look for account number patterns
    const accountMatches = text.match(/(?:account|acct)(?:\s+\#|\s+no\.?|\s+number)?(?:\s*):?\s*([A-Za-z0-9\-\*]{4,20})/i);
    if (accountMatches && accountMatches[1]) {
      return accountMatches[1].trim();
    }
    return '';
  }
  
  // Extract bank name
  private extractBankName(text: string): string {
    // Common bank names to look for
    const commonBanks = [
      'Chase', 'Bank of America', 'Wells Fargo', 'Citibank', 'Capital One',
      'TD Bank', 'PNC Bank', 'US Bank', 'Bank', 'Credit Union'
    ];
    
    for (const bank of commonBanks) {
      const bankRegex = new RegExp(`(?:\\b${bank}\\b)(?:[\\s\\S]{0,50}(?:bank|financial|statement))?`, 'i');
      if (bankRegex.test(text)) {
        const match = text.match(bankRegex);
        return match ? match[0].trim() : '';
      }
    }
    
    return '';
  }
  
  // Extract statement period
  private extractStatementPeriod(text: string): string {
    // Look for statement period patterns
    const periodMatches = text.match(/(?:statement|period)(?:\s+for|\s+from|\s+date)?(?:\s*):?\s*([A-Za-z0-9\/\-\.\s,]{5,50})/i);
    if (periodMatches && periodMatches[1]) {
      return periodMatches[1].trim();
    }
    return '';
  }
  
  // Extract ending balance
  private extractEndingBalance(text: string): string {
    // Look for ending balance patterns
    const balanceMatches = text.match(/(?:ending|closing|final)(?:\s+balance)(?:\s*):?\s*(\$?\s?\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i);
    if (balanceMatches && balanceMatches[1]) {
      return balanceMatches[1].trim();
    }
    return '';
  }
  
  // Extract entities (generic method)
  private extractEntities(text: string): Record<string, string> {
    const entities: Record<string, string> = {};
    
    // Extract email addresses
    const emailMatches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
    if (emailMatches) {
      entities['email'] = emailMatches[0];
    }
    
    // Extract phone numbers
    const phoneMatches = text.match(/(?:\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/g);
    if (phoneMatches) {
      entities['phone'] = phoneMatches[0];
    }
    
    // Extract addresses (simplified)
    const addressMatches = text.match(/\d{1,5}\s[A-Za-z\s]{1,50}(?:street|st|avenue|ave|road|rd|highway|hwy|square|sq|trail|trl|drive|dr|court|ct|parkway|pkwy|circle|cir|boulevard|blvd)\s[A-Za-z\s]{1,30}\s[A-Z]{2}\s\d{5}/i);
    if (addressMatches) {
      entities['address'] = addressMatches[0];
    }
    
    return entities;
  }
    // Process document completely
  public async processDocument(file: File): Promise<ExtractedDocumentData> {
    try {
      // Timeout promise to ensure the process doesn't hang
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Document processing timed out')), 15000)
      );
      
      // Processing promise
      const processingPromise = this._processDocumentInternal(file);
      
      // Race between processing and timeout
      return await Promise.race([processingPromise, timeoutPromise]);
    } catch (error) {
      console.error('Error processing document:', error);
      
      // Return simplified document data as fallback instead of throwing an error
      return {
        documentType: DocumentType.UNKNOWN,
        confidence: 0,
        data: {},
        text: `Unable to extract text from this document: ${file.name}`,
        dates: [],
        numbers: [],
        entities: {},
      };
    }
  }
  
  // Internal processing method
  private async _processDocumentInternal(file: File): Promise<ExtractedDocumentData> {
    // 1. Extract text from document
    const text = await this.extractText(file);
    
    // 2. Classify document type
    const { type, confidence } = this.classifyDocumentType(text);
    
    // 3. Extract relevant data based on document type
    const data = this.extractRelevantData(text, type);
    
    // 4. Extract dates and numbers for all document types
    const dates = this.extractDates(text);
    const numbers = this.extractMonetaryAmounts(text);
    
    return {
      documentType: type,
      confidence,
      data,
      text,
      dates,
      numbers,
      entities: this.extractEntities(text),
    };
  }
}

export default DocumentScanner;
