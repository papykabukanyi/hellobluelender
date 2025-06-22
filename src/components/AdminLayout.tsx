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
  const [isLoading, setIsLoading] = useState(false);  const [userData, setUserData] = useState<{
    id?: string;
    email?: string;
    role?: string;
    permissions?: {
      viewApplications: boolean;
      manageAdmins: boolean;
      manageSmtp: boolean;
      manageRecipients: boolean;
    }
  } | null>(null);  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  
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
          
          // Fetch SMTP user to check if current user is super admin
          try {
            const smtpRes = await fetch('/api/admin/smtp-user');
            if (smtpRes.ok) {
              const { smtpUser } = await smtpRes.json();
              setIsSuperAdmin(data.user.email === smtpUser);
            }
          } catch (smtpError) {
            console.error('Error checking super admin status:', smtpError);
          }
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
      <div className="min-h-screen bg-gray-100">
        <div className="bg-primary text-white">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/admin/dashboard" className="text-xl font-bold">
                  <span className="font-permanentMarker">Hempire Enterprise</span> Admin
                </Link>
              </div>
              <div className="flex items-center space-x-3">
                {userData && (
                  <span className="text-sm text-white/80">
                    {userData.email} ({userData.role})
                  </span>
                )}
                <button
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="px-3 py-1 text-sm bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition"
                >
                  {isLoading ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            </div>
          </div>
        </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row">
          <aside className="w-full md:w-64 mb-6 md:mb-0">
            <nav className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-4 font-medium text-gray-700 border-b">
                Admin Dashboard
              </div>
              <ul>
                {/* Applications - Available to all users with viewApplications permission */}
                {(!userData?.permissions || userData.permissions.viewApplications) && (
                  <li>
                    <Link
                      href="/admin/dashboard"
                      className={`block px-4 py-3 hover:bg-gray-50 ${
                        pathname === '/admin/dashboard' ? 'bg-blue-50 text-primary border-l-4 border-primary' : ''
                      }`}
                    >
                      Applications
                    </Link>
                  </li>
                )}
                
                {/* Email Recipients - Only for users with manageRecipients permission */}
                {userData?.permissions?.manageRecipients && (
                  <li>
                    <Link
                      href="/admin/email-settings"
                      className={`block px-4 py-3 hover:bg-gray-50 ${
                        pathname === '/admin/email-settings' ? 'bg-blue-50 text-primary border-l-4 border-primary' : ''
                      }`}
                    >
                      Email Recipients
                    </Link>
                  </li>
                )}
                
                {/* SMTP Configuration - Only for users with manageSmtp permission */}
                {userData?.permissions?.manageSmtp && (
                  <li>
                    <Link
                      href="/admin/smtp-config"
                      className={`block px-4 py-3 hover:bg-gray-50 ${
                        pathname === '/admin/smtp-config' ? 'bg-blue-50 text-primary border-l-4 border-primary' : ''
                      }`}
                    >
                      SMTP Configuration
                    </Link>
                  </li>
                )}
                  {/* Manage Admins - Only for users with manageAdmins permission */}
                {userData?.permissions?.manageAdmins && (
                  <li>
                    <Link
                      href="/admin/manage-admins"
                      className={`block px-4 py-3 hover:bg-gray-50 ${
                        pathname === '/admin/manage-admins' ? 'bg-blue-50 text-primary border-l-4 border-primary' : ''
                      }`}
                    >
                      Manage Admins
                    </Link>
                  </li>
                )}                {/* Maps - Only for super admin */}
                {isSuperAdmin && (
                  <>
                    <li>
                      <Link
                        href="/admin/maps"
                        className={`block px-4 py-3 hover:bg-gray-50 ${
                          pathname === '/admin/maps' ? 'bg-blue-50 text-primary border-l-4 border-primary' : ''
                        }`}
                      >
                        Maps
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/admin/leads"
                        className={`block px-4 py-3 hover:bg-gray-50 ${
                          pathname === '/admin/leads' ? 'bg-blue-50 text-primary border-l-4 border-primary' : ''
                        }`}
                      >
                        Leads
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </nav>
          </aside>

          <main className="flex-1 md:ml-6">
            <div className="bg-white shadow rounded-lg p-6">{children}</div>
          </main>
        </div>      </div>    </div>
      {/* Add session timeout manager */}
      <SessionManager user={userData} />
    </AuthCheck>
  );
}
