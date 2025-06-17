import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Blue Lender',
  description: 'Blue Lender administration dashboard',
  robots: 'noindex, nofollow',
};

export default function AdminDashboard() {
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
              className="block py-2 px-4 rounded bg-white bg-opacity-10 text-white">
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
            <h2 className="text-2xl font-bold">Dashboard</h2>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Applications</h3>
                <span className="text-2xl font-bold text-primary">12</span>
              </div>
              <p className="text-sm text-gray-600">3 new applications today</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Pending Review</h3>
                <span className="text-2xl font-bold text-yellow-500">5</span>
              </div>
              <p className="text-sm text-gray-600">Awaiting document verification</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Approved</h3>
                <span className="text-2xl font-bold text-green-500">7</span>
              </div>
              <p className="text-sm text-gray-600">2 approved this week</p>
            </div>
          </div>
          
          {/* Recent Applications */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <h3 className="text-lg font-semibold mb-4">Recent Applications</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-sm">ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Applicant</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Loan Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">APP-1234</td>
                    <td className="py-3 px-4">John Smith</td>
                    <td className="py-3 px-4">Business</td>
                    <td className="py-3 px-4">$50,000</td>
                    <td className="py-3 px-4">
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">In Review</span>
                    </td>
                    <td className="py-3 px-4">June 15, 2025</td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">APP-1233</td>
                    <td className="py-3 px-4">Sarah Johnson</td>
                    <td className="py-3 px-4">Equipment</td>
                    <td className="py-3 px-4">$75,000</td>
                    <td className="py-3 px-4">
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Approved</span>
                    </td>
                    <td className="py-3 px-4">June 14, 2025</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4">APP-1232</td>
                    <td className="py-3 px-4">Michael Brown</td>
                    <td className="py-3 px-4">Business</td>
                    <td className="py-3 px-4">$25,000</td>
                    <td className="py-3 px-4">
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Incomplete</span>
                    </td>
                    <td className="py-3 px-4">June 12, 2025</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-right">
              <Link href="/admin/applications" className="text-primary text-sm hover:underline">
                View All Applications
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
