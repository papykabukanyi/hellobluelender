'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface SessionManagerProps {
  user: {
    id?: string;
    email?: string;
    role?: string;
    permissions?: {
      viewApplications: boolean;
      manageAdmins: boolean;
      manageSmtp: boolean;
      manageRecipients: boolean;
    };
  } | null;
}

export default function SessionManager({ user }: SessionManagerProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes left in seconds
  const router = useRouter();
  const lastActivityRef = useRef(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    // Function to refresh the session
  const refreshSession = async () => {
    try {
      // Call the refresh endpoint to get a new token
      const response = await fetch('/api/auth/refresh', {
        method: 'GET',
        credentials: 'include', // Include cookies in request
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh session');
      }
      
      // Update last activity time
      lastActivityRef.current = Date.now();
      
      // Hide warning and reset timer if showing
      if (showWarning) {
        setShowWarning(false);
        setTimeLeft(300);
        
        // Clear the auto-logout timeout if it exists
        if (warningTimeoutRef.current) {
          clearTimeout(warningTimeoutRef.current);
          warningTimeoutRef.current = null;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error refreshing session:', error);
      return false;
    }
  };
  
  const logoutUser = async () => {
    try {
      await fetch('/api/auth/logout');
      router.push('/admin');
    } catch (error) {
      console.error('Error logging out:', error);
      // Force redirect anyway
      router.push('/admin');
    }
  };
    // Check if user is a super admin (based on role and SMTP environment variable)
  // Use a function to determine if the current user is a super admin
  const isSuperAdmin = () => {
    // If in development and not set, we'll use a fallback value
    const smtpUserEmail = process.env.NEXT_PUBLIC_SMTP_USER || '';
    
    // Check if user has admin role and all permissions
    return user?.role === 'admin' && 
           user?.permissions?.manageAdmins === true &&
           user?.permissions?.manageSmtp === true &&
           user?.permissions?.manageRecipients === true &&
           user?.permissions?.viewApplications === true &&
           (user?.email === smtpUserEmail || !smtpUserEmail);
  };
    useEffect(() => {
    if (!user || isSuperAdmin()) return; // Skip for unauthenticated or super admin users
    
    const handleActivity = () => {
      lastActivityRef.current = Date.now();
    };
    
    // Set up activity listeners
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keypress', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);
    
    // Function to check session timeout
    const checkSessionTimeout = () => {
      const now = Date.now();
      const inactiveTime = now - lastActivityRef.current;
      
      // If inactive for 55 minutes (5 minutes before 1 hour), show warning
      if (inactiveTime > 55 * 60 * 1000 && !showWarning) {
        setShowWarning(true);
        setTimeLeft(300); // 5 minutes countdown
        
        // Set timeout to logout after 5 more minutes
        warningTimeoutRef.current = setTimeout(() => {
          logoutUser();
        }, 5 * 60 * 1000);
      }
    };
    
    // Check every minute
    timeoutRef.current = setInterval(checkSessionTimeout, 60 * 1000);
    
    return () => {
      // Clean up
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keypress', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      
      if (timeoutRef.current) clearInterval(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    };
  }, [user, isSuperAdmin, showWarning, router]);
  
  // Countdown timer effect
  useEffect(() => {
    if (showWarning && timeLeft > 0) {
      const countdownTimer = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
      
      return () => clearInterval(countdownTimer);
    }
  }, [showWarning, timeLeft]);
  
  // Format time left as MM:SS
  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  if (!showWarning || !user || isSuperAdmin()) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-yellow-100 p-4 border-t-4 border-yellow-400 flex items-center justify-between z-50">
      <div className="flex-1">
        <p className="font-medium text-yellow-800">Your session is about to expire!</p>
        <p className="text-yellow-700">
          Due to inactivity, you will be logged out in {formatTimeLeft()}.
        </p>
      </div>
      <div className="flex space-x-3">
        <button
          onClick={refreshSession}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-light"
        >
          Stay Logged In
        </button>
        <button
          onClick={logoutUser}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
