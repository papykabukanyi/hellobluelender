'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LoanInfo, LoanType, EquipmentLoanInfo, BusinessLoanInfo } from '@/types';

// Base loan info schema
const baseLoanInfoSchema = z.object({
  loanType: z.enum(['Business', 'Equipment']),
  loanAmount: z.coerce.number().positive('Loan amount must be greater than 0'),
  loanPurpose: z.string().min(1, 'Loan purpose is required'),
});

// Equipment loan specific schema
const equipmentLoanSchema = baseLoanInfoSchema.extend({
  equipmentType: z.string().min(1, 'Equipment type is required'),
  equipmentCost: z.coerce.number().positive('Equipment cost must be greater than 0'),
  equipmentVendor: z.string().optional(),
  downPayment: z.coerce.number().optional(),
});

// Business loan specific schema
const businessLoanSchema = baseLoanInfoSchema.extend({
  monthlyRevenue: z.coerce.number().positive('Monthly revenue must be greater than 0'),
  timeInBusiness: z.coerce.number().min(0, 'Time in business must be valid'),
  useOfFunds: z.string().min(1, 'Use of funds is required'),
});

type LoanInfoFormProps = {
  onNext: (data: { loanInfo: LoanInfo | EquipmentLoanInfo | BusinessLoanInfo }) => void;
  onBack: () => void;
  formData?: Partial<LoanInfo | EquipmentLoanInfo | BusinessLoanInfo>;
  loanType: LoanType;
};

export default function LoanInfoForm({ onNext, onBack, formData = {}, loanType = 'Business' }: LoanInfoFormProps) {
  // Determine which schema to use based on loan type
  const getLoanSchema = () => {
    return loanType === 'Equipment' ? equipmentLoanSchema : businessLoanSchema;
  };

  // Initialize form with validation and default values  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset
  } = useForm<any>({
    resolver: zodResolver(getLoanSchema()),
    defaultValues: { ...formData, loanType },
    mode: 'onChange'
  });

  // Watch the loan type to conditionally render fields
  const watchLoanType = watch('loanType');

  // Update loan type when it changes from prop
  useEffect(() => {
    setValue('loanType', loanType);
  }, [loanType, setValue]);

  // Handle form submission
  const onSubmit = (data: any) => {
    onNext({ loanInfo: data });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="loanType" className="block text-sm font-medium text-gray-700 mb-1">
            Loan Type *
          </label>
          <select
            id="loanType"
            className={`form-input ${errors.loanType ? 'border-red-500' : ''}`}
            {...register('loanType')}
          >
            <option value="Business">Business Financing</option>
            <option value="Equipment">Equipment Financing</option>
          </select>
          {errors.loanType && (
            <p className="mt-1 text-sm text-red-500">{errors.loanType.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="loanAmount" className="block text-sm font-medium text-gray-700 mb-1">
            Loan Amount ($) *
          </label>
          <input
            type="number"
            id="loanAmount"
            className={`form-input ${errors.loanAmount ? 'border-red-500' : ''}`}
            min="1000"
            step="1000"
            {...register('loanAmount')}
          />
          {errors.loanAmount && (
            <p className="mt-1 text-sm text-red-500">{errors.loanAmount.message}</p>
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
                className={`form-input ${errors.equipmentType ? 'border-red-500' : ''}`}
                {...register('equipmentType')}
              />
              {errors.equipmentType && (
                <p className="mt-1 text-sm text-red-500">{errors.equipmentType.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="equipmentCost" className="block text-sm font-medium text-gray-700 mb-1">
                Equipment Cost ($) *
              </label>
              <input
                type="number"
                id="equipmentCost"
                className={`form-input ${errors.equipmentCost ? 'border-red-500' : ''}`}
                min="0"
                {...register('equipmentCost')}
              />
              {errors.equipmentCost && (
                <p className="mt-1 text-sm text-red-500">{errors.equipmentCost.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="equipmentVendor" className="block text-sm font-medium text-gray-700 mb-1">
                Equipment Vendor
              </label>
              <input
                type="text"
                id="equipmentVendor"
                className={`form-input ${errors.equipmentVendor ? 'border-red-500' : ''}`}
                {...register('equipmentVendor')}
              />
              {errors.equipmentVendor && (
                <p className="mt-1 text-sm text-red-500">{errors.equipmentVendor.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="downPayment" className="block text-sm font-medium text-gray-700 mb-1">
                Down Payment ($)
              </label>
              <input
                type="number"
                id="downPayment"
                className={`form-input ${errors.downPayment ? 'border-red-500' : ''}`}
                min="0"
                {...register('downPayment')}
              />
              {errors.downPayment && (
                <p className="mt-1 text-sm text-red-500">{errors.downPayment.message}</p>
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
                className={`form-input ${errors.monthlyRevenue ? 'border-red-500' : ''}`}
                min="0"
                {...register('monthlyRevenue')}
              />
              {errors.monthlyRevenue && (
                <p className="mt-1 text-sm text-red-500">{errors.monthlyRevenue.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="timeInBusiness" className="block text-sm font-medium text-gray-700 mb-1">
                Time in Business (years) *
              </label>
              <input
                type="number"
                id="timeInBusiness"
                className={`form-input ${errors.timeInBusiness ? 'border-red-500' : ''}`}
                min="0"
                step="0.5"
                {...register('timeInBusiness')}
              />
              {errors.timeInBusiness && (
                <p className="mt-1 text-sm text-red-500">{errors.timeInBusiness.message}</p>
              )}
            </div>
          </>
        )}

        <div className="md:col-span-2">
          <label htmlFor={watchLoanType === 'Business' ? 'useOfFunds' : 'loanPurpose'} className="block text-sm font-medium text-gray-700 mb-1">
            {watchLoanType === 'Business' ? 'Use of Funds *' : 'Loan Purpose *'}
          </label>
          <textarea
            id={watchLoanType === 'Business' ? 'useOfFunds' : 'loanPurpose'}
            rows={3}
            className={`form-input ${
              watchLoanType === 'Business' 
                ? errors.useOfFunds ? 'border-red-500' : ''
                : errors.loanPurpose ? 'border-red-500' : ''
            }`}
            {...register(watchLoanType === 'Business' ? 'useOfFunds' : 'loanPurpose')}
          ></textarea>
          {watchLoanType === 'Business' ? (
            errors.useOfFunds && (
              <p className="mt-1 text-sm text-red-500">{errors.useOfFunds.message}</p>
            )
          ) : (
            errors.loanPurpose && (
              <p className="mt-1 text-sm text-red-500">{errors.loanPurpose.message}</p>
            )
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
