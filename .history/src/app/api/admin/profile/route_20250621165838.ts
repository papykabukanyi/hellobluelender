import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/permissions';

// Get current admin user profile
export async function GET(request: NextRequest) {
  try {
    // Get authenticated admin user
    const admin = await requirePermission(request);
    
    // If requirePermission returns a NextResponse, it means unauthorized
    if ('status' in admin && admin.status === 403) {
      return admin;
    }
    
    // Remove sensitive information before returning
    const { password, ...adminData } = admin;
    
    return NextResponse.json({
      success: true,
      admin: adminData,
    });
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
