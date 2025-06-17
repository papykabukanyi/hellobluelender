'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PersonalInfo } from '@/types';

// Validation schema for personal information
const personalInfoSchema = z.object({
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
});

type PersonalInfoFormProps = {
  onNext: (data: { personalInfo: PersonalInfo }) => void;
  formData?: Partial<PersonalInfo>;
};

export default function PersonalInfoForm({ onNext, formData = {} }: PersonalInfoFormProps) {
  // Initialize form with validation schema and default values
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PersonalInfo>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: formData,
  });

  // Handle form submission
  const onSubmit = (data: PersonalInfo) => {
    onNext({ personalInfo: data });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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

        <div>          <label htmlFor="ssn" className="block text-sm font-medium text-gray-700 mb-1">
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

      <div className="mt-8 flex justify-end">
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
