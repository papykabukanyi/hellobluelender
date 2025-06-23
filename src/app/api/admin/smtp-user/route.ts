import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/permissions';

// API route to return the SMTP user (super admin) email
export async function GET(request: NextRequest) {
  try {
    // Check if user is an admin first
    const currentAdmin = await requirePermission(request, 'viewApplications');
    
    // If requirePermission returns a NextResponse, it means unauthorized
    if ('status' in currentAdmin && currentAdmin.status === 403) {
      return currentAdmin;
    }    // Return the super admin email
    const superAdminEmail = 'papy@hempire-enterprise.com'; // Hardcoded correct email
    const smtpUser = superAdminEmail; // Always return the correct super admin email
    
    console.log('SMTP user endpoint - Returning super admin email:', superAdminEmail);
    console.log('Current admin:', currentAdmin.email);
    
    return NextResponse.json({ 
      success: true, 
      smtpUser 
    });
  } catch (error) {
    console.error('Error getting SMTP user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get SMTP user' },
      { status: 500 }
    );
  }
}
