'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import AuthCheck from './AuthCheck';

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
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
  return (
    <AuthCheck>
      <div className="min-h-screen bg-gray-100">
        <div className="bg-primary text-white">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/admin/dashboard" className="text-xl font-bold">
                  Blue Lender Admin
                </Link>
              </div>
              <div>
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
              </ul>
            </nav>
          </aside>

          <main className="flex-1 md:ml-6">
            <div className="bg-white shadow rounded-lg p-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
