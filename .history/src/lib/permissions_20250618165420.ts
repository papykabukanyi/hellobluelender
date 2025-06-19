import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import redis from './redis';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET_KEY || 'blue-lender-secret-key-change-in-production'
);

/**
 * Check if the current request is from an authenticated admin with specific permissions
 * @param request The Next.js request object
 * @param requiredPermission The permission to check for (if any)
 * @returns The admin user object if authenticated and has permission, null otherwise
 */
export async function checkAdminPermission(
  request: NextRequest,
  requiredPermission?: 'viewApplications' | 'manageAdmins' | 'manageSmtp' | 'manageRecipients'
) {
  try {
    // Get token from cookie
    const token = request.cookies.get('authToken')?.value;
    
    if (!token) {
      return null;
    }
    
    // Verify token
    let payload;
    try {
      const verified = await jwtVerify(token, SECRET_KEY);
      payload = verified.payload;
    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
    
    // Get latest user data from Redis
    const userJson = await redis.get(`admin:${payload.email}`);
    if (!userJson) {
      return null;
    }
    
    const adminUser = JSON.parse(userJson);
    
    // If no permission is required, or user is main admin, or user has the required permission
    if (
      !requiredPermission || 
      adminUser.role === 'admin' || 
      adminUser.permissions?.[requiredPermission]
    ) {
      return adminUser;
    }
    
    return null;
  } catch (error) {
    console.error('Permission check error:', error);
    return null;
  }
}

/**
 * Middleware to check admin permissions and return appropriate response
 * @param request The Next.js request object
 * @param requiredPermission The permission to check for
 * @returns NextResponse or the admin user object
 */
export async function requirePermission(
  request: NextRequest,
  requiredPermission?: 'viewApplications' | 'manageAdmins' | 'manageSmtp' | 'manageRecipients'
) {
  const adminUser = await checkAdminPermission(request, requiredPermission);
  
  if (!adminUser) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 403 }
    );
  }
  
  return adminUser;
}
