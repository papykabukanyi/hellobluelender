'use client';

import { useState, useEffect } from 'react';
import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { LoanApplication } from '@/types';
import { useRouter } from 'next/navigation';

export default function ApplicationDetails({ params }: { params: { id: string } }) {
  const applicationId = params.id;
  
  const [application, setApplication] = useState<LoanApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [documentModal, setDocumentModal] = useState<{
    isOpen: boolean;
    document: any;
    title: string;
  }>({
    isOpen: false,
    document: null,
    title: ''
  });
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

  // Handle document viewing in modal
  const openDocumentModal = (document: any, title: string) => {
    setDocumentModal({
      isOpen: true,
      document,
      title
    });
  };

  const closeDocumentModal = () => {
    setDocumentModal({
      isOpen: false,
      document: null,
      title: ''
    });
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
                    application.status === 'approved' ? 'bg-success-light text-success' : 
                    application.status === 'denied' ? 'bg-red-100 text-red-800' : 
                    application.status === 'in-review' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-primary-light text-primary'
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
              <div>
                <p className="text-sm text-gray-500">SSN</p>
                <p>{application.personalInfo?.ssn || 'N/A'}</p>
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
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p>{application.coApplicantInfo?.dateOfBirth || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">SSN</p>
                  <p>{application.coApplicantInfo?.ssn || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Uploaded Documents Section */}
          {application.documents && Object.keys(application.documents).length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold border-b pb-2">Uploaded Documents</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>{Object.keys(application.documents).length} categories</span>
                </div>
              </div>
              
              <div className="space-y-6">
                {Object.entries(application.documents).map(([docType, files]) => (
                  <div key={docType} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-base font-semibold text-gray-800 flex items-center">
                        <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                        {docType.replace(/([A-Z])/g, ' $1').trim()}
                      </h4>
                      <span className="text-xs bg-primary-light text-primary px-2 py-1 rounded-full">
                        {Array.isArray(files) ? files.length : 0} files
                      </span>
                    </div>
                    
                    {Array.isArray(files) && files.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {files.map((file: any, index: number) => (
                          <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all duration-200 group">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <div className="text-2xl">
                                    {file.type && file.type.includes('pdf') ? '📄' : '🖼️'}
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                      {file.originalName || file.name || `Document ${index + 1}`}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {file.type && file.type.includes('pdf') ? 'PDF Document' : 'Image File'}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                                  <span>
                                    {file.size && `${Math.round(file.size / 1024)} KB`}
                                  </span>
                                  {file.uploadedAt && (
                                    <span>
                                      {formatDate(file.uploadedAt)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              {file.path && (
                                <button
                                  onClick={() => openDocumentModal(file, `${docType} - ${file.originalName || file.name || `Document ${index + 1}`}`)}
                                  className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-medium bg-primary text-white rounded-md hover:bg-primary-dark transition-colors group-hover:scale-105 transform duration-200"
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  Preview
                                </button>
                              )}
                              {file.path && (
                                <a
                                  href={file.path}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center px-3 py-2 text-xs font-medium bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                                  title="Open in new tab"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M8 8l8-8m0 0V8m0-8h8" />
                                  </svg>
                                </a>
                              )}
                              {file.path && (
                                <a
                                  href={file.path}
                                  download={file.originalName || file.name}
                                  className="inline-flex items-center justify-center px-3 py-2 text-xs font-medium bg-success text-white rounded-md hover:bg-success-dark transition-colors"
                                  title="Download file"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-500">No documents uploaded for this category</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Signatures Section */}
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
                className="px-4 py-2 bg-success text-white rounded-md hover:bg-success-dark"
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

          {/* Application Metadata Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2 flex items-center">
              <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Application Metadata
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <svg className="w-4 h-4 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h4 className="text-sm font-semibold text-gray-700">Submission Details</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Application ID:</span>
                    <span className="font-mono text-gray-900">{application.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created:</span>
                    <span className="text-gray-900">{formatDate(application.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Updated:</span>
                    <span className="text-gray-900">{formatDate(application.updatedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Current Status:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      application.status === 'approved' ? 'bg-success-light text-success' : 
                      application.status === 'denied' ? 'bg-red-100 text-red-800' : 
                      application.status === 'in-review' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-primary-light text-primary'
                    }`}>
                      {application.status === 'in-review' ? 'In Review' : 
                       application.status === 'submitted' ? 'New' :
                       application.status ? (application.status.charAt(0).toUpperCase() + application.status.slice(1)) : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <svg className="w-4 h-4 mr-2 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h4 className="text-sm font-semibold text-gray-700">Application Summary</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Loan Type:</span>
                    <span className="font-medium text-gray-900">{application.loanInfo?.loanType || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount:</span>
                    <span className="font-medium text-gray-900">{formatCurrency(application.loanInfo?.loanAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Business:</span>
                    <span className="font-medium text-gray-900 truncate" title={application.businessInfo?.businessName}>
                      {application.businessInfo?.businessName || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Co-Applicant:</span>
                    <span className="text-gray-900">
                      {application.coApplicantInfo ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h4 className="text-sm font-semibold text-gray-700">Documents & Data</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Doc Categories:</span>
                    <span className="text-gray-900">
                      {application.documents ? Object.keys(application.documents).length : 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Files:</span>
                    <span className="text-gray-900">
                      {application.documents ? 
                        Object.values(application.documents).reduce((total, files) => 
                          total + (Array.isArray(files) ? files.length : 0), 0
                        ) : 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Signatures:</span>
                    <span className="text-gray-900">
                      {[application.signature, application.coApplicantSignature].filter(Boolean).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Location Data:</span>
                    <span className="text-gray-900">
                      {application.location ? 'Available' : 'Not Available'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Document Modal */}
          {documentModal.isOpen && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div 
                  className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                  onClick={closeDocumentModal}
                ></div>

                {/* Modal panel */}
                <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full sm:p-6">
                  {/* Modal Header */}
                  <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {documentModal.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {documentModal.document?.originalName || documentModal.document?.name}
                      </p>
                    </div>
                    <button
                      onClick={closeDocumentModal}
                      className="rounded-full p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Document Preview */}
                  <div className="mb-6">
                    {documentModal.document && documentModal.document.path && (
                      <div className="w-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 overflow-hidden">
                        {documentModal.document.type && documentModal.document.type.includes('pdf') ? (
                          <iframe
                            src={`/api/documents/serve?path=${encodeURIComponent(documentModal.document.path)}`}
                            className="w-full h-96 lg:h-[500px] border-0"
                            title={documentModal.title}
                            onError={(e) => {
                              console.error('Failed to load PDF:', e);
                              const iframe = e.target as HTMLIFrameElement;
                              iframe.style.display = 'none';
                              const errorDiv = iframe.nextElementSibling || document.createElement('div');
                              errorDiv.innerHTML = `
                                <div class="flex items-center justify-center p-8 text-gray-500">
                                  <div class="text-center">
                                    <p class="mb-2">Unable to preview PDF document</p>
                                    <a href="/api/documents/serve?path=${encodeURIComponent(documentModal.document.path)}" 
                                       target="_blank" 
                                       class="text-primary hover:text-primary-dark underline">
                                      Open in new tab
                                    </a>
                                  </div>
                                </div>
                              `;
                              if (!iframe.nextElementSibling) {
                                iframe.parentNode?.insertBefore(errorDiv, iframe.nextSibling);
                              }
                            }}
                          />
                        ) : (
                          <div className="flex items-center justify-center p-8">
                            <img
                              src={`/api/documents/serve?path=${encodeURIComponent(documentModal.document.path)}`}
                              alt={documentModal.title}
                              className="max-w-full max-h-96 lg:max-h-[500px] object-contain rounded shadow-lg"
                              onError={(e) => {
                                console.error('Failed to load image:', e);
                                const img = e.target as HTMLImageElement;
                                img.style.display = 'none';
                                const errorDiv = img.nextElementSibling || document.createElement('div');
                                errorDiv.innerHTML = `
                                  <div class="text-center text-gray-500">
                                    <p class="mb-2">Unable to preview document</p>
                                    <a href="/api/documents/serve?path=${encodeURIComponent(documentModal.document.path)}" 
                                       target="_blank" 
                                       class="text-primary hover:text-primary-dark underline">
                                      Download document
                                    </a>
                                  </div>
                                `;
                                if (!img.nextElementSibling) {
                                  img.parentNode?.insertBefore(errorDiv, img.nextSibling);
                                }
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Document Info */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">File Name:</span>
                        <p className="text-gray-900 mt-1">{documentModal.document?.originalName || documentModal.document?.name || 'Unknown'}</p>
                      </div>
                      {documentModal.document?.size && (
                        <div>
                          <span className="font-medium text-gray-600">File Size:</span>
                          <p className="text-gray-900 mt-1">{Math.round(documentModal.document.size / 1024)} KB</p>
                        </div>
                      )}
                      {documentModal.document?.uploadedAt && (
                        <div>
                          <span className="font-medium text-gray-600">Uploaded:</span>
                          <p className="text-gray-900 mt-1">{formatDate(documentModal.document.uploadedAt)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center">
                    <button
                      onClick={closeDocumentModal}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                    >
                      Close
                    </button>
                    <div className="flex gap-3">
                      <a
                        href={documentModal.document?.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 border border-primary-lighter text-sm font-medium rounded-md text-primary bg-primary-light hover:bg-primary-lighter focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M8 8l8-8m0 0V8m0-8h8" />
                        </svg>
                        Open in New Tab
                      </a>
                      <a
                        href={documentModal.document?.path}
                        download={documentModal.document?.originalName || documentModal.document?.name}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-success hover:bg-success-dark focus:outline-none focus:ring-2 focus:ring-success transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Document Modal */}
      {documentModal.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={closeDocumentModal}
            ></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full sm:p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {documentModal.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {documentModal.document?.originalName || documentModal.document?.name}
                  </p>
                </div>
                <button
                  onClick={closeDocumentModal}
                  className="rounded-full p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Document Preview */}
              <div className="mb-6">
                {documentModal.document && documentModal.document.path && (
                  <div className="w-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 overflow-hidden">
                    {documentModal.document.type && documentModal.document.type.includes('pdf') ? (
                      <iframe
                        src={documentModal.document.path}
                        className="w-full h-96 lg:h-[500px] border-0"
                        title={documentModal.title}
                      />
                    ) : (
                      <div className="flex items-center justify-center p-8">
                        <img
                          src={documentModal.document.path}
                          alt={documentModal.title}
                          className="max-w-full max-h-96 lg:max-h-[500px] object-contain rounded shadow-lg"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Document Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">File Name:</span>
                    <p className="text-gray-900 mt-1">{documentModal.document?.originalName || documentModal.document?.name || 'Unknown'}</p>
                  </div>
                  {documentModal.document?.size && (
                    <div>
                      <span className="font-medium text-gray-600">File Size:</span>
                      <p className="text-gray-900 mt-1">{Math.round(documentModal.document.size / 1024)} KB</p>
                    </div>
                  )}
                  {documentModal.document?.uploadedAt && (
                    <div>
                      <span className="font-medium text-gray-600">Uploaded:</span>
                      <p className="text-gray-900 mt-1">{formatDate(documentModal.document.uploadedAt)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center">
                <button
                  onClick={closeDocumentModal}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                >
                  Close
                </button>
                <div className="flex gap-3">
                  <a
                    href={documentModal.document?.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-primary-lighter text-sm font-medium rounded-md text-primary bg-primary-light hover:bg-primary-lighter focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M8 8l8-8m0 0V8m0-8h8" />
                    </svg>
                    Open in New Tab
                  </a>
                  <a
                    href={documentModal.document?.path}
                    download={documentModal.document?.originalName || documentModal.document?.name}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-success hover:bg-success-dark focus:outline-none focus:ring-2 focus:ring-success transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
