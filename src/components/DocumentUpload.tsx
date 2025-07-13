'use client';

import { useState } from 'react';
import { ApplicationDocuments, LoanApplication } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import AnimatedButton from './animations/AnimatedButton';
import FadeIn from './animations/FadeIn';

type DocumentUploadProps = {
  onNext: (data: { documents: ApplicationDocuments }) => void;
  onBack: () => void;
  formData: Partial<LoanApplication>;
};

export default function DocumentUpload({ onNext, onBack, formData }: DocumentUploadProps) {
  const [documents, setDocuments] = useState<{[key: string]: File[]}>({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [uploadedDocuments, setUploadedDocuments] = useState<{[key: string]: any[]}>({});
  
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
    
    setDocuments(prev => ({ ...prev, [docType]: fileList }));
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
              try {
                const data = new FormData();
                data.append('file', file);
                data.append('applicationId', applicationId);
                data.append('documentType', docType);
                
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
                  console.warn(`Upload issue for ${docType}, continuing with application`);
                  return { 
                    docType, 
                    status: 'warning',
                    originalName: file.name,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    path: '',
                    uploadedAt: new Date().toISOString()
                  };
                }
                
                const result = await response.json();
                return result.file;
              } catch (uploadError) {
                console.error(`Error uploading ${docType} document:`, uploadError);
                return { 
                  docType, 
                  status: 'error',
                  originalName: file.name,
                  name: file.name,
                  type: file.type,
                  size: file.size,
                  path: '',
                  uploadedAt: new Date().toISOString()
                };
              }
            })
          );
          
          return { [docType]: uploadedFiles };
        }
        return {};
      });
      
      // Wait for all uploads to complete
      const uploadedDocuments = await Promise.all(uploadPromises);
      
      // Combine all uploaded documents
      const combinedDocuments = uploadedDocuments.reduce((acc, doc) => {
        return { ...acc, ...doc };
      }, {});

      // Update uploaded documents state
      setUploadedDocuments(combinedDocuments);
      
      // Pass the uploaded documents to the next step
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

  // Document categories based on loan type
  const documentCategories = {
    'Business': [
      { key: 'businessLicense', label: 'Business License/Registration', required: true },
      { key: 'taxReturns', label: 'Business Tax Returns (Last 2 Years)', required: true },
      { key: 'bankStatements', label: 'Bank Statements (Last 3 Months)', required: true },
      { key: 'financialStatements', label: 'Financial Statements', required: true },
      { key: 'identityDocument', label: 'Government ID', required: true },
      { key: 'businessPlan', label: 'Business Plan', required: false },
      { key: 'collateralDocuments', label: 'Collateral Documents', required: false },
    ],
    'Equipment': [
      { key: 'businessLicense', label: 'Business License/Registration', required: true },
      { key: 'taxReturns', label: 'Business Tax Returns (Last 2 Years)', required: true },
      { key: 'bankStatements', label: 'Bank Statements (Last 3 Months)', required: true },
      { key: 'equipmentQuotes', label: 'Equipment Quotes/Invoices', required: true },
      { key: 'identityDocument', label: 'Government ID', required: true },
      { key: 'equipmentSpecifications', label: 'Equipment Specifications', required: false },
    ],
    'SBA': [
      { key: 'businessLicense', label: 'Business License/Registration', required: true },
      { key: 'taxReturns', label: 'Business Tax Returns (Last 3 Years)', required: true },
      { key: 'bankStatements', label: 'Bank Statements (Last 3 Months)', required: true },
      { key: 'financialStatements', label: 'Financial Statements', required: true },
      { key: 'identityDocument', label: 'Government ID', required: true },
      { key: 'businessPlan', label: 'Detailed Business Plan', required: true },
      { key: 'personalFinancialStatement', label: 'Personal Financial Statement', required: true },
      { key: 'collateralDocuments', label: 'Collateral Documents', required: false },
    ]
  };

  const currentDocuments = documentCategories[loanType as keyof typeof documentCategories] || documentCategories['Business'];

  return (
    <form onSubmit={handleSubmit}>
      <FadeIn>
        <p className="mb-6 text-gray-600">
          Please upload the required documents to help us process your application faster.
        </p>
      </FadeIn>
      
      {/* Document Upload Section */}
      <div className="mb-6">
        <FadeIn>
          <h3 className="text-lg font-semibold mb-4">Required Documents</h3>
        </FadeIn>
        
        <div className="space-y-6">
          {currentDocuments.map((docCategory, index) => (
            <div key={docCategory.key} className="border rounded-lg p-4 bg-gray-50">
              <FadeIn delay={index * 0.1}>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {docCategory.label} {docCategory.required && <span className="text-red-500">*</span>}
                </label>
              </FadeIn>
              
              <input
                type="file"
                id={docCategory.key}
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(e, docCategory.key as keyof ApplicationDocuments)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              
              {/* Show selected files */}
              {documents[docCategory.key] && documents[docCategory.key].length > 0 && (
                <div className="mt-3 space-y-2">
                  {documents[docCategory.key].map((file, fileIndex) => (
                    <div key={fileIndex} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">
                          {file.type.includes('pdf') ? '📄' : '🖼️'}
                        </span>
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      {uploadProgress[`${docCategory.key}-${fileIndex}`] && (
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress[`${docCategory.key}-${fileIndex}`]}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Show errors */}
              {errors[docCategory.key] && (
                <p className="mt-2 text-sm text-red-600">{errors[docCategory.key]}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* General error message */}
      {errors.general && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{errors.general}</p>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <AnimatedButton
          type="button"
          onClick={onBack}
          disabled={uploading}
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
        >
          Back
        </AnimatedButton>
        
        <AnimatedButton
          type="submit"
          disabled={uploading || Object.keys(documents).length === 0}
          className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Continue'}
        </AnimatedButton>
      </div>
    </form>
  );
}
