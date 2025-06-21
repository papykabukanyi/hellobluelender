'use client';

import { useState } from 'react';
import { ApplicationDocuments, LoanApplication } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import EnhancedDocumentUpload from './EnhancedDocumentUpload';
import { DocumentType, ExtractedDocumentData } from '@/lib/document-scanner/DocumentScanner';
import { AnimatedButton, FadeIn } from './animations';

type DocumentUploadProps = {
  onNext: (data: { documents: ApplicationDocuments }) => void;
  onBack: () => void;
  formData: Partial<LoanApplication>;
};

export default function DocumentUpload({ onNext, onBack, formData }: DocumentUploadProps) {
  const [documents, setDocuments] = useState<any>({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [extractedDocData, setExtractedDocData] = useState<Record<string, ExtractedDocumentData>>({});
  
  // The loan type determines which documents are required
  const loanType = formData.loanInfo?.loanType || 'Business';
  
  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, docType: keyof ApplicationDocuments) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    // Clear any previous errors
    setErrors(prev => ({...prev, [docType]: ''}));
    
    const fileList = Array.from(e.target.files);
    
    // Validate file size (10MB limit)
    const invalidFiles = fileList.filter(file => file.size > 10 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      setErrors(prev => ({...prev, [docType]: 'One or more files exceed the 10MB size limit.'}));
      return;
    }
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    const invalidTypes = fileList.filter(file => !allowedTypes.includes(file.type));
    if (invalidTypes.length > 0) {
      setErrors(prev => ({...prev, [docType]: 'Only PDF, JPG, and PNG files are allowed.'}));
      return;
    }
    
    setDocuments((prev: any) => ({ ...prev, [docType]: fileList }));
  };
    // Handle document data extraction
  const handleDataExtracted = (docType: string, data: ExtractedDocumentData) => {
    setExtractedDocData(prev => ({
      ...prev,
      [docType]: data
    }));
    
    // Log the extracted data
    console.log(`Data extracted from ${docType}:`, data);
  };

  // Handle saved document data
  const handleDocumentSave = (docType: keyof ApplicationDocuments, data: {
    documentType: DocumentType;
    documentData: ExtractedDocumentData;
    files: File[];
  }) => {
    setDocuments(prev => ({
      ...prev,
      [docType]: data.files
    }));
    
    // Store the extracted data for later use
    setExtractedDocData(prev => ({
      ...prev,
      [docType]: data.documentData
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUploading(true);
      
      // Generate a temporary application ID if none exists yet
      const applicationId = formData.id || `temp-${uuidv4()}`;
      
      // Upload each file to the server
      const uploadPromises = Object.entries(documents).map(async ([docType, files]) => {
        // Handle multiple files for a document type
        if (Array.isArray(files)) {
          const uploadedFiles = await Promise.all(
            files.map(async (file: File, index: number) => {
              const data = new FormData();
              data.append('file', file);
              data.append('applicationId', applicationId);
              data.append('documentType', docType);
              
              // Add extracted data if available
              if (extractedDocData[docType]) {
                data.append('extractedData', JSON.stringify(extractedDocData[docType]));
              }
              
              const response = await fetch('/api/uploads', {
                method: 'POST',
                body: data,
              });
              
              // Update progress
              setUploadProgress(prev => ({
                ...prev, 
                [`${docType}-${index}`]: 100
              }));
              
              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to upload file');
              }
              
              return await response.json();
            })
          );
          
          return { [docType]: uploadedFiles.map(uf => uf.file) };
        }
        return {};
      });
      
      // Wait for all uploads to complete
      const uploadedDocuments = await Promise.all(uploadPromises);
      
      // Combine all uploaded documents
      const combinedDocuments = uploadedDocuments.reduce((acc, doc) => {
        return { ...acc, ...doc };
      }, {});
        // Apply the extracted data to the documents object for type information
      onNext({ 
        documents: combinedDocuments
      });
      setUploading(false);
    } catch (error) {
      console.error('Error uploading documents:', error);
      setErrors(prev => ({...prev, general: 'Failed to upload documents. Please try again.'}));
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <p className="mb-6 text-gray-600">
        Please upload the required documents to help us process your application faster.
        All files should be in PDF, JPG, or PNG format and less than 10MB in size.
      </p>
      
      {/* Required Documents */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Required Documents</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="businessLicense" className="block text-sm font-medium text-gray-700 mb-1">
              Business License/Registration *
            </label>            <input
              type="file"
              id="businessLicense"
              className="form-input"
              onChange={(e) => handleFileChange(e, 'businessLicense')}
              accept=".pdf,.jpg,.jpeg,.png"
              required
            />
            {errors.businessLicense && (
              <p className="mt-1 text-sm text-red-600">{errors.businessLicense}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="identificationDocument" className="block text-sm font-medium text-gray-700 mb-1">
              Government-issued ID (Driver's License or Passport) *
            </label>            <input
              type="file"
              id="identificationDocument"
              className="form-input"
              onChange={(e) => handleFileChange(e, 'identificationDocument')}
              accept=".pdf,.jpg,.jpeg,.png"
              required
            />
            {errors.identificationDocument && (
              <p className="mt-1 text-sm text-red-600">{errors.identificationDocument}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="bankStatements" className="block text-sm font-medium text-gray-700 mb-1">
              Last 3 Months of Bank Statements *
            </label>            <input
              type="file"
              id="bankStatements"
              className="form-input"
              multiple
              onChange={(e) => handleFileChange(e, 'bankStatements')}
              accept=".pdf,.jpg,.jpeg,.png"
              required
            />
            {errors.bankStatements && (
              <p className="mt-1 text-sm text-red-600">{errors.bankStatements}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Additional Documents */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Additional Documents (if available)</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="businessTaxReturns" className="block text-sm font-medium text-gray-700 mb-1">
              Business Tax Returns (last 2 years)
            </label>
            <input
              type="file"
              id="businessTaxReturns"
              className="form-input"
              multiple
              onChange={(e) => handleFileChange(e, 'businessTaxReturns')}
              accept=".pdf,.jpg,.jpeg,.png"
            />
          </div>
          
          <div>
            <label htmlFor="profitLossStatements" className="block text-sm font-medium text-gray-700 mb-1">
              Profit & Loss Statements
            </label>
            <input
              type="file"
              id="profitLossStatements"
              className="form-input"
              multiple
              onChange={(e) => handleFileChange(e, 'profitLossStatements')}
              accept=".pdf,.jpg,.jpeg,.png"
            />
          </div>
          
          {loanType === 'Equipment' && (
            <div>
              <label htmlFor="equipmentInvoice" className="block text-sm font-medium text-gray-700 mb-1">
                Equipment Quote/Invoice
              </label>
              <input
                type="file"
                id="equipmentInvoice"
                className="form-input"
                onChange={(e) => handleFileChange(e, 'equipmentInvoice')}
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </div>
          )}
        </div>
      </div>      
      {/* Error messages */}
      {errors.general && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          {errors.general}
        </div>
      )}
      
      {/* Upload progress */}
      {uploading && Object.keys(uploadProgress).length > 0 && (
        <div className="mt-4 mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Upload Progress</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-primary h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${Object.values(uploadProgress).reduce((a, b) => a + b, 0) / Object.keys(uploadProgress).length}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="btn-outline"
          disabled={uploading}
        >
          Back
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Next'}
        </button>
      </div>
    </form>
  );
}
