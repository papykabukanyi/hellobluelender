import { useState } from 'react';
import { ApplicationDocuments, LoanApplication } from '@/types';

type DocumentUploadProps = {
  onNext: (data: { documents: ApplicationDocuments }) => void;
  onBack: () => void;
  formData: Partial<LoanApplication>;
};

export default function DocumentUpload({ onNext, onBack, formData }: DocumentUploadProps) {
  const [documents, setDocuments] = useState<any>({});
  const [uploading, setUploading] = useState(false);
  
  // The loan type determines which documents are required
  const loanType = formData.loanInfo?.loanType || 'Business';
  
  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, docType: keyof ApplicationDocuments) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const fileList = Array.from(e.target.files);
    setDocuments((prev: any) => ({ ...prev, [docType]: fileList }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUploading(true);
      
      // Here we would normally upload the files to a server
      // For this demo, we'll just simulate a delay and then continue
      
      // In a real app, you'd upload the files to your server/storage
      // and then store the URLs/paths in your database
      
      setTimeout(() => {
        onNext({ documents });
        setUploading(false);
      }, 1000);
    } catch (error) {
      console.error('Error uploading documents:', error);
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
            </label>
            <input
              type="file"
              id="businessLicense"
              className="form-input"
              onChange={(e) => handleFileChange(e, 'businessLicense')}
              accept=".pdf,.jpg,.jpeg,.png"
              required
            />
          </div>
          
          <div>
            <label htmlFor="identificationDocument" className="block text-sm font-medium text-gray-700 mb-1">
              Government-issued ID (Driver's License or Passport) *
            </label>
            <input
              type="file"
              id="identificationDocument"
              className="form-input"
              onChange={(e) => handleFileChange(e, 'identificationDocument')}
              accept=".pdf,.jpg,.jpeg,.png"
              required
            />
          </div>
          
          <div>
            <label htmlFor="bankStatements" className="block text-sm font-medium text-gray-700 mb-1">
              Last 3 Months of Bank Statements *
            </label>
            <input
              type="file"
              id="bankStatements"
              className="form-input"
              multiple
              onChange={(e) => handleFileChange(e, 'bankStatements')}
              accept=".pdf,.jpg,.jpeg,.png"
              required
            />
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
      
      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="btn-outline"
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
