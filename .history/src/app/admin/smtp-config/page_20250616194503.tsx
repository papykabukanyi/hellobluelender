'use client';

import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';

export default function SMTPConfig() {
  // SMTP settings are now managed entirely through .env.local
  const smtpInfo = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || '587',
    user: process.env.SMTP_USER || 'configured in .env.local',
    fromEmail: process.env.SMTP_FROM || 'configured in .env.local',
    fromName: process.env.SMTP_FROM_NAME || 'Blue Lender',
  };  return (
    <AdminLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold">SMTP Configuration</h2>
        <p className="text-gray-600">
          SMTP settings are configured through environment variables (.env.local)
        </p>
      </div>
      
      {/* SMTP Info Display */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h3 className="text-lg font-semibold mb-4">Email Server Settings</h3>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">
                SMTP Host
              </h4>
              <p className="form-input bg-gray-50 cursor-not-allowed">{smtpInfo.host}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">
                SMTP Port
              </h4>
              <p className="form-input bg-gray-50 cursor-not-allowed">{smtpInfo.port}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">
                SMTP Username
              </h4>
              <p className="form-input bg-gray-50 cursor-not-allowed">{smtpInfo.user}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">
                SMTP Password
              </h4>
              <p className="form-input bg-gray-50 cursor-not-allowed">••••••••••••</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">
                From Email Address
              </h4>
              <p className="form-input bg-gray-50 cursor-not-allowed">{smtpInfo.fromEmail}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">
                From Name
              </h4>
              <p className="form-input bg-gray-50 cursor-not-allowed">{smtpInfo.fromName}</p>
            </div>
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
                  SMTP settings can only be edited in the server environment variables (.env.local)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
          
          {/* Email Templates */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Email Templates</h3>
            <p className="text-gray-600 mb-6">
              Configure the templates used for different types of email notifications
            </p>
            
            <div className="space-y-4">
              <div className="border border-gray-200 rounded p-4 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Application Submission Confirmation</h4>
                  <button className="text-primary hover:underline">Edit Template</button>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded p-4 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Application Notification for Admin</h4>
                  <button className="text-primary hover:underline">Edit Template</button>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded p-4 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Application Status Update</h4>
                  <button className="text-primary hover:underline">Edit Template</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
