import { NextRequest, NextResponse } from 'next/server';
import { initializeAdminData } from '@/lib/initialize';

export async function GET(request: NextRequest) {
  try {
    const result = await initializeAdminData();
    
    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to initialize admin data' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error initializing admin data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize admin data' },
      { status: 500 }
    );
  }
}
