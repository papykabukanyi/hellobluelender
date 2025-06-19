'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { LoanApplication } from '@/types';
import Link from 'next/link';

export default function AdminApplications() {
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Fetch applications on component mount
  useEffect(() => {
    fetchApplications();
  }, []);

  // Fetch all applications
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/applications');
      const data = await response.json();
      
      if (data.success) {
        setApplications(data.applications || []);
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

  // Filter applications
  const filteredApplications = applications
    .filter(app => 
      filterStatus === 'all' || app.status === filterStatus
    )
    .filter(app => {
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      const businessName = app.businessInfo?.businessName?.toLowerCase() || '';
      const applicantName = (app.personalInfo?.firstName + ' ' + app.personalInfo?.lastName).toLowerCase();
      const appId = app.id?.toLowerCase() || '';
      
      return (
        businessName.includes(searchLower) || 
        applicantName.includes(searchLower) || 
        appId.includes(searchLower)
      );
    });

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">All Applications</h2>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            placeholder="Search by name, business or ID..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="w-full md:w-1/2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Status
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Applications</option>
            <option value="submitted">New</option>
            <option value="in-review">In Review</option>
            <option value="approved">Approved</option>
            <option value="denied">Denied</option>
          </select>
        </div>
      </div>
      
      {/* Applications Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold p-4 border-b">Applications</h3>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-600">Loading applications...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : filteredApplications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No matching applications found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Applicant</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Business</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Loan Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm">{app.id?.substring(0, 8)}</td>
                    <td className="py-3 px-4">
                      {app.personalInfo?.firstName} {app.personalInfo?.lastName}
                    </td>
                    <td className="py-3 px-4">{app.businessInfo?.businessName}</td>
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
                         app.status ? (app.status.charAt(0).toUpperCase() + app.status.slice(1)) : 'Unknown'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">{formatDate(app.createdAt)}</td>
                    <td className="py-3 px-4">
                      <Link href={`/admin/applications/${app.id}`} className="text-primary hover:underline text-sm">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
