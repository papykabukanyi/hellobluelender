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
  private isInitialized = false;
  private modelLoaded = false;

  constructor() {
    // Initialize on construction
    this.initializeOCR();
  }

  // Initialize OCR capabilities
  public async initializeOCR() {
    try {
      if (!this.isInitialized) {
        // Create Tesseract worker
        this.worker = await createWorker('eng');
        this.isInitialized = true;
        console.log('OCR system initialized');
      }
    } catch (error) {
      console.error('Failed to initialize OCR system:', error);
      // Don't throw, allow fallback
    }
  }

  // Process document completely with robust error handling
  public async processDocument(file: File): Promise<ExtractedDocumentData> {
    try {
      if (!file || file.size === 0) {
        throw new Error('Invalid or empty file');
      }
      
      // First compress the file to reduce size
      const compressedFile = await this.compressFile(file);
      
      // Safe fallback data
      const fallbackData: ExtractedDocumentData = {
        documentType: DocumentType.UNKNOWN,
        confidence: 0,
        data: {},
        text: `Document: ${file.name}`,
        entities: {}
      };
      
      try {
        // Initialize OCR if not done yet
        if (!this.isInitialized) {
          await this.initializeOCR();
        }
        
        // If we couldn't initialize, return fallback
        if (!this.isInitialized || !this.worker) {
          console.warn('OCR not initialized, returning fallback data');
          return fallbackData;
        }
        
        // Basic text extraction
        let text = '';
        try {
          // Convert file to base64
          const base64 = await this.fileToBase64(compressedFile);
          const result = await this.worker.recognize(base64);
          text = result.data.text || '';
        } catch (error) {
          console.warn('Text extraction failed:', error);
          text = `Document name: ${file.name}`;
        }
        
        // Classify document safely
        let docType = DocumentType.UNKNOWN;
        let confidence = 0;
        
        try {
          const classification = this._quickClassify(file.name, text);
          docType = classification.type;
          confidence = classification.confidence;
        } catch (error) {
          console.warn('Document classification failed:', error);
        }
        
        // Extract data safely
        const data = {};
        const entities = {};
        
        return {
          documentType: docType,
          confidence: confidence,
          data: data,
          text: text,
          entities: entities
        };
      } catch (error) {
        console.error('Document processing error:', error);
        return fallbackData;
      }
    } catch (error) {
      console.error('Fatal document processing error:', error);
      // Return simplified document data as fallback
      return {
        documentType: DocumentType.UNKNOWN,
        confidence: 0,
        data: {},
        text: 'Document processing failed',
        entities: {}
      };
    }
  }
  
  // Compress image file to reduce size
  private async compressImage(file: File): Promise<File> {
    try {
      const maxWidth = 1200; // Max width for the image
      const maxHeight = 1200; // Max height for the image
      const quality = 0.7; // Image quality (0 to 1)
      
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = height * (maxWidth / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = width * (maxHeight / height);
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // Get the data from canvas as blob
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Canvas to Blob conversion failed'));
              return;
            }
            
            const newFile = new File([blob], file.name, {
              type: file.type,
              lastModified: file.lastModified,
            });
            
            resolve(newFile);
          }, file.type, quality);
        };
        
        img.onerror = () => {
          reject(new Error('Error loading image for compression'));
        };
        
        img.src = URL.createObjectURL(file);
      });
    } catch (error) {
      console.error('Image compression failed:', error);
      return file; // Return original if compression fails
    }
  }
  
  // Convert file to base64
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else if (reader.result) {
          // Handle ArrayBuffer result if needed
          const buffer = reader.result as ArrayBuffer;
          const bytes = new Uint8Array(buffer);
          let binary = '';
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          resolve(window.btoa(binary));
        } else {
          reject(new Error('FileReader result is null'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file for compression'));
      };
      
      reader.readAsDataURL(file);
    });
  }

  // Simple document classification based on filename and sample text
  private _quickClassify(filename: string, text: string): { type: DocumentType; confidence: number } {
    const lowerFilename = filename.toLowerCase();
    const lowerText = text.toLowerCase();
    
    // Simple rule-based classifier
    if (
      lowerFilename.includes('license') || 
      lowerText.includes('business license') || 
      lowerText.includes('permit')
    ) {
      return { type: DocumentType.BUSINESS_LICENSE, confidence: 0.7 };
    }
    
    if (
      lowerFilename.includes('id') || 
      lowerFilename.includes('passport') || 
      lowerText.includes('identification') ||
      lowerText.includes('date of birth')
    ) {
      return { type: DocumentType.ID_DOCUMENT, confidence: 0.7 };
    }
    
    if (
      lowerFilename.includes('tax') || 
      lowerFilename.includes('1040') || 
      lowerText.includes('tax return') ||
      lowerText.includes('internal revenue')
    ) {
      return { type: DocumentType.TAX_RETURN, confidence: 0.8 };
    }
    
    if (
      lowerFilename.includes('bank') || 
      lowerFilename.includes('statement') || 
      lowerText.includes('account statement') ||
      lowerText.includes('balance') ||
      lowerText.includes('transaction history')
    ) {
      return { type: DocumentType.BANK_STATEMENT, confidence: 0.75 };
    }
    
    // Default to unknown with low confidence
    return { type: DocumentType.UNKNOWN, confidence: 0.3 };
  }

  // Compress file based on type
  public async compressFile(file: File): Promise<File> {
    try {
      if (file.type.startsWith('image/')) {
        return await this.compressImage(file);
      }
      // For other files (like PDFs), just return the original for now
      return file;
    } catch (error) {
      console.error('File compression error:', error);
      return file; // Return original if compression fails
    }
  }
}

export default DocumentScanner;
