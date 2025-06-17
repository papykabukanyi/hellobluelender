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
  };
  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="flex">
        {/* Sidebar */}
        <div className="bg-primary text-white w-64 min-h-screen p-4">
          <div className="mb-8">
            <h1 className="text-xl font-bold">Blue Lender Admin</h1>
          </div>
          
          <nav className="space-y-2">
            <Link href="/admin/dashboard" 
              className="block py-2 px-4 rounded hover:bg-white hover:bg-opacity-10 text-white">
              Dashboard
            </Link>
            <Link href="/admin/applications" 
              className="block py-2 px-4 rounded hover:bg-white hover:bg-opacity-10 text-white">
              Applications
            </Link>
            <Link href="/admin/email-settings" 
              className="block py-2 px-4 rounded hover:bg-white hover:bg-opacity-10 text-white">
              Email Settings
            </Link>
            <Link href="/admin/smtp-config" 
              className="block py-2 px-4 rounded bg-white bg-opacity-10 text-white">
              SMTP Configuration
            </Link>
            <Link href="/admin/users" 
              className="block py-2 px-4 rounded hover:bg-white hover:bg-opacity-10 text-white">
              User Management
            </Link>
          </nav>
          
          <div className="mt-auto pt-8">
            <Link href="/admin" 
              className="block py-2 px-4 text-sm text-white hover:underline">
              Logout
            </Link>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold">SMTP Configuration</h2>
            <p className="text-gray-600">
              Configure your SMTP server settings for sending email notifications and application PDFs
            </p>
          </div>
          
          {/* SMTP Config Form */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <h3 className="text-lg font-semibold mb-4">Email Server Settings</h3>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="smtpHost" className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    id="smtpHost"
                    className="form-input"
                    placeholder="smtp.example.com"
                    defaultValue="smtp.gmail.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="smtpPort" className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Port
                  </label>
                  <input
                    type="number"
                    id="smtpPort"
                    className="form-input"
                    placeholder="587"
                    defaultValue="587"
                  />
                </div>
                
                <div>
                  <label htmlFor="smtpUsername" className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Username
                  </label>
                  <input
                    type="text"
                    id="smtpUsername"
                    className="form-input"
                    placeholder="username@example.com"
                    defaultValue="applications@bluelender.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="smtpPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Password
                  </label>
                  <input
                    type="password"
                    id="smtpPassword"
                    className="form-input"
                    placeholder="••••••••••••"
                    defaultValue="••••••••••••"
                  />
                </div>
                
                <div>
                  <label htmlFor="fromEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    From Email Address
                  </label>
                  <input
                    type="email"
                    id="fromEmail"
                    className="form-input"
                    placeholder="noreply@example.com"
                    defaultValue="applications@bluelender.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="fromName" className="block text-sm font-medium text-gray-700 mb-1">
                    From Name
                  </label>
                  <input
                    type="text"
                    id="fromName"
                    className="form-input"
                    placeholder="Company Name"
                    defaultValue="Blue Lender Applications"
                  />
                </div>
              </div>
              
              <div className="flex items-center mb-6">
                <input
                  type="checkbox"
                  id="secureConnection"
                  className="h-4 w-4 text-primary border-gray-300 rounded"
                  defaultChecked
                />
                <label htmlFor="secureConnection" className="ml-2 block text-sm text-gray-700">
                  Use secure connection (SSL/TLS)
                </label>
              </div>
              
              <div className="flex justify-between">
                <button type="button" className="btn-outline">
                  Test Connection
                </button>
                <button type="submit" className="btn-primary">
                  Save Settings
                </button>
              </div>
            </form>
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
