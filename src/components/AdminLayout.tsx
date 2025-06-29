'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import AuthCheck from './AuthCheck';
import SessionManager from './SessionManager';

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<{
    id?: string;
    email?: string;
    role?: string;
    permissions?: {
      viewApplications: boolean;
      manageAdmins: boolean;
      manageSmtp: boolean;
      manageRecipients: boolean;
    }
  } | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  
  // Fetch user data and permissions
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/verify', {
          method: 'GET',
          credentials: 'include',
        });
        
        const data = await response.json();
        
        if (response.ok && data.authenticated) {
          setUserData(data.user);
            // Check if user is super admin (directly checking for papy@hempire-enterprise.com)
          const superAdminEmail = 'papy@hempire-enterprise.com';
          const isSuper = data.user.email === superAdminEmail;
          console.log('Checking super admin status:', data.user.email, 'Is super admin:', isSuper);
          
          setIsSuperAdmin(isSuper);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    fetchUserData();
  }, []);
  
  // Handle logout
  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout');
      router.push('/admin');
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Determine the required permission based on pathname
  const getRequiredPermission = () => {
    if (pathname.startsWith('/admin/manage-admins')) {
      return 'manageAdmins' as const;
    } else if (pathname.startsWith('/admin/smtp-config')) {
      return 'manageSmtp' as const;
    } else if (pathname.startsWith('/admin/email-settings')) {
      return 'manageRecipients' as const;
    } else if (pathname.startsWith('/admin/dashboard') || pathname.startsWith('/admin/applications')) {
      return 'viewApplications' as const;
    }
    return undefined;
  };
  return (
    <AuthCheck requiredPermission={getRequiredPermission()}>
      <div className="min-h-screen bg-gray-50">
        {/* Admin Navbar */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Left side - Brand/Title */}
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <h1 className="text-xl font-bold text-gray-900">EMPIRE ENTREPRISE</h1>
                  <p className="text-xs text-gray-500">Admin Dashboard</p>
                </div>
              </div>

              {/* Right side - User info and logout */}
              {userData && (
                <div className="flex items-center space-x-4">
                  {/* User info */}
                  <div className="hidden md:flex flex-col text-right">
                    <span className="text-sm font-medium text-gray-700">{userData.email}</span>
                    <span className="text-xs text-gray-500 capitalize">{userData.role}</span>
                  </div>
                  
                  {/* User avatar */}
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                    <span className="text-sm font-medium text-blue-600">
                      {userData.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  {/* Logout button */}
                  <button
                    onClick={handleLogout}
                    disabled={isLoading}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    title="Logout"
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="hidden sm:inline">
                      {isLoading ? 'Logging out...' : 'Logout'}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Main content area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <aside className="lg:w-64 flex-shrink-0">
              <nav className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900">Navigation</h3>
                </div>
                <ul className="space-y-1 p-2">
                {/* Applications - Available to all users with viewApplications permission */}
                {(!userData?.permissions || userData.permissions.viewApplications) && (
                  <li>
                    <Link
                      href="/admin/dashboard"
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        pathname === '/admin/dashboard' 
                          ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500' 
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z" />
                      </svg>
                      Applications
                    </Link>
                  </li>
                )}
                
                {/* Email Recipients - Only for users with manageRecipients permission */}
                {userData?.permissions?.manageRecipients && (
                  <li>
                    <Link
                      href="/admin/email-settings"
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        pathname === '/admin/email-settings' 
                          ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500' 
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Email Recipients
                    </Link>
                  </li>
                )}
                
                {/* SMTP Configuration - Only for users with manageSmtp permission */}
                {userData?.permissions?.manageSmtp && (
                  <li>
                    <Link
                      href="/admin/smtp-config"
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        pathname === '/admin/smtp-config' 
                          ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500' 
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      SMTP Configuration
                    </Link>
                  </li>
                )}

                {/* Manage Admins - Only for users with manageAdmins permission */}
                {userData?.permissions?.manageAdmins && (
                  <li>
                    <Link
                      href="/admin/manage-admins"
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        pathname === '/admin/manage-admins' 
                          ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500' 
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                      Manage Admins
                    </Link>
                  </li>
                )}                
                {/* Maps - Only for super admin */}
                {isSuperAdmin && (
                  <>
                    <li>
                      <Link
                        href="/admin/maps"
                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          pathname === '/admin/maps' 
                            ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500' 
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        Maps
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/admin/leads"
                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          pathname === '/admin/leads' 
                            ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500' 
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Leads
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/admin/chat-analytics"
                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          pathname === '/admin/chat-analytics' 
                            ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500' 
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Chat Analytics
                      </Link>
                    </li>
                  </>
                )}
                </ul>
              </nav>
            </aside>

            {/* Main content */}
            <main className="flex-1 min-w-0">
              <div className="bg-white shadow-sm rounded-lg p-6">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
      {/* Add session timeout manager */}
      <SessionManager user={userData} />
    </AuthCheck>
  );
}
