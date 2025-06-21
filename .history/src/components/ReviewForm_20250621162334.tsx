import { LoanApplication } from '@/types';
import LoadingButton from './LoadingButton';

type ReviewFormProps = {
  onSubmit: () => void;
  onBack: () => void;
  formData: LoanApplication;
  signature: string | null;
  isSubmitting: boolean;
};

export default function ReviewForm({ 
  onSubmit, 
  onBack, 
  formData, 
  signature, 
  isSubmitting 
}: ReviewFormProps) {
  const { personalInfo, businessInfo, loanInfo, coApplicantInfo, coApplicantSignature } = formData;
  
  // Format currency display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  return (
    <div>
      <p className="mb-6 text-gray-600">
        Please review your application information before submitting. Once submitted, you will receive a confirmation email with your application details.
      </p>
      
      {/* Personal Information */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700">Name</h4>
              <p>{personalInfo.firstName} {personalInfo.lastName}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700">Email</h4>
              <p>{personalInfo.email}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700">Phone</h4>
              <p>{personalInfo.phone}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700">Date of Birth</h4>
              <p>{personalInfo.dateOfBirth}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700">SSN</h4>
              <p>•••••••••</p>
            </div>
            <div className="md:col-span-2">
              <h4 className="text-sm font-medium text-gray-700">Address</h4>
              <p>{personalInfo.address}, {personalInfo.city}, {personalInfo.state} {personalInfo.zipCode}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Co-Applicant Information (if present) */}
      {coApplicantInfo && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Co-Applicant Information</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Name</h4>
                <p>{coApplicantInfo.firstName} {coApplicantInfo.lastName}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700">Email</h4>
                <p>{coApplicantInfo.email}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700">Phone</h4>
                <p>{coApplicantInfo.phone}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700">Date of Birth</h4>
                <p>{coApplicantInfo.dateOfBirth}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700">SSN</h4>
                <p>•••••••••</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700">Relationship to Business</h4>
                <p>{coApplicantInfo.relationshipToBusiness}</p>
              </div>
              <div className="md:col-span-2">
                <h4 className="text-sm font-medium text-gray-700">Address</h4>
                <p>{coApplicantInfo.address}, {coApplicantInfo.city}, {coApplicantInfo.state} {coApplicantInfo.zipCode}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Business Information */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Business Information</h3>
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700">Business Name</h4>
              <p>{businessInfo.businessName}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700">Business Type</h4>
              <p>{businessInfo.businessType}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700">Tax ID (EIN)</h4>
              <p>•••••••••</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700">Years in Business</h4>
              <p>{businessInfo.yearsInBusiness}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700">Annual Revenue</h4>
              <p>{formatCurrency(businessInfo.annualRevenue)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700">Business Phone</h4>
              <p>{businessInfo.businessPhone}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700">Business Email</h4>
              <p>{businessInfo.businessEmail}</p>
            </div>
            <div className="md:col-span-2">
              <h4 className="text-sm font-medium text-gray-700">Business Address</h4>
              <p>{businessInfo.businessAddress}, {businessInfo.businessCity}, {businessInfo.businessState} {businessInfo.businessZipCode}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Loan Information */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Loan Information</h3>
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700">Loan Type</h4>
              <p>{loanInfo.loanType}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700">Loan Amount</h4>
              <p>{formatCurrency(loanInfo.loanAmount)}</p>
            </div>
            <div className="md:col-span-2">
              <h4 className="text-sm font-medium text-gray-700">Loan Purpose</h4>
              <p>{loanInfo.loanPurpose}</p>
            </div>
          </div>
        </div>
      </div>      {/* Signature */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Signature</h3>
        <div className="bg-gray-50 p-4 rounded-md flex justify-center">
          {signature ? (
            <div className="flex flex-col items-center">
              <img 
                src={signature} 
                alt="Applicant Signature" 
                className="max-h-32 border-b border-gray-300 pb-2" 
                onError={(e) => {
                  console.error('Signature image failed to load');
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement?.insertAdjacentHTML('beforeend', 
                    '<p class="text-red-500">Error displaying signature. Please try again.</p>');
                }}
              />
              <p className="mt-2 text-sm text-gray-500">Applicant Signature</p>
            </div>
          ) : (
            <p className="text-red-500">No signature provided</p>
          )}
        </div>
      </div>
      
      {/* Co-Applicant Signature (if present) */}
      {coApplicantInfo && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Co-Applicant Signature</h3>
          <div className="bg-gray-50 p-4 rounded-md flex justify-center">
            {coApplicantSignature ? (
              <img src={coApplicantSignature} alt="Co-Applicant Signature" className="max-h-32" />
            ) : (
              <p className="text-red-500">No co-applicant signature provided</p>
            )}
          </div>
        </div>
      )}
      
      {/* Terms & Conditions */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Terms and Conditions</h3>
        <div className="bg-gray-50 p-4 rounded-md">          <p className="text-sm">
            By submitting this application, you certify that all information provided is true and correct to the best of your knowledge. You authorize <span className="font-permanentMarker">Hempire Enterprise</span> to verify all information provided, including obtaining credit reports and contacting references. You understand that submitting this application does not guarantee loan approval. <span className="font-permanentMarker">Hempire Enterprise</span> will review your application and contact you regarding the decision.
          </p>
        </div>
      </div>
        <div className="mt-8 flex justify-between">
        <button
          type="button"
          className="btn-secondary"
          onClick={onBack}
          disabled={isSubmitting}
        >
          Back
        </button>
        
        <LoadingButton
          type="button"
          className="btn-primary"
          onClick={onSubmit}
          isLoading={isSubmitting}
          loadingText="Submitting..."
        >
          Submit Application
        </LoadingButton>
      </div>
    </div>
  );
}
