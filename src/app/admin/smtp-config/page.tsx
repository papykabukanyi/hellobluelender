'use client';

import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';

export default function SMTPConfig() {
  return (
    <AdminLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold">SMTP Configuration</h2>
        <p className="text-gray-600">
          SMTP settings are configured through environment variables (.env.local)
        </p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <div className="bg-primary-light border-l-4 border-primary p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-primary-dark">
                <strong>Important:</strong> SMTP settings are now managed exclusively via the server's environment variables (.env.local) for enhanced security.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Email Configuration</h3>
          <p className="mb-3">
            The system uses the following settings from the .env.local file:
          </p>
          <ul className="list-disc ml-6 mb-4 space-y-2">
            <li><strong>SMTP_HOST</strong>: The email server hostname (e.g., smtp.gmail.com)</li>
            <li><strong>SMTP_PORT</strong>: The email server port (e.g., 587)</li>
            <li><strong>SMTP_USER</strong>: The email account username</li>
            <li><strong>SMTP_PASS</strong>: The email account password</li>
            <li><strong>SMTP_FROM</strong>: The email address used in the "From" field</li>
            <li><strong>SMTP_FROM_NAME</strong>: The name displayed in the "From" field</li>
          </ul>
        </div>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Note:</strong> SMTP settings can only be modified by updating the environment variables on the server.
                This approach enhances security by keeping sensitive credentials out of the application's database.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
