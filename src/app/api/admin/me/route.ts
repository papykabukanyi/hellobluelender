import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/permissions';

export async function GET(request: NextRequest) {
  try {
    // Use the requirePermission function to get the current admin
    const currentAdmin = await requirePermission(request, 'viewApplications');
    
    // If requirePermission returns a NextResponse, it means unauthorized
    if ('status' in currentAdmin && currentAdmin.status === 403) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Return the current admin data
    return NextResponse.json({
      success: true,
      admin: {
        id: currentAdmin.id,
        email: currentAdmin.email,
        role: currentAdmin.role,
        permissions: currentAdmin.permissions
      }
    });
  } catch (error) {
    console.error('Error getting current admin:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get admin data' },
      { status: 500 }
    );
  }
}
