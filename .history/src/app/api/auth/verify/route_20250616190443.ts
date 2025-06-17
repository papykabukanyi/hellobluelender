import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('authToken')?.value;
    
    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    
    // Verify the token
    const decodedToken = verifyToken(token);
    
    if (!decodedToken) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    
    // Return user data from token
    return NextResponse.json({
      authenticated: true,
      user: {
        id: (decodedToken as any).id,
        email: (decodedToken as any).email,
        role: (decodedToken as any).role,
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
