import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  

  const path = url.pathname;

  // We only care about /admin routes
  if (path.startsWith('/admin')) {
    // Exclude the login page and API routes from protection
    if (path === '/admin/login' || path.startsWith('/api/auth/admin')) {
      return NextResponse.next();
    }

    // Check for the secure admin token
    const adminToken = request.cookies.get('admin_token')?.value;

    // In a real production app, we would verify a JWT signature here.
    // For this simple password lock, we just check if the token exists and equals the expected value.
    if (!adminToken || adminToken !== process.env.ADMIN_COOKIE_SECRET) {
      // Redirect to login page
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/admin/:path*'],
}
