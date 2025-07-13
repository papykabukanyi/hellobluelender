'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { AdminUser } from '@/types';

export default function ManageAdmins() {
  // This page is wrapped with AuthCheck in AdminLayout with 'manageAdmins' permission required
  const [admins, setAdmins] = useState<Partial<AdminUser>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newAdmin, setNewAdmin] = useState({
    username: '',
    email: '',
    password: '',
    permissions: {
      viewApplications: true,
      manageAdmins: false,
      manageSmtp: false,
      manageRecipients: false,
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  // Fetch admins on component mount
  useEffect(() => {
    fetchAdmins();
  }, []);

  // Fetch admin users
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/manage-admins');
      const data = await response.json();
      
      if (data.success) {
        setAdmins(data.admins || []);
      } else {
        setError('Failed to load admin users');
      }
    } catch (err) {
      console.error('Error fetching admin users:', err);
      setError('An error occurred while fetching admin users');
    } finally {
      setLoading(false);
    }
  };

  // Add new admin
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setMessage(null);
      
      const response = await fetch('/api/admin/temp-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newAdmin.email,
          username: newAdmin.username,
          permissions: newAdmin.permissions,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setMessage({ text: 'Admin invitation sent successfully! The new admin will receive an email with setup instructions.', type: 'success' });
        setNewAdmin({
          username: '',
          email: '',
          password: '',
          permissions: {
            viewApplications: true,
            manageAdmins: false,
            manageSmtp: false,
            manageRecipients: false,
          }
        });
        fetchAdmins();
      } else {
        setMessage({ text: data.error || 'Failed to send admin invitation', type: 'error' });
      }
    } catch (err) {
      console.error('Error sending admin invitation:', err);
      setMessage({ text: 'An error occurred while sending the admin invitation', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete admin
  const handleDeleteAdmin = async (email: string) => {
    if (!confirm('Are you sure you want to delete this admin?')) return;
    
    try {
      const response = await fetch(`/api/admin/manage-admins?email=${email}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setMessage({ text: 'Admin deleted successfully', type: 'success' });
        fetchAdmins();
      } else {
        setMessage({ text: data.error || 'Failed to delete admin', type: 'error' });
      }
    } catch (err) {
      console.error('Error deleting admin:', err);
      setMessage({ text: 'An error occurred while deleting the admin', type: 'error' });
    }
  };

  // Toggle permission
  const handleUpdatePermission = async (admin: Partial<AdminUser>, permission: keyof AdminUser['permissions']) => {
    if (!admin.id || !admin.email) return;
    
    try {
      const updatedPermissions = {
        ...admin.permissions,
        [permission]: !admin.permissions?.[permission]
      };
      
      const response = await fetch('/api/admin/manage-admins', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: admin.id,
          email: admin.email,
          permissions: updatedPermissions
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setMessage({ text: 'Admin permissions updated', type: 'success' });
        fetchAdmins();
      } else {
        setMessage({ text: data.error || 'Failed to update permissions', type: 'error' });
      }
    } catch (err) {
      console.error('Error updating admin permissions:', err);
      setMessage({ text: 'An error occurred while updating permissions', type: 'error' });
    }
  };

  // Helper to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Manage Admins</h2>
        <p className="text-gray-600">
          Add and manage administrators for Hello Blue Lenders application
        </p>
        <div className="mt-2 p-4 bg-primary-light border border-primary-lighter rounded-md">
          <h3 className="font-medium text-primary">Access Levels</h3>
          <p className="text-primary-dark">
            Sub-admins can be given different permission levels. By default, they will only have access
            to view applications, but you can grant additional permissions as needed.
          </p>
        </div>
      </div>
      
      {/* Notification message */}
      {message && (
        <div className={`mb-4 p-3 rounded-md ${
          message.type === 'success' ? 'bg-success-light text-success' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}
      
      {/* Add Admin Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h3 className="text-lg font-semibold mb-4">Invite New Admin</h3>        <form onSubmit={handleAddAdmin}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username (Optional)
              </label>
              <input
                type="text"
                value={newAdmin.username}
                onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Leave blank to use email as identifier"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={newAdmin.email}
                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                required
              />
            </div>
          </div>
          
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="text-blue-500 mr-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-1">Automatic Password Setup</h4>
                <p className="text-sm text-blue-700">
                  The new admin will receive an email with a temporary password and setup link. 
                  They must use this link to create their own secure password.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Permissions
            </label>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="viewApplications"
                  checked={newAdmin.permissions.viewApplications}
                  onChange={(e) => setNewAdmin({
                    ...newAdmin,
                    permissions: {
                      ...newAdmin.permissions,
                      viewApplications: e.target.checked
                    }
                  })}
                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="viewApplications" className="ml-2 block text-sm text-gray-700">
                  View Applications (default)
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="manageRecipients"
                  checked={newAdmin.permissions.manageRecipients}
                  onChange={(e) => setNewAdmin({
                    ...newAdmin,
                    permissions: {
                      ...newAdmin.permissions,
                      manageRecipients: e.target.checked
                    }
                  })}
                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="manageRecipients" className="ml-2 block text-sm text-gray-700">
                  Manage Email Recipients
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="manageSmtp"
                  checked={newAdmin.permissions.manageSmtp}
                  onChange={(e) => setNewAdmin({
                    ...newAdmin,
                    permissions: {
                      ...newAdmin.permissions,
                      manageSmtp: e.target.checked
                    }
                  })}
                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="manageSmtp" className="ml-2 block text-sm text-gray-700">
                  Manage SMTP Configuration
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="manageAdmins"
                  checked={newAdmin.permissions.manageAdmins}
                  onChange={(e) => setNewAdmin({
                    ...newAdmin,
                    permissions: {
                      ...newAdmin.permissions,
                      manageAdmins: e.target.checked
                    }
                  })}
                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="manageAdmins" className="ml-2 block text-sm text-gray-700">
                  Manage Admins
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {isSubmitting ? 'Sending Invitation...' : 'Send Admin Invitation'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Admins List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Admin Users</h3>
        
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">{error}</div>
        ) : admins.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No admin users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {admins.map((admin) => (
                  <tr key={admin.id}>                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{admin.username || admin.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{admin.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        admin.role === 'admin' ? 'bg-success-light text-success' : 'bg-primary-light text-primary'
                      }`}>
                        {admin.role === 'admin' ? 'Main Admin' : 'Sub Admin'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 space-y-1">
                        {admin.role === 'admin' ? (
                          <span className="text-gray-500 italic">All permissions</span>
                        ) : (
                          <>
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={admin.permissions?.viewApplications ?? false}
                                onChange={() => handleUpdatePermission(admin, 'viewApplications')}
                                className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                                disabled={false}
                              />
                              <label className="ml-2 block text-sm text-gray-700">
                                View Applications
                              </label>
                            </div>
                            
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={admin.permissions?.manageRecipients ?? false}
                                onChange={() => handleUpdatePermission(admin, 'manageRecipients')}
                                className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                                disabled={false}
                              />
                              <label className="ml-2 block text-sm text-gray-700">
                                Manage Recipients
                              </label>
                            </div>
                            
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={admin.permissions?.manageSmtp ?? false}
                                onChange={() => handleUpdatePermission(admin, 'manageSmtp')}
                                className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                                disabled={false}
                              />
                              <label className="ml-2 block text-sm text-gray-700">
                                Manage SMTP
                              </label>
                            </div>
                            
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={admin.permissions?.manageAdmins ?? false}
                                onChange={() => handleUpdatePermission(admin, 'manageAdmins')}
                                className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                                disabled={false}
                              />
                              <label className="ml-2 block text-sm text-gray-700">
                                Manage Admins
                              </label>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(admin.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {admin.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteAdmin(admin.email!)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      )}
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
