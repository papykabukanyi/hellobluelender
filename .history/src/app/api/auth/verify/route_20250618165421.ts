import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import redis from '@/lib/redis';

// Secret key for JWT verification
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET_KEY || 'blue-lender-secret-key-change-in-production'
);

// Edge-compatible token verification function
const verifyToken = async (token: string) => {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
};

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('authToken')?.value;
    
    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    
    // Verify the token (now async)
    const decodedToken = await verifyToken(token);
    
    if (!decodedToken) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    
    // Get the latest user data from Redis to include permissions
    const userJson = await redis.get(`admin:${decodedToken.email}`);
    
    if (!userJson) {
      // User no longer exists in Redis
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    
    const user = JSON.parse(userJson);
    
    // Return user data with permissions
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        permissions: user.permissions || {
          viewApplications: user.role === 'admin', // Default permissions for backward compatibility
          manageAdmins: user.role === 'admin',
          manageSmtp: user.role === 'admin',
          manageRecipients: user.role === 'admin',
        }
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { authenticated: false, error: 'Authentication failed' },
      { status: 401 }
    );
  }
}
