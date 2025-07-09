'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CoApplicantInfo } from '@/types';
import SignatureCanvas from 'react-signature-canvas';

// Validation schema for co-applicant information
const coApplicantInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(5, 'Please enter a valid zip code'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  ssn: z.string().length(9, 'Full 9-digit SSN required (no dashes)'),
  relationshipToBusiness: z.string().min(1, 'Relationship to business is required'),
});

type CoApplicantFormProps = {
  onNext: (data: { coApplicantInfo: CoApplicantInfo | null, coApplicantSignature: string | null }) => void;
  onBack: () => void;
  formData?: Partial<CoApplicantInfo>;
  signature?: string | null;
};

export default function CoApplicantForm({ onNext, onBack, formData = {}, signature = null }: CoApplicantFormProps) {  const [includeCoApplicant, setIncludeCoApplicant] = useState(!!Object.keys(formData).length);
  const [sigPad, setSigPad] = useState<SignatureCanvas | null>(null);
  const [sigDataURL, setSigDataURL] = useState<string | null>(signature);
  const [showTextSignature, setShowTextSignature] = useState<boolean>(true);
  const [coApplicantFirstName, setCoApplicantFirstName] = useState<string>('');
  const [coApplicantLastName, setCoApplicantLastName] = useState<string>('');

  // Initialize form with validation schema and default values
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CoApplicantInfo>({
    resolver: zodResolver(coApplicantInfoSchema) as any,
    defaultValues: formData,
  });

  // Handle form submission
  const onSubmit = (data: CoApplicantInfo) => {
    if (includeCoApplicant) {
      onNext({ 
        coApplicantInfo: data, 
        coApplicantSignature: sigDataURL 
      });
    } else {
      onNext({ 
        coApplicantInfo: null, 
        coApplicantSignature: null 
      });
    }
  };

  // Skip co-applicant
  const handleSkip = () => {
    onNext({ coApplicantInfo: null, coApplicantSignature: null });
  };

  // Toggle co-applicant inclusion
  const handleToggleCoApplicant = () => {
    setIncludeCoApplicant(!includeCoApplicant);
    // Reset form when toggling off
    if (includeCoApplicant) {
      reset();
      setSigDataURL(null);
      if (sigPad) sigPad.clear();
    }
  };
  // Signature pad methods
  const handleSigPadClear = () => {
    if (sigPad) {
      sigPad.clear();
      setSigDataURL(null);
    } else {
      setCoApplicantFirstName('');
      setCoApplicantLastName('');
      setSigDataURL(null);
    }
  };

  const handleSigPadEnd = () => {
    if (sigPad && !sigPad.isEmpty()) {
      setSigDataURL(sigPad.getTrimmedCanvas().toDataURL('image/png'));
    }
  };
  
  // Generate signature from name
  const generateSignature = () => {
    if (coApplicantFirstName && coApplicantLastName) {
      // Generate signature from name
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Set signature style
        ctx.font = 'italic 36px cursive';
        ctx.fillStyle = 'black';
        ctx.textBaseline = 'middle';
        
        // Position in the middle of canvas
        const fullName = `${coApplicantFirstName} ${coApplicantLastName}`;
        const textWidth = ctx.measureText(fullName).width;
        const xPos = (canvas.width - textWidth) / 2;
        
        // Draw the signature
        ctx.fillText(fullName, xPos, canvas.height / 2);
        
        // Convert to data URL and set as signature
        const signatureDataUrl = canvas.toDataURL('image/png');
        setSigDataURL(signatureDataUrl);
      }
    } else {
      alert('Please enter both first name and last name to generate a signature');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit as any)}>
      <div className="mb-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            className="form-checkbox h-5 w-5 text-primary"
            checked={includeCoApplicant}
            onChange={handleToggleCoApplicant}
          />
          <span className="ml-2 text-gray-700">Include Co-Applicant Information</span>
        </label>
      </div>

      {includeCoApplicant && (
        <>
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Co-Applicant Information</h3>
            <p className="text-gray-600 text-sm">Please provide the co-applicant's personal information.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                className={`form-input ${errors.firstName ? 'border-red-500' : ''}`}
                {...register('firstName')}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-500">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                className={`form-input ${errors.lastName ? 'border-red-500' : ''}`}
                {...register('lastName')}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-500">{errors.lastName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                className={`form-input ${errors.phone ? 'border-red-500' : ''}`}
                placeholder="(123) 456-7890"
                {...register('phone')}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth *
              </label>
              <input
                type="date"
                id="dateOfBirth"
                className={`form-input ${errors.dateOfBirth ? 'border-red-500' : ''}`}
                {...register('dateOfBirth')}
              />
              {errors.dateOfBirth && (
                <p className="mt-1 text-sm text-red-500">{errors.dateOfBirth.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="ssn" className="block text-sm font-medium text-gray-700 mb-1">
                SSN (9 digits, no dashes) *
              </label>
              <input
                type="password"
                id="ssn"
                className={`form-input ${errors.ssn ? 'border-red-500' : ''}`}
                placeholder="123456789"
                maxLength={9}
                {...register('ssn')}
              />
              {errors.ssn && (
                <p className="mt-1 text-sm text-red-500">{errors.ssn.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="relationshipToBusiness" className="block text-sm font-medium text-gray-700 mb-1">
                Relationship to Business *
              </label>
              <select
                id="relationshipToBusiness"
                className={`form-select ${errors.relationshipToBusiness ? 'border-red-500' : ''}`}
                {...register('relationshipToBusiness')}
              >
                <option value="">Select relationship</option>
                <option value="Partner">Partner</option>
                <option value="Spouse">Spouse</option>
                <option value="Co-Owner">Co-Owner</option>
                <option value="Officer">Officer</option>
                <option value="Manager">Manager</option>
                <option value="Other">Other</option>
              </select>
              {errors.relationshipToBusiness && (
                <p className="mt-1 text-sm text-red-500">{errors.relationshipToBusiness.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Street Address *
              </label>
              <input
                type="text"
                id="address"
                className={`form-input ${errors.address ? 'border-red-500' : ''}`}
                {...register('address')}
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                id="city"
                className={`form-input ${errors.city ? 'border-red-500' : ''}`}
                {...register('city')}
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-500">{errors.city.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  id="state"
                  className={`form-input ${errors.state ? 'border-red-500' : ''}`}
                  {...register('state')}
                />
                {errors.state && (
                  <p className="mt-1 text-sm text-red-500">{errors.state.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Zip Code *
                </label>
                <input
                  type="text"
                  id="zipCode"
                  className={`form-input ${errors.zipCode ? 'border-red-500' : ''}`}
                  {...register('zipCode')}
                />
                {errors.zipCode && (
                  <p className="mt-1 text-sm text-red-500">{errors.zipCode.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Signature Pad */}          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Co-Applicant Signature *
            </label>
            
            {sigDataURL ? (
              <div className="border border-gray-300 rounded p-2 mb-2">
                <div className="flex flex-col items-center">
                  <img src={sigDataURL} alt="Signature" className="max-h-32" />
                  <button
                    type="button"
                    className="text-sm text-red-600 hover:text-red-800 mt-2"
                    onClick={handleSigPadClear}
                  >
                    Clear Signature
                  </button>
                </div>
              </div>
            ) : showTextSignature ? (
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="coApplicantFirstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="coApplicantFirstName"
                      value={coApplicantFirstName}
                      onChange={(e) => setCoApplicantFirstName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="coApplicantLastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="coApplicantLastName"
                      value={coApplicantLastName}
                      onChange={(e) => setCoApplicantLastName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                      required
                    />
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={generateSignature}
                  className="w-full py-3 bg-primary text-white rounded-md hover:bg-primary-dark transition"
                  disabled={!coApplicantFirstName || !coApplicantLastName}
                >
                  Click here to sign
                </button>
                
                <p className="mt-3 text-center text-sm text-gray-500">- OR -</p>
                <button 
                  type="button" 
                  onClick={() => setShowTextSignature(false)}
                  className="w-full mt-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
                >
                  Draw my signature manually
                </button>
              </div>
            ) : (
              <div className="border border-gray-300 rounded p-2 mb-2">
                <SignatureCanvas
                  ref={(ref) => setSigPad(ref)}
                  canvasProps={{
                    className: 'w-full h-40 bg-white',
                  }}
                  onEnd={handleSigPadEnd}
                />
                <div className="flex justify-between mt-2">
                  <p className="text-sm text-gray-500">Sign above using your mouse or touch screen</p>
                  <button
                    type="button"
                    onClick={() => setShowTextSignature(true)}
                    className="text-sm text-primary hover:underline"
                  >
                    Back to text signature
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          className="btn-secondary"
          onClick={onBack}
        >
          Back
        </button>
        
        <div>
          {includeCoApplicant ? (
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              className="btn-primary"
              onClick={handleSkip}
            >
              Skip Co-Applicant
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
