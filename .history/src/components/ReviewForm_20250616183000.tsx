import { LoanApplication } from '@/types';

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
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Get document count
  const getDocumentCount = (documents: any, key: string) => {
    if (!documents || !documents[key]) return 0;
    return documents[key].length;
  };

  return (
    <div>
      <p className="text-gray-600 mb-6">
        Please review your application details before submitting. Make sure all information is correct.
      </p>
      
      {/* Personal Information */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
        <div className="bg-gray-50 p-4 rounded">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name:</p>
              <p>{formData.personalInfo?.firstName} {formData.personalInfo?.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email:</p>
              <p>{formData.personalInfo?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone:</p>
              <p>{formData.personalInfo?.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date of Birth:</p>
              <p>{formData.personalInfo?.dateOfBirth}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-600">Address:</p>
              <p>
                {formData.personalInfo?.address}, {formData.personalInfo?.city}, {formData.personalInfo?.state} {formData.personalInfo?.zipCode}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Business Information */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Business Information</h3>
        <div className="bg-gray-50 p-4 rounded">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <p className="text-sm text-gray-600">Business Name:</p>
              <p>{formData.businessInfo?.businessName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Business Type:</p>
              <p>{formData.businessInfo?.businessType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tax ID:</p>
              <p>{formData.businessInfo?.taxId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Years in Business:</p>
              <p>{formData.businessInfo?.yearsInBusiness}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Annual Revenue:</p>
              <p>{formatCurrency(formData.businessInfo?.annualRevenue || 0)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-600">Business Address:</p>
              <p>
                {formData.businessInfo?.businessAddress}, {formData.businessInfo?.businessCity}, 
                {formData.businessInfo?.businessState} {formData.businessInfo?.businessZipCode}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Loan Information */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Loan Information</h3>
        <div className="bg-gray-50 p-4 rounded">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Loan Type:</p>
              <p>{formData.loanInfo?.loanType} Financing</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Loan Amount:</p>
              <p>{formatCurrency(formData.loanInfo?.loanAmount || 0)}</p>
            </div>
            
            {formData.loanInfo?.loanType === 'Equipment' && (
              <>
                <div>
                  <p className="text-sm text-gray-600">Equipment Type:</p>
                  <p>{(formData.loanInfo as any)?.equipmentType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Equipment Cost:</p>
                  <p>{formatCurrency((formData.loanInfo as any)?.equipmentCost || 0)}</p>
                </div>
                {(formData.loanInfo as any)?.equipmentVendor && (
                  <div>
                    <p className="text-sm text-gray-600">Equipment Vendor:</p>
                    <p>{(formData.loanInfo as any)?.equipmentVendor}</p>
                  </div>
                )}
              </>
            )}
            
            {formData.loanInfo?.loanType === 'Business' && (
              <>
                <div>
                  <p className="text-sm text-gray-600">Monthly Revenue:</p>
                  <p>{formatCurrency((formData.loanInfo as any)?.monthlyRevenue || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Time in Business:</p>
                  <p>{(formData.loanInfo as any)?.timeInBusiness} years</p>
                </div>
              </>
            )}
            
            <div className="col-span-2">
              <p className="text-sm text-gray-600">Purpose:</p>
              <p>
                {formData.loanInfo?.loanType === 'Business' 
                  ? (formData.loanInfo as any)?.useOfFunds 
                  : formData.loanInfo?.loanPurpose
                }
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Documents */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Documents</h3>
        <div className="bg-gray-50 p-4 rounded">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Business License:</p>
              <p>{getDocumentCount(formData.documents, 'businessLicense')} file(s) uploaded</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">ID Document:</p>
              <p>{getDocumentCount(formData.documents, 'identificationDocument')} file(s) uploaded</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Bank Statements:</p>
              <p>{getDocumentCount(formData.documents, 'bankStatements')} file(s) uploaded</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Business Tax Returns:</p>
              <p>{getDocumentCount(formData.documents, 'businessTaxReturns')} file(s) uploaded</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">P&L Statements:</p>
              <p>{getDocumentCount(formData.documents, 'profitLossStatements')} file(s) uploaded</p>
            </div>
            {formData.loanInfo?.loanType === 'Equipment' && (
              <div>
                <p className="text-sm text-gray-600">Equipment Invoice:</p>
                <p>{getDocumentCount(formData.documents, 'equipmentInvoice')} file(s) uploaded</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Signature */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Signature</h3>
        <div className="bg-gray-50 p-4 rounded">
          {signature ? (
            <div className="max-w-xs">
              <img src={signature} alt="Your signature" className="border border-gray-300 bg-white" />
            </div>
          ) : (
            <p className="text-red-500">No signature provided</p>
          )}
        </div>
      </div>
      
      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="btn-outline"
          disabled={isSubmitting}
        >
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          className="btn-primary"
          disabled={isSubmitting || !signature}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </div>
    </div>
  );
}
