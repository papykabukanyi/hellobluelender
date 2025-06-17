'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthCheckProps {
  children: React.ReactNode;
}

export default function AuthCheck({ children }: AuthCheckProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();
  useEffect(() => {
    // Check if we have a token in cookies
    const checkAuth = async () => {
      try {
        console.log('Checking authentication...');
        // Make a request to verify token
        const response = await fetch('/api/auth/verify', {
          method: 'GET',
          credentials: 'include', // Include cookies in the request
        });
        
        const data = await response.json();
        console.log('Auth verification response:', data);
        
        if (response.ok && data.authenticated) {
          console.log('Auth verified successfully');
          setIsAuthenticated(true);
        } else {
          console.log('Auth verification failed, redirecting to login');
          // Redirect to login if token is invalid
          setTimeout(() => {
            window.location.href = '/admin';
          }, 100);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // Redirect to login if request fails
        setTimeout(() => {
          window.location.href = '/admin';
        }, 100);
      }
    };

    checkAuth();
  }, []);

  // Show loading while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner-border text-primary mb-4" role="status"></div>
          <p>Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Show content if authenticated
  return <>{children}</>;
}
