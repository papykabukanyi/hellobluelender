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
  private compressionQuality = 0.7; // Default compression quality

  constructor(compressionQuality = 0.7) {
    this.initializeOCR();
    this.compressionQuality = compressionQuality;
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

  // Compress image file before processing
  private async compressImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        // If not an image, return the original file
        return resolve(file);
      }
      
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          
          // Calculate new dimensions - maintain aspect ratio but limit max dimensions
          const MAX_WIDTH = 1800;
          const MAX_HEIGHT = 1800;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round(height * (MAX_WIDTH / width));
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round(width * (MAX_HEIGHT / height));
              height = MAX_HEIGHT;
            }
          }
          
          // Set canvas dimensions and draw the resized image
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            return reject(new Error('Unable to get canvas context'));
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert canvas to blob with compression
          canvas.toBlob((blob) => {
            if (!blob) return reject(new Error('Failed to compress image'));
            
            // Create new File object with compressed data
            const compressedFile = new File(
              [blob],
              file.name,
              { type: file.type, lastModified: new Date().getTime() }
            );
            
            console.log(`Compressed ${file.name} from ${file.size} to ${compressedFile.size} bytes (${Math.round(compressedFile.size / file.size * 100)}%)`);
            
            resolve(compressedFile);
          }, file.type, this.compressionQuality);
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image for compression'));
        };
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file for compression'));
      };
    });
  }

  // Compress PDF file if possible (basic version)
  private async compressPDF(file: File): Promise<File> {
    // For now, we'll just return the original file
    // PDF compression requires PDF.js or similar libraries
    // This would be implemented in a production version
    console.log('PDF compression not implemented in this version');
    return file;
  }

  // Main file compression method
  public async compressFile(file: File): Promise<File> {
    // Check file type and apply appropriate compression
    if (file.type.startsWith('image/')) {
      return this.compressImage(file);
    } else if (file.type === 'application/pdf') {
      return this.compressPDF(file);
    }
    // For other file types, return as is
    return file;
  }

  // Extract text from an uploaded document  public async extractText(file: File): Promise<string> {
    if (!this.isInitialized || !this.worker) {
      await this.initializeOCR();
    }

    try {
      // Safety check for empty files or null file
      if (!file || file.size === 0) {
        console.warn('Empty or null file received in extractText');
        return '';
      }

      // Check file type to avoid unsupported formats
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        console.warn(`Unsupported file type: ${file.type}`);
        return `File content (${file.name})`;
      }
      
      // Compress file before processing
      const compressedFile = await this.compressFile(file);
      
      // Convert file to base64 for Tesseract
      const base64 = await this.fileToBase64(compressedFile);
      
      // Process with Tesseract
      const result = await this.worker.recognize(base64);
      
      // Validate result has expected structure
      if (!result || !result.data || typeof result.data.text !== 'string') {
        console.warn('Invalid OCR result structure');
        return '';
      }
      
      return result.data.text;
    } catch (error) {
      console.error('Error extracting text from document:', error);
      // Return empty string instead of throwing to allow for graceful fallback
      return '';
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
      
      // If we found multiple emails, store them
      if (emailMatches.length > 1) {
        entities['additional_emails'] = emailMatches.slice(1).join(', ');
      }
    }
    
    // Extract phone numbers - improved pattern
    const phoneMatches = text.match(/(?:\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-.]?\d{3}[\s-.]?\d{4}/g);
    if (phoneMatches) {
      entities['phone'] = phoneMatches[0];
      
      // If we found multiple phones, store them
      if (phoneMatches.length > 1) {
        entities['additional_phones'] = phoneMatches.slice(1).join(', ');
      }
    }
    
    // Extract addresses (improved pattern)
    const addressMatches = text.match(/\d{1,5}\s[A-Za-z\s]{1,50}(?:street|st|avenue|ave|road|rd|highway|hwy|square|sq|trail|trl|drive|dr|court|ct|parkway|pkwy|circle|cir|boulevard|blvd|ln|lane|way|pl|place)(?:\s[A-Za-z\s]{1,30})?(?:\s[A-Z]{2})?\s?\d{5}(?:-\d{4})?/i);
    if (addressMatches) {
      entities['address'] = addressMatches[0];
    }
    
    // Extract names (looking for patterns like "Name: John Smith" or just capitalized names)
    const namePatterns = [
      /(?:name|full name|customer|applicant)(?:\s*):?\s*([A-Z][a-z]+(?:\s[A-Z][a-z]+){1,3})/i,
      /([A-Z][a-z]+(?:\s[A-Z][a-z]+){1,3})/
    ];
    
    for (const pattern of namePatterns) {
      const nameMatch = text.match(pattern);
      if (nameMatch && nameMatch[1] && nameMatch[1].length > 3) {
        // Verify it's not just a single word or known non-name
        const potentialName = nameMatch[1].trim();
        if (potentialName.includes(' ') && 
            !['Address', 'Street', 'City', 'United States', 'Date'].includes(potentialName)) {
          entities['name'] = potentialName;
          break;
        }
      }
    }
    
    // Extract business name
    const businessNameMatch = text.match(/(?:business name|company name|corporation|enterprise|business)(?:\s*):?\s*([A-Za-z0-9\s&.,\'\"()-]{2,50})/i);
    if (businessNameMatch && businessNameMatch[1] && businessNameMatch[1].trim().length > 2) {
      entities['business_name'] = businessNameMatch[1].trim();
    }
    
    // Extract any ID numbers (SSN, EIN, account numbers, etc)
    const idPatterns = [
      /(?:SSN|Social Security)(?:\s*):?\s*(\d{3}-\d{2}-\d{4})/i,
      /(?:SSN|Social Security)(?:\s*):?\s*(\d{9})/i,
      /(?:EIN|Tax ID|Employer)(?:\s*):?\s*(\d{2}-\d{7})/i,
      /(?:Account|Acct)(?:\s*):?\s*(\d{8,17})/i,
      /(?:ID|Number)(?:\s*):?\s*([A-Z0-9]{5,15})/i,
    ];
    
    for (const pattern of idPatterns) {
      const idMatch = text.match(pattern);
      if (idMatch && idMatch[1]) {
        if (pattern.toString().includes('SSN')) {
          entities['ssn'] = idMatch[1];
        } else if (pattern.toString().includes('EIN')) {
          entities['ein'] = idMatch[1];
        } else if (pattern.toString().includes('Account')) {
          entities['account_number'] = idMatch[1];
        } else {
          entities['id_number'] = idMatch[1];
        }
      }
    }
    
    // Amount/Money extraction (improved pattern)
    const moneyMatches = text.match(/\$\s?\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d{1,3}(?:,\d{3})*(?:\.\d{2})?\s?(?:dollars|USD)/g);
    if (moneyMatches && moneyMatches.length > 0) {
      entities['amount'] = moneyMatches[0];
      
      // If there are multiple amounts, store the largest
      if (moneyMatches.length > 1) {
        // Parse amounts and find the largest
        const parsedAmounts = moneyMatches.map(amt => {
          const numStr = amt.replace(/[$,\s(dollars)(USD)]/g, '');
          return parseFloat(numStr);
        });
        
        const maxAmount = Math.max(...parsedAmounts);
        const maxIndex = parsedAmounts.indexOf(maxAmount);
        
        if (maxIndex >= 0) {
          entities['largest_amount'] = moneyMatches[maxIndex];
        }
      }
    }
    
    return entities;
  }
  // Process document completely
  public async processDocument(file: File): Promise<ExtractedDocumentData> {
    try {
      // First compress the file to reduce size
      const compressedFile = await this.compressFile(file);
      console.log(`File ${file.name} processed: Original size ${(file.size/1024).toFixed(2)}KB, compressed to ${(compressedFile.size/1024).toFixed(2)}KB`);
      
      // Timeout promise to ensure the process doesn't hang - reduced to 8 seconds to improve UX
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Document processing timed out')), 8000)
      );
      
      // Processing promise
      const processingPromise = this._processDocumentInternal(compressedFile);
      
      try {
        // Race between processing and timeout
        return await Promise.race([processingPromise, timeoutPromise]);
      } catch (error) {
        console.log('Processing with timeout failed, attempting simpler analysis:', error);
        // If the full processing fails or times out, fall back to a simpler extraction
        return this._fallbackDocumentProcessing(compressedFile);
      }
    } catch (error) {
      console.error('Error processing document:', error);
      
      // Return simplified document data as fallback instead of throwing an error
      return {
        documentType: DocumentType.UNKNOWN,
        confidence: 0,
        data: {},
        text: `Document uploaded successfully: ${file.name}`,
        dates: [],
        numbers: [],
        entities: {},
      };
    }
  }
  
  // Fallback processing with minimal extraction
  private async _fallbackDocumentProcessing(file: File): Promise<ExtractedDocumentData> {
    try {
      // Extract just a sample of text to identify the document type
      // For images, we'll get the first page or sample
      // For PDFs, just extract text from the first page
      
      let sampleText = '';
      if (file.type.startsWith('image/')) {
        // Get simplified text extraction
        const base64 = await this.fileToBase64(file);
        const result = await this.worker.recognize(base64, {
          rectangle: { top: 0, left: 0, width: 500, height: 400 } // just scan top portion
        });
        sampleText = result.data.text;
      } else {
        sampleText = `Document uploaded: ${file.name}`;
      }
      
      // Do a simple classification
      const docType = this._quickClassify(file.name, sampleText);
      
      // Extract any obvious entities
      const entities = this.extractEntities(sampleText);
      const dates = this.extractDates(sampleText);
      
      return {
        documentType: docType.type,
        confidence: docType.confidence,
        data: entities,
        text: `Document processed: ${file.name}`,
        dates: dates,
        numbers: [],
        entities: entities,
      };
    } catch (error) {
      console.error('Fallback processing failed:', error);
      return {
        documentType: DocumentType.UNKNOWN,
        confidence: 0,
        data: {},
        text: `Document uploaded: ${file.name}`,
        dates: [],
        numbers: [],
        entities: {},
      };
    }
  }
  
  // Quick classification based on filename and sample text
  private _quickClassify(filename: string, sampleText: string): { type: DocumentType; confidence: number } {
    const filenameLower = filename.toLowerCase();
    const textLower = sampleText.toLowerCase();
    
    // Try to classify based on filename first
    if (filenameLower.includes('license') || filenameLower.includes('certificate')) {
      return { type: DocumentType.BUSINESS_LICENSE, confidence: 0.7 };
    }
    if (filenameLower.includes('id') || filenameLower.includes('passport') || filenameLower.includes('driver')) {
      return { type: DocumentType.ID_DOCUMENT, confidence: 0.7 };
    }
    if (filenameLower.includes('tax') || filenameLower.includes('1040') || filenameLower.includes('return')) {
      return { type: DocumentType.TAX_RETURN, confidence: 0.7 };
    }
    if (filenameLower.includes('bank') || filenameLower.includes('statement')) {
      return { type: DocumentType.BANK_STATEMENT, confidence: 0.7 };
    }
    
    // Then try with sample text
    if (textLower.includes('license') || textLower.includes('certificate')) {
      return { type: DocumentType.BUSINESS_LICENSE, confidence: 0.6 };
    }
    if (textLower.includes('id') || textLower.includes('birth') || textLower.includes('name')) {
      return { type: DocumentType.ID_DOCUMENT, confidence: 0.6 };
    }
    
    // Default to unknown with low confidence
    return { type: DocumentType.UNKNOWN, confidence: 0.3 };
  }
  
  // Internal processing method - full analysis
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
