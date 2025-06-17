import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;
  
  // Check if the path starts with /admin but is not the admin login page
  if (path.startsWith('/admin') && path !== '/admin') {
    // Get the token from the cookies
    const token = request.cookies.get('authToken')?.value;
    
    // If token is missing, redirect to login page
    if (!token) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    
    // Verify the token
    const decodedToken = verifyToken(token);
    
    // If token is invalid, redirect to login page
    if (!decodedToken) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    
    // Allow the request to continue
    return NextResponse.next();
  }
  
  // Not an admin route, continue
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
