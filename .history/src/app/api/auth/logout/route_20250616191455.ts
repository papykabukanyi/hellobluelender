import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Create a response that clears the auth token cookie
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });    // Clear the auth token cookie
    response.cookies.set({
      name: 'authToken',
      value: '',
      expires: new Date(0),
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred during logout' },
      { status: 500 }
    );
  }
}
