import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    // Verify password against environment variable
    // Default to 'futureradio2026' if ENV is not set for local dev testing
    const validPassword = process.env.ADMIN_PASSWORD || 'futureradio2026';
    const cookieSecret = process.env.ADMIN_COOKIE_SECRET || 'future_radio_secret_token_x99';

    if (password === validPassword) {
      // Create response
      const response = NextResponse.json({ success: true });
      
      // Set secure HTTP-only cookie
      response.cookies.set({
        name: 'admin_token',
        value: cookieSecret,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/admin',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });

      return response;
    }

    return NextResponse.json(
      { success: false, message: 'Invalid password' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  // Logout route
  const response = NextResponse.json({ success: true });
  response.cookies.delete('admin_token');
  return response;
}
