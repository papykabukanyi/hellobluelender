import { useState } from 'react';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PersonalInfoForm from './PersonalInfoForm';
import BusinessInfoForm from './BusinessInfoForm';
import LoanInfoForm from './LoanInfoForm';
import DocumentUpload from './DocumentUpload';
import SignatureForm from './SignatureForm';
import ReviewForm from './ReviewForm';
import { LoanApplication } from '@/types';
import { useRouter } from 'next/navigation';

// Form steps
const formSteps = [
  { id: 'personal', label: 'Personal Information' },
  { id: 'business', label: 'Business Information' },
  { id: 'loan', label: 'Loan Details' },
  { id: 'documents', label: 'Documents' },
  { id: 'signature', label: 'Signature' },
  { id: 'review', label: 'Review & Submit' },
];

export default function ApplicationForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<LoanApplication>>({
    personalInfo: {},
    businessInfo: {},
    loanInfo: { loanType: 'Business' },
    documents: {},
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const router = useRouter();

  // Initialize form methods with empty validation for now
  // Each step will have its own validation schema
  const methods = useForm({
    mode: 'onChange',
    defaultValues: formData,
  });

  // Handle next step
  const handleNext = (data: any) => {
    // Update form data with current step data
    setFormData(prev => ({ ...prev, ...data }));
    
    // Move to next step
    if (currentStep < formSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  // Handle back
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  // Handle signature change
  const handleSignatureChange = (dataUrl: string | null) => {
    setSignature(dataUrl);
  };

  // Handle final submission
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Prepare final data with signature
      const finalData = {
        ...formData,
        signature,
        status: 'submitted',
        createdAt: new Date().toISOString(),
      };
      
      // Submit the application to the server
      const response = await fetch('/api/application/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit application');
      }
      
      // Redirect to success page
      router.push(`/application/success?id=${result.id}`);
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('There was an error submitting your application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render form step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <PersonalInfoForm onNext={handleNext} formData={formData.personalInfo} />;
      case 1:
        return <BusinessInfoForm onNext={handleNext} onBack={handleBack} formData={formData.businessInfo} />;
      case 2:
        return (
          <LoanInfoForm 
            onNext={handleNext} 
            onBack={handleBack} 
            formData={formData.loanInfo} 
            loanType={formData.loanInfo?.loanType || 'Business'} 
          />
        );
      case 3:
        return <DocumentUpload onNext={handleNext} onBack={handleBack} formData={formData} />;
      case 4:
        return (
          <SignatureForm 
            onNext={handleNext} 
            onBack={handleBack} 
            onSignatureChange={handleSignatureChange} 
            signature={signature}
          />
        );
      case 5:
        return (
          <ReviewForm 
            onSubmit={handleSubmit} 
            onBack={handleBack} 
            formData={formData as LoanApplication} 
            signature={signature}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* Progress Steps */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex min-w-max">
          {formSteps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    index === currentStep 
                      ? 'bg-primary text-white' 
                      : index < currentStep 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index < currentStep ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="text-xs mt-1 text-center">{step.label}</div>
              </div>
              {index < formSteps.length - 1 && (
                <div 
                  className={`h-0.5 w-12 ${
                    index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Form Content */}
      <FormProvider {...methods}>
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{formSteps[currentStep].label}</h2>
          {renderStepContent()}
        </div>
      </FormProvider>
    </div>
  );
}
