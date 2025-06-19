import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';
import redis from '@/lib/redis';

// Secret key for JWT operations
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET_KEY || 'blue-lender-secret-key-change-in-production'
);

// JWT token generation with 1 hour expiration
const generateToken = async (payload: any) => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h') // Set to 1 hour expiration per requirement
    .sign(SECRET_KEY);
};

// Endpoint to refresh the session token
export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('authToken')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No authentication token found' },
        { status: 401 }
      );
    }
    
    // Verify the token
    let payload;
    try {
      const verified = await jwtVerify(token, SECRET_KEY);
      payload = verified.payload;
    } catch (error) {
      console.error('Token verification error:', error);
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Get latest user data from Redis
    const userJson = await redis.get(`admin:${payload.email}`);
    if (!userJson) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 401 }
      );
    }
    
    const user = JSON.parse(userJson);
    
    // Generate a new token with refreshed expiration
    const newToken = await generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions || {
        viewApplications: user.role === 'admin',
        manageAdmins: user.role === 'admin',
        manageSmtp: user.role === 'admin',
        manageRecipients: user.role === 'admin',
      },
    });
    
    // Create response with the refreshed token
    const response = NextResponse.json({
      success: true,
      message: 'Session refreshed successfully',
    });
    
    // Set cookie with new token
    response.cookies.set({
      name: 'authToken',
      value: newToken,
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour in seconds
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Session refresh error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to refresh session' },
      { status: 500 }
    );
  }
}
