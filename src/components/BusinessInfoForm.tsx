'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BusinessInfo } from '@/types';

// Validation schema for business information
const businessInfoSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  businessType: z.string().min(1, 'Business type is required'),
  businessAddress: z.string().min(1, 'Business address is required'),
  businessCity: z.string().min(1, 'City is required'),
  businessState: z.string().min(1, 'State is required'),
  businessZipCode: z.string().min(5, 'Please enter a valid zip code'),
  yearsInBusiness: z.coerce.number().min(0, 'Please enter a valid number'),
  annualRevenue: z.coerce.number().min(0, 'Please enter a valid number'),
  taxId: z.string().length(9, 'EIN must be exactly 9 digits (no dashes)'),
  businessPhone: z.string().min(10, 'Please enter a valid phone number'),
  businessEmail: z.string().email('Please enter a valid email address'),
});

type BusinessInfoFormProps = {
  onNext: (data: { businessInfo: BusinessInfo }) => void;
  onBack: () => void;
  formData?: Partial<BusinessInfo>;
};

export default function BusinessInfoForm({ onNext, onBack, formData = {} }: BusinessInfoFormProps) {
  // Initialize form with validation and default values
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BusinessInfo>({
    resolver: zodResolver(businessInfoSchema) as any,
    defaultValues: formData,
  });

  // Business types
  const businessTypes = [
    { value: '', label: 'Select business type' },
    { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
    { value: 'llc', label: 'Limited Liability Company (LLC)' },
    { value: 'corporation', label: 'Corporation' },
    { value: 's_corporation', label: 'S Corporation' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'nonprofit', label: 'Nonprofit' },
    { value: 'other', label: 'Other' },
  ];

  // Handle form submission
  const onSubmit = (data: BusinessInfo) => {
    onNext({ businessInfo: data });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit as any)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="md:col-span-2">
          <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
            Business Name *
          </label>
          <input
            type="text"
            id="businessName"
            className={`form-input ${errors.businessName ? 'border-red-500' : ''}`}
            {...register('businessName')}
          />
          {errors.businessName && (
            <p className="mt-1 text-sm text-red-500">{errors.businessName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-1">
            Business Type *
          </label>
          <select
            id="businessType"
            className={`form-input ${errors.businessType ? 'border-red-500' : ''}`}
            {...register('businessType')}
          >
            {businessTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          {errors.businessType && (
            <p className="mt-1 text-sm text-red-500">{errors.businessType.message}</p>
          )}
        </div>

        <div>          <label htmlFor="taxId" className="block text-sm font-medium text-gray-700 mb-1">
            Tax ID / EIN (9 digits, no dashes) *
          </label>
          <input
            type="password"
            id="taxId"
            className={`form-input ${errors.taxId ? 'border-red-500' : ''}`}
            placeholder="123456789"
            maxLength={9}
            {...register('taxId')}
          />
          {errors.taxId && (
            <p className="mt-1 text-sm text-red-500">{errors.taxId.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700 mb-1">
            Business Address *
          </label>
          <input
            type="text"
            id="businessAddress"
            className={`form-input ${errors.businessAddress ? 'border-red-500' : ''}`}
            {...register('businessAddress')}
          />
          {errors.businessAddress && (
            <p className="mt-1 text-sm text-red-500">{errors.businessAddress.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="businessCity" className="block text-sm font-medium text-gray-700 mb-1">
            City *
          </label>
          <input
            type="text"
            id="businessCity"
            className={`form-input ${errors.businessCity ? 'border-red-500' : ''}`}
            {...register('businessCity')}
          />
          {errors.businessCity && (
            <p className="mt-1 text-sm text-red-500">{errors.businessCity.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="businessState" className="block text-sm font-medium text-gray-700 mb-1">
              State *
            </label>
            <input
              type="text"
              id="businessState"
              className={`form-input ${errors.businessState ? 'border-red-500' : ''}`}
              {...register('businessState')}
            />
            {errors.businessState && (
              <p className="mt-1 text-sm text-red-500">{errors.businessState.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="businessZipCode" className="block text-sm font-medium text-gray-700 mb-1">
              Zip Code *
            </label>
            <input
              type="text"
              id="businessZipCode"
              className={`form-input ${errors.businessZipCode ? 'border-red-500' : ''}`}
              {...register('businessZipCode')}
            />
            {errors.businessZipCode && (
              <p className="mt-1 text-sm text-red-500">{errors.businessZipCode.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="yearsInBusiness" className="block text-sm font-medium text-gray-700 mb-1">
            Years in Business *
          </label>
          <input
            type="number"
            id="yearsInBusiness"
            className={`form-input ${errors.yearsInBusiness ? 'border-red-500' : ''}`}
            min="0"
            step="0.5"
            {...register('yearsInBusiness')}
          />
          {errors.yearsInBusiness && (
            <p className="mt-1 text-sm text-red-500">{errors.yearsInBusiness.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="annualRevenue" className="block text-sm font-medium text-gray-700 mb-1">
            Annual Revenue ($) *
          </label>
          <input
            type="number"
            id="annualRevenue"
            className={`form-input ${errors.annualRevenue ? 'border-red-500' : ''}`}
            min="0"
            {...register('annualRevenue')}
          />
          {errors.annualRevenue && (
            <p className="mt-1 text-sm text-red-500">{errors.annualRevenue.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="businessPhone" className="block text-sm font-medium text-gray-700 mb-1">
            Business Phone *
          </label>
          <input
            type="tel"
            id="businessPhone"
            className={`form-input ${errors.businessPhone ? 'border-red-500' : ''}`}
            {...register('businessPhone')}
          />
          {errors.businessPhone && (
            <p className="mt-1 text-sm text-red-500">{errors.businessPhone.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="businessEmail" className="block text-sm font-medium text-gray-700 mb-1">
            Business Email *
          </label>
          <input
            type="email"
            id="businessEmail"
            className={`form-input ${errors.businessEmail ? 'border-red-500' : ''}`}
            {...register('businessEmail')}
          />
          {errors.businessEmail && (
            <p className="mt-1 text-sm text-red-500">{errors.businessEmail.message}</p>
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
          disabled={isSubmitting}
        >
          Next
        </button>
      </div>
    </form>
  );
}
