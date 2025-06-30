'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { LoanInfo, LoanType } from '@/types';

type LoanInfoFormProps = {
  onNext: (data: { loanInfo: any }) => void;
  onBack: () => void;
  formData?: any;
  loanType: LoanType;
};

export default function LoanInfoForm({ onNext, onBack, formData = {}, loanType = 'Business' }: LoanInfoFormProps) {
  // Form state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [currentType, setCurrentType] = useState<LoanType>(loanType);
  
  // Initialize form with default values
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm({
    defaultValues: { ...formData, loanType },
  });

  // Watch the loan type to conditionally render fields
  const watchLoanType = watch('loanType');
  
  // Update component state when loan type changes
  useEffect(() => {
    setCurrentType(watchLoanType || loanType);
  }, [watchLoanType, loanType]);
  
  // Reset form with initial values when component mounts
  useEffect(() => {
    reset({ ...formData, loanType });
  }, [reset, formData, loanType]);

  // Form validation
  const validateForm = (data: any) => {
    const errors: Record<string, string> = {};
    
    // Common validations
    if (!data.loanAmount || isNaN(data.loanAmount) || data.loanAmount <= 0) {
      errors.loanAmount = 'Please enter a valid loan amount greater than 0';
    }
    
    // Equipment loan specific validation
    if (data.loanType === 'Equipment') {
      if (!data.equipmentType || data.equipmentType.trim() === '') {
        errors.equipmentType = 'Equipment type is required';
      }
      
      if (!data.equipmentCost || isNaN(data.equipmentCost) || data.equipmentCost <= 0) {
        errors.equipmentCost = 'Please enter a valid equipment cost greater than 0';
      }
      
      if (!data.loanPurpose || data.loanPurpose.trim() === '') {
        errors.loanPurpose = 'Please describe the loan purpose';
      }
    } 
    
    // Business loan specific validation
    if (data.loanType === 'Business') {
      if (!data.monthlyRevenue || isNaN(data.monthlyRevenue) || data.monthlyRevenue < 0) {
        errors.monthlyRevenue = 'Please enter valid monthly revenue';
      }
      
      if (!data.timeInBusiness || isNaN(data.timeInBusiness) || data.timeInBusiness < 0) {
        errors.timeInBusiness = 'Please enter valid time in business';
      }
      
      if (!data.useOfFunds || data.useOfFunds.trim() === '') {
        errors.useOfFunds = 'Please describe how you will use the funds';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const onSubmit = (data: any) => {
    if (validateForm(data)) {
      // Ensure loanPurpose is always set for consistent display in ReviewForm
      if (data.loanType === 'Business' && data.useOfFunds && !data.loanPurpose) {
        data.loanPurpose = data.useOfFunds;
      }
      onNext({ loanInfo: data });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="loanType" className="block text-sm font-medium text-gray-700 mb-1">
            Loan Type *
          </label>
          <select
            id="loanType"
            className={`form-input ${formErrors.loanType ? 'border-red-500' : ''}`}
            {...register('loanType')}
          >
            <option value="Business">Business Financing</option>
            <option value="Equipment">Equipment Financing</option>
          </select>
          {formErrors.loanType && (
            <p className="mt-1 text-sm text-red-500">{formErrors.loanType}</p>
          )}
        </div>

        <div>
          <label htmlFor="loanAmount" className="block text-sm font-medium text-gray-700 mb-1">
            Loan Amount ($) *
          </label>
          <input
            type="number"
            id="loanAmount"
            className={`form-input ${formErrors.loanAmount ? 'border-red-500' : ''}`}
            min="1000"
            step="1000"
            {...register('loanAmount')}
          />
          {formErrors.loanAmount && (
            <p className="mt-1 text-sm text-red-500">{formErrors.loanAmount}</p>
          )}
        </div>

        {watchLoanType === 'Equipment' && (
          <>
            <div>
              <label htmlFor="equipmentType" className="block text-sm font-medium text-gray-700 mb-1">
                Equipment Type *
              </label>
              <input
                type="text"
                id="equipmentType"
                className={`form-input ${formErrors.equipmentType ? 'border-red-500' : ''}`}
                {...register('equipmentType')}
              />
              {formErrors.equipmentType && (
                <p className="mt-1 text-sm text-red-500">{formErrors.equipmentType}</p>
              )}
            </div>

            <div>
              <label htmlFor="equipmentCost" className="block text-sm font-medium text-gray-700 mb-1">
                Equipment Cost ($) *
              </label>
              <input
                type="number"
                id="equipmentCost"
                className={`form-input ${formErrors.equipmentCost ? 'border-red-500' : ''}`}
                min="0"
                {...register('equipmentCost')}
              />
              {formErrors.equipmentCost && (
                <p className="mt-1 text-sm text-red-500">{formErrors.equipmentCost}</p>
              )}
            </div>

            <div>
              <label htmlFor="equipmentVendor" className="block text-sm font-medium text-gray-700 mb-1">
                Equipment Vendor
              </label>
              <input
                type="text"
                id="equipmentVendor"
                className="form-input"
                {...register('equipmentVendor')}
              />
            </div>

            <div>
              <label htmlFor="downPayment" className="block text-sm font-medium text-gray-700 mb-1">
                Down Payment ($)
              </label>
              <input
                type="number"
                id="downPayment"
                className="form-input"
                min="0"
                {...register('downPayment')}
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="loanPurpose" className="block text-sm font-medium text-gray-700 mb-1">
                Loan Purpose *
              </label>
              <textarea
                id="loanPurpose"
                rows={3}
                className={`form-input ${formErrors.loanPurpose ? 'border-red-500' : ''}`}
                {...register('loanPurpose')}
              ></textarea>
              {formErrors.loanPurpose && (
                <p className="mt-1 text-sm text-red-500">{formErrors.loanPurpose}</p>
              )}
            </div>
          </>
        )}

        {watchLoanType === 'Business' && (
          <>
            <div>
              <label htmlFor="monthlyRevenue" className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Revenue ($) *
              </label>
              <input
                type="number"
                id="monthlyRevenue"
                className={`form-input ${formErrors.monthlyRevenue ? 'border-red-500' : ''}`}
                min="0"
                {...register('monthlyRevenue')}
              />
              {formErrors.monthlyRevenue && (
                <p className="mt-1 text-sm text-red-500">{formErrors.monthlyRevenue}</p>
              )}
            </div>

            <div>
              <label htmlFor="timeInBusiness" className="block text-sm font-medium text-gray-700 mb-1">
                Time in Business (years) *
              </label>
              <input
                type="number"
                id="timeInBusiness"
                className={`form-input ${formErrors.timeInBusiness ? 'border-red-500' : ''}`}
                min="0"
                step="0.5"
                {...register('timeInBusiness')}
              />
              {formErrors.timeInBusiness && (
                <p className="mt-1 text-sm text-red-500">{formErrors.timeInBusiness}</p>
              )}
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="useOfFunds" className="block text-sm font-medium text-gray-700 mb-1">
                Use of Funds *
              </label>
              <textarea
                id="useOfFunds"
                rows={3}
                className={`form-input ${formErrors.useOfFunds ? 'border-red-500' : ''}`}
                {...register('useOfFunds')}
              ></textarea>
              {formErrors.useOfFunds && (
                <p className="mt-1 text-sm text-red-500">{formErrors.useOfFunds}</p>
              )}
            </div>
          </>
        )}
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
        >
          Next
        </button>
      </div>
    </form>
  );
}
