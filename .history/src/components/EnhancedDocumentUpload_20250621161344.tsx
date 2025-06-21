'use client';

import React, { useState, useRef, useCallback } from 'react';
import { AnimatedButton, FadeIn } from '@/components/animations';
import DocumentScanner, { DocumentType, ExtractedDocumentData } from '@/lib/document-scanner/DocumentScannerFixed';
import { motion } from 'framer-motion';

interface EnhancedDocumentUploadProps {
  onDataExtracted?: (data: ExtractedDocumentData) => void;
  onSave?: (data: { documentType: DocumentType; documentData: ExtractedDocumentData; files: File[] }) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number; // In MB
  maxFiles?: number;
}

export default function EnhancedDocumentUpload({
  onDataExtracted,
  onSave,
  acceptedFileTypes = ['.pdf', '.jpg', '.jpeg', '.png'],
  maxFileSize = 10, // 10MB default
  maxFiles = 5,
}: EnhancedDocumentUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [extractedData, setExtractedData] = useState<ExtractedDocumentData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<DocumentScanner | null>(null);

  // Initialize document scanner
  if (!scannerRef.current) {
    scannerRef.current = new DocumentScanner();
  }

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // Handle drop event
  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  // Handle file input change
  const handleFileInputChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleFiles(Array.from(e.target.files));
    }
  }, []);
  // Validate and process files
  const handleFiles = useCallback(async (newFiles: File[]) => {
    setErrorMessage('');
    
    // Check if too many files
    if (files.length + newFiles.length > maxFiles) {
      setErrorMessage(`You can only upload a maximum of ${maxFiles} files.`);
      return;
    }
    
    // Validate file types and size
    const invalidFiles = newFiles.filter(file => {
      const fileType = `.${file.name.split('.').pop()?.toLowerCase()}`;
      return !acceptedFileTypes.includes(fileType) && !acceptedFileTypes.includes('*');
    });
    
    if (invalidFiles.length > 0) {
      setErrorMessage(`Invalid file type. Please upload ${acceptedFileTypes.join(', ')} files only.`);
      return;
    }
    
    const oversizedFiles = newFiles.filter(file => file.size > maxFileSize * 1024 * 1024);
    
    if (oversizedFiles.length > 0) {
      setErrorMessage(`Files must be smaller than ${maxFileSize}MB.`);
      return;
    }
    
    // Add valid files to state
    setFiles(prevFiles => [...prevFiles, ...newFiles]);
      
    // Process the first file with document scanner
    if (newFiles.length > 0 && scannerRef.current) {
      setIsProcessing(true);
      setProcessingProgress(0);
      
      try {
        // Simulate progress updates - faster to improve perceived performance
        const progressInterval = setInterval(() => {
          setProcessingProgress(prev => {
            const next = prev + 15; // Faster increment
            return next >= 90 ? 90 : next;
          });
        }, 150);
        
        // Process document - our DocumentScanner now handles compression and fallback internally
        const result = await scannerRef.current.processDocument(newFiles[0]);
        
        clearInterval(progressInterval);
        setProcessingProgress(100);
        
        // If we have valid extracted data with useful information, use it
        if (result && (
            Object.keys(result.data).length > 0 || 
            result.documentType !== DocumentType.UNKNOWN || 
            (result.entities && Object.keys(result.entities).length > 0)
        )) {
          setExtractedData(result);
          if (onDataExtracted) {
            onDataExtracted(result);
          }
          
          // Proceed with save regardless of analysis success
          if (onSave) {
            onSave({
              documentType: result.documentType,
              documentData: result,
              files: newFiles
            });
          }
          
          // Show success message about document analysis
          const detectedItems = [
            result.documentType !== DocumentType.UNKNOWN ? `Document type: ${result.documentType}` : '',
            result.entities?.name ? `Name: ${result.entities.name}` : '',
            result.entities?.business_name ? `Business: ${result.entities.business_name}` : '',
            result.dates && result.dates.length ? `Dates found: ${result.dates.length}` : '',
          ].filter(Boolean);
          
          if (detectedItems.length > 0) {
            // Set a temporary success message
            const successMessage = `Document analyzed successfully! Detected: ${detectedItems.join(', ')}`;
            console.log(successMessage);
          }
        } else {
          // If no useful data was extracted, still proceed with upload
          if (onSave) {
            onSave({
              documentType: DocumentType.UNKNOWN,
              documentData: {
                documentType: DocumentType.UNKNOWN,
                confidence: 0,
                data: {},
                text: `Document uploaded: ${newFiles[0].name}`,
                dates: [],
                numbers: [],
                entities: {},
              },
              files: newFiles
            });
          }
        }
      } catch (error) {
        console.error('Error processing document:', error);
        setErrorMessage('Document uploaded successfully, but analysis could not be completed.');
        
        // Still allow the upload to proceed even if analysis fails
        const fallbackResult = {
          documentType: DocumentType.UNKNOWN,
          confidence: 0,
          data: {},
          text: `Document uploaded: ${newFiles[0].name}`,
          dates: [],
          numbers: [],
          entities: {},
        };
        
        if (onSave) {
          onSave({
            documentType: DocumentType.UNKNOWN,
            documentData: fallbackResult,
            files: newFiles
          });
        }
      } finally {
        setIsProcessing(false);
      }
    }
  }, [files, maxFiles, acceptedFileTypes, maxFileSize, onDataExtracted]);

  // Trigger file input click
  const onButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file removal
  const removeFile = (indexToRemove: number) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
    if (files.length === 1) {
      setExtractedData(null);
    }
  };

  // Handle save button click
  const handleSave = () => {
    if (onSave && extractedData && files.length > 0) {
      onSave({
        documentType: extractedData.documentType,
        documentData: extractedData,
        files,
      });
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <FadeIn>
        <div 
          className={`border-2 border-dashed rounded-lg p-6 transition-all ${
            dragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white'
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <div className="mx-auto mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path 
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
                  strokeWidth={2} 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </svg>
            </div>
            
            <h3 className="text-lg font-medium text-gray-700">
              Drop files here or
              <button 
                type="button" 
                className="text-green-600 font-medium mx-1 hover:text-green-700 focus:outline-none focus:underline"
                onClick={onButtonClick}
              >
                browse
              </button>
              to upload
            </h3>
            
            <p className="text-sm text-gray-500 mt-1">
              {`Accepted file types: ${acceptedFileTypes.join(', ')} (Max: ${maxFileSize}MB)`}
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple={maxFiles > 1}
              accept={acceptedFileTypes.join(',')}
              className="hidden"
              onChange={handleFileInputChange}
            />
          </div>
        </div>
      </FadeIn>
      
      {errorMessage && (
        <div className="text-red-500 text-sm mt-2">
          {errorMessage}
        </div>
      )}
        {isProcessing && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-1">Analyzing document... (will upload normally if analysis fails)</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <motion.div 
              className="bg-green-600 h-2.5 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${processingProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}
        {errorMessage && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-700">{errorMessage}</p>
          <p className="text-xs text-yellow-600 mt-1">Your document has been uploaded and will be processed manually.</p>
        </div>
      )}
      
      {isProcessing && processingProgress === 100 && !errorMessage && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-700">Document processed successfully!</p>
          <p className="text-xs text-green-600 mt-1">Your document has been analyzed and uploaded.</p>
        </div>
      )}
      
      {files.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium text-gray-700">Uploaded Files:</h4>
          <ul className="mt-2 divide-y divide-gray-200">
            {files.map((file, index) => (
              <motion.li 
                key={`${file.name}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="py-2 flex justify-between items-center"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {file.type.includes('image') ? (
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </motion.li>
            ))}
          </ul>
        </div>
      )}
      
      {extractedData && (
        <FadeIn className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h4 className="font-medium text-gray-800 mb-2">Document Analysis Results</h4>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Document Type:</span>
              <span className="text-sm font-medium text-gray-800">
                {extractedData.documentType} 
                <span className="text-xs text-gray-500 ml-2">
                  ({Math.round(extractedData.confidence * 100)}% confidence)
                </span>
              </span>
            </div>
            
            {Object.entries(extractedData.data).map(([key, value]) => (
              value && (
                <div key={key} className="flex justify-between">
                  <span className="text-sm text-gray-500">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                  <span className="text-sm text-gray-800">{value}</span>
                </div>
              )
            ))}
            
            {extractedData.dates && extractedData.dates.length > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Dates Found:</span>
                <span className="text-sm text-gray-800">{extractedData.dates.join(', ')}</span>
              </div>
            )}
            
            {extractedData.entities && Object.keys(extractedData.entities).length > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Detected Entities:</span>
                <div className="text-sm text-gray-800 text-right">
                  {Object.entries(extractedData.entities).map(([key, value]) => (
                    <div key={key}>
                      {key}: {value}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {onSave && (
            <div className="mt-4">
              <AnimatedButton onClick={handleSave} className="w-full">
                Save Document Information
              </AnimatedButton>
            </div>
          )}
        </FadeIn>
      )}
    </div>
  );
}
