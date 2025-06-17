'use client';

import { useEffect, useState } from 'react';

export default function InitializeApp() {
  const [initialized, setInitialized] = useState(false);
  
  useEffect(() => {
    const initializeAdmin = async () => {
      try {
        const response = await fetch('/api/admin/initialize');
        const data = await response.json();
        
        if (data.success) {
          console.log('Admin data initialized successfully');
        } else {
          console.error('Failed to initialize admin data');
        }
      } catch (error) {
        console.error('Error initializing admin data:', error);
      } finally {
        setInitialized(true);
      }
    };
    
    initializeAdmin();
  }, []);
  
  // This component doesn't render anything visible
  return null;
}
