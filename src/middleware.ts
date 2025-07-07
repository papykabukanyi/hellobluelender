import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Secret key for JWT verification that's compatible with Edge Runtime
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

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;
  
  // SEO Protection: Block admin routes from search engines
  if (path.startsWith('/admin') || 
      path.startsWith('/api/admin') || 
      path.startsWith('/api/auth')) {
    const response = NextResponse.next();
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet, noimageindex');
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    // Continue with existing authentication logic for admin routes
    // Only protect specific admin routes
    const protectedAdminRoutes = [
      '/admin/dashboard',
      '/admin/email-settings',
      '/admin/smtp-config',
      '/admin/leads',
      '/admin/applications',
      '/admin/manage-admins',
      '/admin/chat-analytics',
      '/admin/maps'
    ];
    
    // Check if the current path is a protected admin route
    const isProtectedRoute = protectedAdminRoutes.some(route => 
      path === route || path.startsWith(`${route}/`)
    );
    
    if (isProtectedRoute) {
      // Get the token from the cookies
      const token = request.cookies.get('authToken')?.value;
      
      // If token is missing, redirect to login page
      if (!token) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      
      // Verify the token
      const payload = await verifyToken(token);
      if (!payload) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    }
    
    return response;
  }
  
  // Not a protected route, continue
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
