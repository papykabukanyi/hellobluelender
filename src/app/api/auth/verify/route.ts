import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

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
    
    // Return user data from token
    return NextResponse.json({
      authenticated: true,
      user: {
        id: decodedToken.id,
        email: decodedToken.email,
        role: decodedToken.role,
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
