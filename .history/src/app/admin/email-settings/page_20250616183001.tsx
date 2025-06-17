import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Email Settings | Blue Lender Admin',
  description: 'Manage email recipients for loan applications',
  robots: 'noindex, nofollow',
};

export default function EmailSettings() {
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
              className="block py-2 px-4 rounded bg-white bg-opacity-10 text-white">
              Email Settings
            </Link>
            <Link href="/admin/smtp-config" 
              className="block py-2 px-4 rounded hover:bg-white hover:bg-opacity-10 text-white">
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
            <h2 className="text-2xl font-bold">Email Recipients</h2>
            <p className="text-gray-600">
              Manage email recipients who will receive application notifications and PDF copies
            </p>
          </div>
          
          {/* Add Recipient Form */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <h3 className="text-lg font-semibold mb-4">Add New Recipient</h3>
            <form className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="form-input"
                  placeholder="John Smith"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="form-input"
                  placeholder="john@example.com"
                  required
                />
              </div>
              
              <div className="flex items-end">
                <button type="submit" className="btn-primary h-10">
                  Add Recipient
                </button>
              </div>
            </form>
          </div>
          
          {/* Recipients List */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Current Recipients</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-sm">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Added On</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">John Smith</td>
                    <td className="py-3 px-4">john.smith@bluelender.com</td>
                    <td className="py-3 px-4">
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Active</span>
                    </td>
                    <td className="py-3 px-4">June 1, 2025</td>
                    <td className="py-3 px-4">
                      <button className="text-gray-500 hover:text-primary mr-2">
                        Edit
                      </button>
                      <button className="text-red-500 hover:text-red-700">
                        Disable
                      </button>
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">Sarah Johnson</td>
                    <td className="py-3 px-4">sarah.johnson@bluelender.com</td>
                    <td className="py-3 px-4">
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Active</span>
                    </td>
                    <td className="py-3 px-4">May 15, 2025</td>
                    <td className="py-3 px-4">
                      <button className="text-gray-500 hover:text-primary mr-2">
                        Edit
                      </button>
                      <button className="text-red-500 hover:text-red-700">
                        Disable
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4">Michael Brown</td>
                    <td className="py-3 px-4">michael.brown@bluelender.com</td>
                    <td className="py-3 px-4">
                      <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Inactive</span>
                    </td>
                    <td className="py-3 px-4">April 23, 2025</td>
                    <td className="py-3 px-4">
                      <button className="text-gray-500 hover:text-primary mr-2">
                        Edit
                      </button>
                      <button className="text-green-500 hover:text-green-700">
                        Enable
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
