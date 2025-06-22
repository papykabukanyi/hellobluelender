import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/permissions';
import redis from '@/lib/redis';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is authenticated and has permissions
    const currentAdmin = await requirePermission(request, 'viewApplications');
    
    // If requirePermission returns a NextResponse, it means unauthorized
    if ('status' in currentAdmin && currentAdmin.status === 403) {
      return currentAdmin;
    }
    
    // Check if user is a super admin (SMTP User from env)
    const smtpUser = process.env.SMTP_USER || '';
    
    if (currentAdmin.email !== smtpUser) {
      return NextResponse.json(
        { success: false, error: 'Only the super admin can perform this action' },
        { status: 403 }
      );
    }
    
    const leadId = params.id;
    
    // First check if this is a chat lead
    const chatLeadKey = `chat:lead:${leadId}`;
    const chatLead = await redis.get(chatLeadKey);
    
    if (chatLead) {
      // Update the lead status
      const leadData = JSON.parse(chatLead);
      leadData.status = 'contacted';
      leadData.contactedAt = new Date().toISOString();
      leadData.priority = 'low';
      leadData.contactedBy = currentAdmin.email;
      
      await redis.set(chatLeadKey, JSON.stringify(leadData));
      
      return NextResponse.json({ success: true, message: 'Lead marked as contacted' });
    }
    
    // Check if this is an incomplete application
    const appLeadKey = `application:incomplete:${leadId}`;
    const appLead = await redis.get(appLeadKey);
    
    if (appLead) {
      // Update the application status
      const appData = JSON.parse(appLead);
      
      if (!appData.status) {
        appData.status = {};
      }
      
      appData.status.contacted = true;
      appData.status.contactedAt = new Date().toISOString();
      appData.status.contactedBy = currentAdmin.email;
      
      await redis.set(appLeadKey, JSON.stringify(appData));
      
      return NextResponse.json({ success: true, message: 'Lead marked as contacted' });
    }
    
    // If we get here, the lead ID was not found
    return NextResponse.json(
      { success: false, error: 'Lead not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error marking lead as contacted:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update lead' },
      { status: 500 }
    );
  }
}
