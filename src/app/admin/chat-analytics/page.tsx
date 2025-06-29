'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { formatDate } from '@/lib/utils';

interface Analytics {
  overview: {
    total_sessions: number;
    total_messages: number;
    potential_leads_detected: number;
    high_priority_leads: number;
    medium_priority_leads: number;
    low_priority_leads: number;
    conversion_rate: number;
  };
  daily_stats: Array<{
    date: string;
    sessions: number;
    messages: number;
    leads_detected: number;
  }>;
  conversation_metrics: {
    average_session_duration: number;
    average_messages_per_session: number;
    sessions_with_leads: number;
    average_messages_to_lead: number;
    completion_rate: number;
    analyzed_sessions: number;
  };
  learning_insights: Array<{
    type: string;
    metric: string;
    change?: number;
    rate?: number;
    status?: string;
    direction?: string;
    average?: number;
  }>;
  generated_at?: string;
}

export default function ChatAnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Check if current user is super admin
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch('/api/admin/me');
        if (!res.ok) throw new Error('Failed to fetch admin data');
        
        const data = await res.json();
        const smtpUserRes = await fetch('/api/admin/smtp-user');
        if (!smtpUserRes.ok) throw new Error('Failed to fetch SMTP user');
        
        const { smtpUser } = await smtpUserRes.json();
        const isSuperAdminUser = data.admin.email === smtpUser;
        setIsSuperAdmin(isSuperAdminUser);
        
        if (!isSuperAdminUser) {
          setError('Only the super admin can access chat analytics');
        }
      } catch (err) {
        setError('Failed to check admin permissions');
        console.error(err);
      }
    };
    
    checkAdmin();
  }, []);

  // Fetch analytics when component loads (if super admin)
  useEffect(() => {
    if (isSuperAdmin) {
      const fetchAnalytics = async () => {
        setLoading(true);
        try {
          const response = await fetch('/api/admin/chat-analytics');
          
          if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
          }
          
          const data = await response.json();
          setAnalytics(data.analytics);
        } catch (err) {
          console.error('Error fetching analytics:', err);
          setError('Failed to load chat analytics. Please try again later.');
        } finally {
          setLoading(false);
        }
      };
      
      fetchAnalytics();
    }
  }, [isSuperAdmin]);

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

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700">{error}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Chat Bot Analytics & Learning</h1>
          <div className="text-sm text-gray-500">
            Last updated: {analytics ? new Date(analytics.generated_at || '').toLocaleString() : 'Never'}
          </div>
        </div>

        {/* Overview Cards */}
        {analytics?.overview && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Total Conversations</h3>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.total_sessions}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Total Messages</h3>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.total_messages}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Leads Generated</h3>
              <p className="text-2xl font-bold text-green-600">{analytics.overview.potential_leads_detected}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
              <p className="text-2xl font-bold text-blue-600">{analytics.overview.conversion_rate}%</p>
            </div>
          </div>
        )}

        {/* Lead Quality Breakdown */}
        {analytics?.overview && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Lead Quality Distribution</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{analytics.overview.high_priority_leads}</div>
                <div className="text-sm text-gray-500">High Priority</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{analytics.overview.medium_priority_leads}</div>
                <div className="text-sm text-gray-500">Medium Priority</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{analytics.overview.low_priority_leads}</div>
                <div className="text-sm text-gray-500">Low Priority</div>
              </div>
            </div>
          </div>
        )}

        {/* Conversation Metrics */}
        {analytics?.conversation_metrics && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Conversation Performance</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Avg. Session Duration</h3>
                <p className="text-xl font-semibold">{Math.floor(analytics.conversation_metrics.average_session_duration / 60)}m {analytics.conversation_metrics.average_session_duration % 60}s</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Avg. Messages/Session</h3>
                <p className="text-xl font-semibold">{analytics.conversation_metrics.average_messages_per_session}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Completion Rate</h3>
                <p className="text-xl font-semibold">{analytics.conversation_metrics.completion_rate}%</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Sessions with Leads</h3>
                <p className="text-xl font-semibold">{analytics.conversation_metrics.sessions_with_leads}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Avg. Messages to Lead</h3>
                <p className="text-xl font-semibold">{analytics.conversation_metrics.average_messages_to_lead}</p>
              </div>
              
              <div className="text-xs text-gray-400">
                Based on {analytics.conversation_metrics.analyzed_sessions} recent sessions
              </div>
            </div>
          </div>
        )}

        {/* Daily Stats Chart */}
        {analytics?.daily_stats && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Daily Activity (Last 30 Days)</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-2 text-xs">
                {analytics.daily_stats.slice(-7).map((day, index) => (
                  <div key={day.date} className="text-center">
                    <div className="text-gray-500">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                    <div className="bg-blue-100 p-2 rounded mt-1">
                      <div className="font-semibold">{day.sessions}</div>
                      <div className="text-gray-500">sessions</div>
                    </div>
                    <div className="bg-green-100 p-2 rounded mt-1">
                      <div className="font-semibold">{day.leads_detected}</div>
                      <div className="text-gray-500">leads</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Learning Insights */}
        {analytics?.learning_insights && analytics.learning_insights.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">AI Learning Insights</h2>
            <div className="space-y-3">
              {analytics.learning_insights.map((insight, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <h3 className="font-medium capitalize">{insight.metric.replace('_', ' ')}</h3>
                    <p className="text-sm text-gray-600">
                      {insight.type === 'trend' && (
                        <>
                          {insight.change && insight.change > 0 ? '↗️' : '↘️'} 
                          {Math.abs(insight.change || 0)}% change over last week
                        </>
                      )}
                      {insight.type === 'quality' && (
                        <>
                          🎯 {insight.rate}% high-quality leads 
                          {insight.status === 'good' ? ' (Good)' : ' (Needs Improvement)'}
                        </>
                      )}
                      {insight.type === 'engagement' && (
                        <>📊 Average {insight.average} messages per day</>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    {insight.status === 'good' && <span className="text-green-600">✅</span>}
                    {insight.status === 'needs_improvement' && <span className="text-yellow-600">⚠️</span>}
                    {insight.direction === 'increasing' && <span className="text-blue-600">📈</span>}
                    {insight.direction === 'decreasing' && <span className="text-red-600">📉</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bot Learning Status */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-2 text-blue-800">🤖 Bot Learning Status</h2>
          <p className="text-blue-700 mb-4">
            The chatbot is continuously learning from conversations to improve lead generation and response quality.
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Information Extraction:</span>
              <span className="font-semibold text-green-600">Active</span>
            </div>
            <div className="flex justify-between">
              <span>Response Optimization:</span>
              <span className="font-semibold text-green-600">Learning</span>
            </div>
            <div className="flex justify-between">
              <span>Lead Qualification:</span>
              <span className="font-semibold text-green-600">Improving</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
