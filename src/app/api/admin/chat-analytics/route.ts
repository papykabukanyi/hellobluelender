import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/permissions';
import redis from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated as super admin
    const currentAdmin = await requirePermission(request, 'viewApplications');
    
    if ('status' in currentAdmin && currentAdmin.status === 403) {
      return currentAdmin;
    }

    const superAdminEmail = 'papy@hempire-enterprise.com';
    
    if (currentAdmin.email !== superAdminEmail) {
      return NextResponse.json(
        { success: false, error: 'Only the super admin can access analytics' },
        { status: 403 }
      );
    }

    // Get comprehensive chat analytics
    const analytics = await getChatAnalytics();
    
    return NextResponse.json({
      success: true,
      analytics
    });

  } catch (error) {
    console.error('Error fetching chat analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

async function getChatAnalytics() {
  try {
    // Get session analytics
    const sessionStats = await redis.hgetall('chat:analytics:sessions') || {};
    
    // Get lead analytics
    const leadStats = await redis.hgetall('chat:analytics:leads') || {};
    
    // Get daily analytics for the last 30 days
    const dailyStats = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayStats = await redis.hgetall(`chat:analytics:daily:${dateStr}`) || {};
      dailyStats.push({
        date: dateStr,
        sessions: parseInt(dayStats.sessions || '0'),
        messages: parseInt(dayStats.messages || '0'),
        leads_detected: parseInt(dayStats.leads_detected || '0')
      });
    }
    
    // Get conversation quality metrics
    const conversationMetrics = await getConversationMetrics();
    
    // Get top performing responses
    const performanceMetrics = await getPerformanceMetrics();
    
    // Calculate learning insights
    const learningInsights = calculateLearningInsights(dailyStats, sessionStats, leadStats);
    
    return {
      overview: {
        total_sessions: parseInt(sessionStats.total_sessions || '0'),
        total_messages: parseInt(sessionStats.total_messages || '0'),
        potential_leads_detected: parseInt(leadStats.potential_leads_detected || '0'),
        high_priority_leads: parseInt(leadStats.high || '0'),
        medium_priority_leads: parseInt(leadStats.medium || '0'),
        low_priority_leads: parseInt(leadStats.low || '0'),
        conversion_rate: calculateConversionRate(sessionStats, leadStats)
      },
      daily_stats: dailyStats,
      conversation_metrics: conversationMetrics,
      performance_metrics: performanceMetrics,
      learning_insights: learningInsights,
      generated_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting chat analytics:', error);
    return {
      error: 'Failed to retrieve analytics data'
    };
  }
}

async function getConversationMetrics() {
  try {
    // Get conversation metrics for recent sessions
    const sessionKeys = await redis.keys('chat:session:*');
    let totalDuration = 0;
    let totalMessagesPerSession = 0;
    let sessionsWithLeads = 0;
    let averageMessagesToLead = 0;
    let completedConversations = 0;
    
    const sessionCount = Math.min(sessionKeys.length, 100); // Analyze last 100 sessions
    
    for (let i = 0; i < sessionCount; i++) {
      const sessionData = await redis.get(sessionKeys[i]);
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        totalDuration += parsed.sessionDuration || 0;
        totalMessagesPerSession += parsed.messageCount || 0;
        
        if (parsed.extractedInfo && (parsed.extractedInfo.email || parsed.extractedInfo.phone)) {
          sessionsWithLeads++;
          averageMessagesToLead += parsed.userMessageCount || 0;
        }
        
        if (parsed.messageCount >= 5) {
          completedConversations++;
        }
      }
    }
    
    return {
      average_session_duration: sessionCount > 0 ? Math.round(totalDuration / sessionCount) : 0,
      average_messages_per_session: sessionCount > 0 ? Math.round(totalMessagesPerSession / sessionCount) : 0,
      sessions_with_leads: sessionsWithLeads,
      average_messages_to_lead: sessionsWithLeads > 0 ? Math.round(averageMessagesToLead / sessionsWithLeads) : 0,
      completion_rate: sessionCount > 0 ? Math.round((completedConversations / sessionCount) * 100) : 0,
      analyzed_sessions: sessionCount
    };
  } catch (error) {
    console.error('Error getting conversation metrics:', error);
    return {};
  }
}

async function getPerformanceMetrics() {
  try {
    // Analyze conversation patterns and bot performance
    const metrics = {
      most_effective_greetings: [],
      common_user_questions: [],
      information_extraction_success: {},
      response_effectiveness: {}
    };
    
    // Get conversation metrics from recent sessions
    const conversationKeys = await redis.keys('conversation_metrics:*');
    const recentMetrics = [];
    
    for (let i = 0; i < Math.min(conversationKeys.length, 50); i++) {
      const metricsData = await redis.lrange(conversationKeys[i], 0, -1);
      for (const metric of metricsData) {
        try {
          recentMetrics.push(JSON.parse(metric));
        } catch (err) {
          continue;
        }
      }
    }
    
    // Analyze extraction success rates
    const extractionTypes = ['email', 'phone', 'businessType', 'revenue', 'loanAmount'];
    for (const type of extractionTypes) {
      const successful = recentMetrics.filter(m => m.extractedInfo && m.extractedInfo[type]).length;
      metrics.information_extraction_success[type] = {
        success_count: successful,
        success_rate: recentMetrics.length > 0 ? Math.round((successful / recentMetrics.length) * 100) : 0
      };
    }
    
    return metrics;
  } catch (error) {
    console.error('Error getting performance metrics:', error);
    return {};
  }
}

function calculateConversionRate(sessionStats: any, leadStats: any): number {
  const totalSessions = parseInt(sessionStats.total_sessions || '0');
  const totalLeads = parseInt(leadStats.potential_leads_detected || '0');
  
  if (totalSessions === 0) return 0;
  return Math.round((totalLeads / totalSessions) * 100);
}

function calculateLearningInsights(dailyStats: any[], sessionStats: any, leadStats: any) {
  const insights = [];
  
  // Trend analysis
  const recentWeek = dailyStats.slice(-7);
  const previousWeek = dailyStats.slice(-14, -7);
  
  const recentSessions = recentWeek.reduce((sum, day) => sum + day.sessions, 0);
  const previousSessions = previousWeek.reduce((sum, day) => sum + day.sessions, 0);
  
  if (previousSessions > 0) {
    const sessionTrend = ((recentSessions - previousSessions) / previousSessions) * 100;
    insights.push({
      type: 'trend',
      metric: 'sessions',
      change: Math.round(sessionTrend),
      period: 'week_over_week',
      direction: sessionTrend > 0 ? 'increasing' : 'decreasing'
    });
  }
  
  // Lead quality insights
  const highPriorityLeads = parseInt(leadStats.high || '0');
  const totalLeads = parseInt(leadStats.potential_leads_detected || '0');
  
  if (totalLeads > 0) {
    const qualityRate = (highPriorityLeads / totalLeads) * 100;
    insights.push({
      type: 'quality',
      metric: 'lead_quality',
      rate: Math.round(qualityRate),
      threshold: 30, // 30% high-priority leads is good
      status: qualityRate >= 30 ? 'good' : 'needs_improvement'
    });
  }
  
  // Engagement insights
  const avgMessagesPerDay = dailyStats.reduce((sum, day) => sum + day.messages, 0) / dailyStats.length;
  insights.push({
    type: 'engagement',
    metric: 'daily_messages',
    average: Math.round(avgMessagesPerDay),
    trend: 'stable' // Could be enhanced with more complex analysis
  });
  
  return insights;
}
