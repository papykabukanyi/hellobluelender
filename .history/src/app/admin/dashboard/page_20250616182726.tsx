'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { LoanApplication } from '@/types';
import Link from 'next/link';

export default function AdminDashboard() {
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
  });

  // Fetch applications on component mount
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch('/api/admin/applications');
        const data = await response.json();
        
        if (data.success) {
          const apps = data.applications || [];
          setApplications(apps);
          
          // Calculate stats
          setStats({
            total: apps.length,
            pending: apps.filter((app: LoanApplication) => app.status === 'in-review' || app.status === 'submitted').length,
            approved: apps.filter((app: LoanApplication) => app.status === 'approved').length,
          });
        } else {
          setError('Failed to load applications');
        }
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError('An error occurred while fetching applications');
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, []);

  // Format date string
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format currency
  const formatCurrency = (amount?: number) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Applications</h3>
            <span className="text-2xl font-bold text-primary">{stats.total}</span>
          </div>
          <p className="text-sm text-gray-600">Total applications</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Pending Review</h3>
            <span className="text-2xl font-bold text-yellow-500">{stats.pending}</span>
          </div>
          <p className="text-sm text-gray-600">Awaiting document verification</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Approved</h3>
            <span className="text-2xl font-bold text-green-500">{stats.approved}</span>
          </div>
          <p className="text-sm text-gray-600">Ready for processing</p>
        </div>
      </div>
      
      {/* Recent Applications */}
      <div className="bg-white rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold p-4 border-b">Recent Applications</h3>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-600">Loading applications...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : applications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No applications found. Applications will appear here when they are submitted.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Applicant</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Loan Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.slice(0, 5).map((app) => (
                  <tr key={app.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm">{app.id?.substring(0, 8)}</td>
                    <td className="py-3 px-4">
                      {app.personalInfo?.firstName} {app.personalInfo?.lastName}
                    </td>
                    <td className="py-3 px-4">{app.loanInfo?.loanType}</td>
                    <td className="py-3 px-4">{formatCurrency(app.loanInfo?.loanAmount)}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded ${
                        app.status === 'approved' ? 'bg-green-100 text-green-800' : 
                        app.status === 'denied' ? 'bg-red-100 text-red-800' : 
                        app.status === 'in-review' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {app.status === 'in-review' ? 'In Review' : 
                         app.status === 'submitted' ? 'New' :
                         app.status?.charAt(0).toUpperCase() + app.status?.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">{formatDate(app.createdAt)}</td>
                    <td className="py-3 px-4">
                      <button className="text-primary hover:underline text-sm">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="p-4 text-right">
          <Link href="/admin/applications" className="text-primary text-sm hover:underline">
            View All Applications
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
}
