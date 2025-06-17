import { NextRequest, NextResponse } from 'next/server';
import { comparePasswords } from '@/lib/auth';
import redis from '@/lib/redis';
import { SignJWT } from 'jose';

// Secret key for JWT signing
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET_KEY || 'blue-lender-secret-key-change-in-production'
);

// JWT token generation
const generateToken = async (payload: any) => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(SECRET_KEY);
};

// Admin login endpoint
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get admin user from Redis
    const userKey = `admin:${email}`;
    const userJson = await redis.get(userKey);

    // User not found
    if (!userJson) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const user = JSON.parse(userJson);

    // Compare passwords
    const isPasswordValid = await comparePasswords(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }    // Generate JWT token (now async)
    const token = await generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    
    // Create HTTP-only cookie with JWT token
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || user.username,
        role: user.role,
      },
    });

    // Set cookie with token
    response.cookies.set({
      name: 'authToken',
      value: token,
      httpOnly: true,
      secure: false, // Set to false for development
      sameSite: 'lax', // Changed to lax for better compatibility
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });
    
    console.log('Login successful, token set in cookie');

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
