'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface AuthCheckProps {
  children: React.ReactNode;
  requiredPermission?: 'viewApplications' | 'manageAdmins' | 'manageSmtp' | 'manageRecipients';
}

export default function AuthCheck({ children, requiredPermission }: AuthCheckProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean>(true);
  const [userData, setUserData] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

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
          setUserData(data.user);
          
          // If a permission is required, check it
          if (requiredPermission && !data.user?.permissions?.[requiredPermission]) {
            console.log(`Permission check failed: ${requiredPermission} required`);
            setHasPermission(false);
            // Redirect to dashboard after a short delay
            setTimeout(() => {
              router.push('/admin/dashboard');
            }, 100);
          }
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
  }, [requiredPermission, router]);

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

  // Show permission denied message
  if (!hasPermission) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-red-100 p-4 rounded-md mb-4">
            <h2 className="text-xl text-red-700 mb-2">Permission Denied</h2>
            <p className="text-red-600">You don't have permission to access this page.</p>
          </div>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Show content if authenticated and has permission
  return <>{children}</>;
}
