'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { EmailRecipient } from '@/types';

export default function EmailSettings() {
  const [recipients, setRecipients] = useState<EmailRecipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newRecipient, setNewRecipient] = useState({ name: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  // Fetch recipients on component mount
  useEffect(() => {
    fetchRecipients();
  }, []);

  // Fetch email recipients
  const fetchRecipients = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/email-recipients');
      const data = await response.json();
      
      if (data.success) {
        setRecipients(data.recipients || []);
      } else {
        setError('Failed to load recipients');
      }
    } catch (err) {
      console.error('Error fetching recipients:', err);
      setError('An error occurred while fetching recipients');
    } finally {
      setLoading(false);
    }
  };

  // Add new recipient
  const handleAddRecipient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setMessage(null);
      
      const response = await fetch('/api/admin/email-recipients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRecipient),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setMessage({ text: 'Recipient added successfully', type: 'success' });
        setNewRecipient({ name: '', email: '' });
        fetchRecipients();
      } else {
        setMessage({ text: data.error || 'Failed to add recipient', type: 'error' });
      }
    } catch (err) {
      console.error('Error adding recipient:', err);
      setMessage({ text: 'An error occurred while adding the recipient', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete recipient
  const handleDeleteRecipient = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recipient?')) return;
    
    try {
      const response = await fetch(`/api/admin/email-recipients?id=${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setMessage({ text: 'Recipient deleted successfully', type: 'success' });
        fetchRecipients();
      } else {
        setMessage({ text: data.error || 'Failed to delete recipient', type: 'error' });
      }
    } catch (err) {
      console.error('Error deleting recipient:', err);
      setMessage({ text: 'An error occurred while deleting the recipient', type: 'error' });
    }
  };  return (
    <AdminLayout>      <div className="mb-8">
        <h2 className="text-2xl font-bold">Email Recipients</h2>        <p className="text-gray-600">
          Manage email recipients who will receive application notifications and PDF copies
        </p>        <div className="mt-2 p-4 bg-primary-light border border-primary-lighter rounded-md">          <h3 className="font-medium text-primary">Important:</h3>
          <p className="text-primary-dark">
            All recipients added here will receive notifications when new applications are submitted.
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
      
      {/* Add Recipient Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h3 className="text-lg font-semibold mb-4">Add New Recipient</h3>
        <form onSubmit={handleAddRecipient} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              className="form-input"
              placeholder="John Smith"
              value={newRecipient.name}
              onChange={(e) => setNewRecipient({...newRecipient, name: e.target.value})}
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
              value={newRecipient.email}
              onChange={(e) => setNewRecipient({...newRecipient, name: newRecipient.name, email: e.target.value})}
              required
            />
          </div>
          
          <div className="flex items-end">
            <button 
              type="submit" 
              className="btn-primary h-10"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Recipient'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Recipients List */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Current Recipients</h3>
        
        {loading ? (
          <p>Loading recipients...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>        ) : recipients.length === 0 ? (
          <div className="mb-4">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Warning:</strong> No recipients are currently configured. Applications submitted will not be sent to any admin recipients.
                  </p>
                </div>
              </div>
            </div>
            <p className="mt-4">Add your first recipient above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-sm">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Added On</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>                {recipients.map((recipient) => (
                  <tr key={recipient.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{recipient.name}</td>
                    <td className="py-3 px-4">{recipient.email}</td>
                    <td className="py-3 px-4">
                      {recipient.isMainAdmin ? (
                        <span className="px-2 py-1 bg-success-light text-success text-xs rounded-full">
                          Main Admin
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                          Standard
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {new Date(recipient.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <button 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteRecipient(recipient.id)}
                        disabled={recipient.isMainAdmin}
                        title={recipient.isMainAdmin ? "Cannot delete the main admin recipient" : ""}
                      >
                        {recipient.isMainAdmin ? "Required" : "Delete"}
                      </button>
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
