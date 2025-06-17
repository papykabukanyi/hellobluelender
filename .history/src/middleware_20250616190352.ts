import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Export configuration to avoid Edge Runtime errors with bcrypt
export const runtime = 'nodejs';

// Move verifyToken here to avoid importing from lib/auth which imports bcrypt
const SECRET_KEY = process.env.JWT_SECRET_KEY || 'blue-lender-secret-key-change-in-production';

const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    return null;
  }
};

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;
  
  // Only protect specific admin routes
  const protectedAdminRoutes = [
    '/admin/dashboard',
    '/admin/email-settings',
    '/admin/smtp-config',
  ];
  
  // Check if the current path is a protected admin route
  const isProtectedRoute = protectedAdminRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  );
  
  if (isProtectedRoute) {
    console.log(`Middleware: Checking auth for protected route: ${path}`);
    // Get the token from the cookies
    const token = request.cookies.get('authToken')?.value;
    
    // If token is missing, redirect to login page
    if (!token) {
      console.log('Middleware: No auth token found, redirecting to login');
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    
    try {
      // Verify the token
      const decodedToken = verifyToken(token);
      
      // If token is invalid, redirect to login page
      if (!decodedToken) {
        console.log('Middleware: Invalid token, redirecting to login');
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      
      console.log('Middleware: Valid token, allowing request');
      // Allow the request to continue
      return NextResponse.next();
    } catch (error) {
      console.error("Middleware: Token verification error:", error);
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }
  
  // Not a protected route, continue
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
