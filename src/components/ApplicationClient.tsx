'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LoanType } from '@/types';
import ApplicationForm from '@/components/ApplicationForm';

export default function ApplicationClient() {
  const searchParams = useSearchParams();
  const [loanType, setLoanType] = useState<LoanType>('Business');
  
  useEffect(() => {
    // Get the loan type from URL search params
    const typeParam = searchParams.get('type');
    
    if (typeParam && ['business', 'equipment'].includes(typeParam.toLowerCase())) {
      setLoanType(typeParam.toLowerCase() === 'business' ? 'Business' : 'Equipment');
    }
  }, [searchParams]);
  
  return (
    <div className="container-custom">
      <ApplicationForm initialLoanType={loanType} />
    </div>
  );
}
