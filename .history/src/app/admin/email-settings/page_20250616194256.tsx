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
    <AdminLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Email Recipients</h2>
        <p className="text-gray-600">
          Manage email recipients who will receive application notifications and PDF copies
        </p>
      </div>
      
      {/* Notification message */}
      {message && (
        <div className={`mb-4 p-3 rounded-md ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
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
          <p className="text-red-500">{error}</p>
        ) : recipients.length === 0 ? (
          <p>No recipients added yet. Add your first recipient above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-sm">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Added On</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recipients.map((recipient) => (
                  <tr key={recipient.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{recipient.name}</td>
                    <td className="py-3 px-4">{recipient.email}</td>
                    <td className="py-3 px-4">
                      {new Date(recipient.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <button 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteRecipient(recipient.id)}
                      >
                        Delete
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
