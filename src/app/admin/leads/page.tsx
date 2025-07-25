'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';

interface Lead {
  id: string;
  email?: string;
  phone?: string;
  businessName?: string;
  businessType?: string;
  firstName?: string;
  lastName?: string;
  loanAmount?: string;
  monthlyRevenue?: string;
  creditScore?: string;
  qualificationScore?: number;
  notes?: string;
  createdAt: string;
  priority?: 'high' | 'medium' | 'low';
  source?: 'chat' | 'pre-application' | 'incomplete_application';
  chatMessages?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  // Check if current user is super admin
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        // Get the current user data
        const res = await fetch('/api/admin/me');
        if (!res.ok) throw new Error('Failed to fetch admin data');
        
        const data = await res.json();
        
        // Get the SMTP user from env (who is the super admin)
        const smtpUserRes = await fetch('/api/admin/smtp-user');
        if (!smtpUserRes.ok) throw new Error('Failed to fetch SMTP user');
        
        const { smtpUser } = await smtpUserRes.json();
        console.log('Leads page - Current admin:', data.admin.email, 'SMTP user:', smtpUser);
        
        // Set super admin status
        const isSuperAdminUser = data.admin.email === smtpUser;
        setIsSuperAdmin(isSuperAdminUser);
        console.log('Is super admin:', isSuperAdminUser);
        
        if (!isSuperAdminUser) {
          setError('Only the super admin can access the leads page');
        }
      } catch (err) {
        setError('Failed to check admin permissions');
        console.error(err);
      }
    };
    
    checkAdmin();
  }, []);

  // Fetch leads when component loads (if super admin)
  useEffect(() => {
    if (isSuperAdmin) {
      const fetchLeads = async () => {
        setLoading(true);
        try {
          const response = await fetch('/api/admin/leads');
          
          if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
          }
          
          const data = await response.json();
          setLeads(data.leads || []);
        } catch (err) {
          console.error('Error fetching leads:', err);
          setError('Failed to load leads. Please try again later.');
        } finally {
          setLoading(false);
        }
      };
      
      fetchLeads();
    }
  }, [isSuperAdmin]);

  // Filter leads by priority and source
  const filteredLeads = leads.filter(lead => {
    const priorityMatch = filterPriority === 'all' || lead.priority === filterPriority;
    const sourceMatch = filterSource === 'all' || lead.source === filterSource;
    return priorityMatch && sourceMatch;
  });

  // Handle marking a lead as contacted
  const handleMarkContacted = async (leadId: string) => {
    try {
      await fetch(`/api/admin/leads/${leadId}/mark-contacted`, {
        method: 'POST'
      });
      
      // Update the local state to reflect the change
      setLeads(prev => prev.map(lead => 
        lead.id === leadId 
          ? { ...lead, status: 'contacted', priority: 'low' } 
          : lead
      ));
    } catch (error) {
      console.error('Error marking lead as contacted:', error);
    }
  };

  if (error && !isSuperAdmin) {
    return (
      <AdminLayout>
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-700">{error}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold mb-6">Potential Leads</h1>
        <p className="mb-4 text-gray-600">
          These are potential leads captured from incomplete applications and chatbot conversations.
        </p>

        {/* Filter controls */}
        <div className="mb-4 flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <label className="font-medium">Priority:</label>
            <select 
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="font-medium">Source:</label>
            <select 
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="all">All Sources</option>
              <option value="chat">Chat Conversations</option>
              <option value="pre-application">Pre-Applications</option>
              <option value="incomplete_application">Incomplete Applications</option>
            </select>
          </div>
          
          <div className="ml-auto text-gray-600">
            {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredLeads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border-b text-left">Contact Info</th>
                  <th className="py-2 px-4 border-b text-left">Name/Business</th>
                  <th className="py-2 px-4 border-b text-left">Priority</th>
                  <th className="py-2 px-4 border-b text-left">Source</th>
                  <th className="py-2 px-4 border-b text-left">Date</th>
                  <th className="py-2 px-4 border-b text-left">Conversation Summary</th>
                  <th className="py-2 px-4 border-b text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">
                      {lead.email && <div><strong>Email:</strong> {lead.email}</div>}
                      {lead.phone && <div><strong>Phone:</strong> {lead.phone}</div>}
                      {lead.businessType && <div className="text-sm text-gray-600">Industry: {lead.businessType}</div>}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {(lead.firstName || lead.lastName) && (
                        <div><strong>{[lead.firstName, lead.lastName].filter(Boolean).join(' ')}</strong></div>
                      )}
                      {lead.businessName && <div className="text-sm text-gray-600">{lead.businessName}</div>}
                      {lead.loanAmount && <div className="text-sm text-success">Loan: ${parseInt(lead.loanAmount).toLocaleString()}</div>}
                      {lead.monthlyRevenue && <div className="text-sm text-primary">Revenue: ${parseInt(lead.monthlyRevenue).toLocaleString()}/mo</div>}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <span 
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          lead.priority === 'high' ? 'bg-red-100 text-red-800' : 
                          lead.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-success-light text-success'
                        }`}
                      >
                        {lead.priority || 'low'}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b">
                      <span className="text-sm">
                        {lead.source === 'chat' ? 'Chat Conversation' : 
                         lead.source === 'pre-application' ? 'Pre-Application (Chatbot)' : 
                         lead.source === 'incomplete_application' ? 'Incomplete Application' : 
                         'Unknown'}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b">
                      {lead.createdAt ? new Date(lead.createdAt).toLocaleString() : 'Unknown'}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {lead.source === 'pre-application' ? (
                        <div className="text-sm">
                          <div className="mb-1">
                            <span className="font-medium bg-success-light text-success px-2 py-1 rounded text-xs">
                              COMPLETED PRE-APPLICATION
                            </span>
                          </div>
                          {lead.qualificationScore && (
                            <div className="mb-1">
                              <span className="font-medium">Score:</span> {lead.qualificationScore}/10
                            </div>
                          )}
                          {lead.notes ? (
                            <div className="text-gray-600 max-w-xs">
                              {lead.notes.length > 80 ? `${lead.notes.substring(0, 80)}...` : lead.notes}
                            </div>
                          ) : (
                            <span className="text-gray-500">Pre-application submitted via chatbot</span>
                          )}
                        </div>
                      ) : lead.source === 'chat' ? (
                        <div className="text-sm">
                          {lead.qualificationScore && (
                            <div className="mb-1">
                              <span className="font-medium">Score:</span> {lead.qualificationScore}/10
                            </div>
                          )}
                          {lead.notes ? (
                            <div className="text-gray-600 max-w-xs">
                              {lead.notes.length > 80 ? `${lead.notes.substring(0, 80)}...` : lead.notes}
                            </div>
                          ) : (
                            <span className="text-gray-500">Chat conversation lead</span>
                          )}
                        </div>
                      ) : lead.source === 'incomplete_application' ? (
                        <span className="text-gray-500">Started application but didn't finish</span>
                      ) : (
                        <span className="text-gray-500">No conversation data</span>
                      )}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <button 
                        className="text-primary hover:text-primary-dark mr-2 text-sm"
                        onClick={() => {
                          // View details functionality could be added here
                          alert(`Lead details for ${lead.id}`);
                        }}
                      >
                        View Details
                      </button>
                      <button 
                        className="text-success hover:text-success-dark text-sm"
                        onClick={() => handleMarkContacted(lead.id)}
                      >
                        Mark Contacted
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No leads found matching the selected filters.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
