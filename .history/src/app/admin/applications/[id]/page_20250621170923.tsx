'use client';

import { useState, useEffect } from 'react';
import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { LoanApplication } from '@/types';
import { useRouter } from 'next/navigation';

export default function ApplicationDetails({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const applicationId = resolvedParams.id;
  
  const [application, setApplication] = useState<LoanApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const router = useRouter();
  
  // Check if the current user is a super admin
  useEffect(() => {
    const checkSuperAdmin = async () => {
      try {
        // Get the SMTP user email from the environment
        const smtpUser = process.env.NEXT_PUBLIC_SMTP_USER || '';
        
        // Get the current user's info
        const response = await fetch('/api/admin/profile');
        const data = await response.json();
        
        if (data.success && data.admin) {
          setIsSuperAdmin(data.admin.email === smtpUser);
        }
      } catch (err) {
        console.error('Error checking super admin status:', err);
      }
    };
    
    checkSuperAdmin();
  }, []);
  
  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/applications?id=${applicationId}`);
        const data = await response.json();
        
        if (data.success) {
          setApplication(data.application);
        } else {
          setError('Failed to load application details');
        }
      } catch (err) {
        console.error('Error fetching application details:', err);
        setError('An error occurred while loading the application');
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplication();
  }, [applicationId]);

  // Format date string
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format currency
  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Application Details</h2>
        <button 
          onClick={() => router.back()} 
          className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Back to Applications
        </button>
      </div>
      
      {loading ? (
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-2 text-gray-600">Loading application details...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-red-500">{error}</div>
      ) : !application ? (
        <div className="p-8 text-center text-gray-500">
          Application not found.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Application Overview */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">Application Overview</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Application ID</p>
                <p className="font-medium">{application.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p>
                  <span className={`text-xs px-2 py-1 rounded ${
                    application.status === 'approved' ? 'bg-green-100 text-green-800' : 
                    application.status === 'denied' ? 'bg-red-100 text-red-800' : 
                    application.status === 'in-review' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {application.status === 'in-review' ? 'In Review' : 
                     application.status === 'submitted' ? 'New' :
                     application.status ? (application.status.charAt(0).toUpperCase() + application.status.slice(1)) : 'Unknown'}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Submitted On</p>
                <p>{formatDate(application.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p>{formatDate(application.updatedAt)}</p>
              </div>
            </div>
          </div>
          
          {/* Loan Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">Loan Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Loan Type</p>
                <p className="font-medium">{application.loanInfo?.loanType || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Amount Requested</p>
                <p className="font-medium">{formatCurrency(application.loanInfo?.loanAmount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Loan Purpose</p>
                <p>{application.loanInfo?.loanPurpose || 'N/A'}</p>
              </div>
              
              {application.loanInfo?.loanType === 'Equipment' && (
                <>
                  <div>
                    <p className="text-sm text-gray-500">Equipment Type</p>
                    <p>{(application.loanInfo as any)?.equipmentType || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Equipment Cost</p>
                    <p>{formatCurrency((application.loanInfo as any)?.equipmentCost)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Equipment Vendor</p>
                    <p>{(application.loanInfo as any)?.equipmentVendor || 'N/A'}</p>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">Applicant Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">{application.personalInfo?.firstName} {application.personalInfo?.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p>{application.personalInfo?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p>{application.personalInfo?.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p>{application.personalInfo?.address || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">City/State/ZIP</p>
                <p>{application.personalInfo?.city || 'N/A'}, {application.personalInfo?.state || 'N/A'} {application.personalInfo?.zipCode || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p>{application.personalInfo?.dateOfBirth || 'N/A'}</p>
              </div>
            </div>
          </div>
          
          {/* Business Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">Business Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Business Name</p>
                <p className="font-medium">{application.businessInfo?.businessName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Business Type</p>
                <p>{application.businessInfo?.businessType || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tax ID</p>
                <p>{application.businessInfo?.taxId || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Years in Business</p>
                <p>{application.businessInfo?.yearsInBusiness || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Annual Revenue</p>
                <p>{formatCurrency(application.businessInfo?.annualRevenue)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Business Address</p>
                <p>{application.businessInfo?.businessAddress || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">City/State/ZIP</p>
                <p>{application.businessInfo?.businessCity || 'N/A'}, {application.businessInfo?.businessState || 'N/A'} {application.businessInfo?.businessZipCode || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Business Phone</p>
                <p>{application.businessInfo?.businessPhone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Business Email</p>
                <p>{application.businessInfo?.businessEmail || 'N/A'}</p>
              </div>
            </div>
          </div>
          
          {/* Co-Applicant Information */}
          {application.coApplicantInfo && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 border-b pb-2">Co-Applicant Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{application.coApplicantInfo?.firstName} {application.coApplicantInfo?.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Relationship</p>
                  <p>{application.coApplicantInfo?.relationshipToBusiness || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p>{application.coApplicantInfo?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p>{application.coApplicantInfo?.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p>{application.coApplicantInfo?.address || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">City/State/ZIP</p>
                  <p>{application.coApplicantInfo?.city || 'N/A'}, {application.coApplicantInfo?.state || 'N/A'} {application.coApplicantInfo?.zipCode || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}          {/* Signatures Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">Signatures</h3>
            
            {application.signature ? (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Primary Applicant Signature</p>
                <div className="border p-4 rounded-md">
                  <img 
                    src={application.signature} 
                    alt="Primary applicant signature" 
                    className="max-h-24"
                    onError={(e) => {
                      console.error('Error loading signature image');
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement?.insertAdjacentHTML(
                        'beforeend', 
                        '<p class="text-red-500">Error loading signature image. The signature data may be corrupted.</p>'
                      );
                    }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-yellow-600 mb-4">No primary applicant signature provided</p>
            )}
              {application.coApplicantSignature && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Co-Applicant Signature</p>
                <div className="border p-4 rounded-md">
                  <img 
                    src={application.coApplicantSignature} 
                    alt="Co-applicant signature" 
                    className="max-h-24"
                    onError={(e) => {
                      console.error('Error loading co-applicant signature image');
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement?.insertAdjacentHTML(
                        'beforeend', 
                        '<p class="text-red-500">Error loading co-applicant signature image. The signature data may be corrupted.</p>'
                      );
                    }}
                  />
                </div>
              </div>
            )}
            
            {!application.signature && !application.coApplicantSignature && (
              <p className="text-yellow-600">No signatures available</p>
            )}
          </div>
          
          {/* Actions Section */}          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">Actions</h3>
            
            <div className="flex flex-wrap gap-4">
              <button 
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                onClick={async () => {                  try {
                    const response = await fetch(`/api/admin/applications`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        id: applicationId,
                        status: 'approved',
                        notes: 'Application approved by admin'
                      }),
                    });
                    
                    if (response.ok) {
                      const data = await response.json();
                      if (data.success) {
                        setApplication(data.application);
                        alert('Application approved successfully. An email notification has been sent to the applicant.');
                      }
                    }
                  } catch (err) {
                    console.error('Error updating application status:', err);
                    alert('Failed to update application status');
                  }
                }}
              >
                Approve Application
              </button>
              <button 
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                onClick={async () => {                  try {
                    const response = await fetch(`/api/admin/applications`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        id: applicationId,
                        status: 'denied',
                        notes: 'Application denied by admin'
                      }),
                    });
                    
                    if (response.ok) {
                      const data = await response.json();
                      if (data.success) {
                        setApplication(data.application);
                        alert('Application denied. An email notification has been sent to the applicant.');
                      }
                    }
                  } catch (err) {
                    console.error('Error updating application status:', err);
                    alert('Failed to update application status');
                  }
                }}
              >
                Deny Application
              </button>
              <button 
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                onClick={async () => {                  try {
                    const response = await fetch(`/api/admin/applications`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        id: applicationId,
                        status: 'in-review',
                        notes: 'Application marked for review by admin'
                      }),
                    });
                    
                    if (response.ok) {
                      const data = await response.json();
                      if (data.success) {
                        setApplication(data.application);
                        alert('Application marked as in review. An email notification has been sent to the applicant.');
                      }
                    }
                  } catch (err) {
                    console.error('Error updating application status:', err);
                    alert('Failed to update application status');
                  }
                }}
              >
                Mark as In Review
              </button>
              
              {/* Delete button (super admin only) */}
              {isSuperAdmin && (
                <button 
                  className="px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-900"
                  onClick={async () => {
                    if (confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
                      try {
                        const response = await fetch(`/api/admin/applications`, {
                          method: 'DELETE',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({ id: applicationId }),
                        });
                        
                        if (response.ok) {
                          alert('Application deleted successfully');
                          router.push('/admin/applications');
                        } else {
                          const data = await response.json();
                          alert(data.message || 'Failed to delete application');
                        }
                      } catch (err) {
                        console.error('Error deleting application:', err);
                        alert('An error occurred while deleting the application');
                      }
                    }
                  }}
                >
                  Delete Application
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
