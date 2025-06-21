'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ApplicationSuccessClient() {
  const searchParams = useSearchParams();
  const [applicationId, setApplicationId] = useState<string>('');
  
  useEffect(() => {
    // Get the application ID from URL search params
    const idParam = searchParams.get('id');
    setApplicationId(idParam || '');
  }, [searchParams]);
  
  if (!applicationId) {
    return null;
  }
  
  return (
    <p className="text-gray-700 font-medium mb-6">
      Application Reference: <span className="bg-gray-100 px-2 py-1 rounded">{applicationId}</span>
    </p>
  );
}
