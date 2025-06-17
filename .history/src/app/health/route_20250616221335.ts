import { NextResponse } from 'next/server';

// This is an ultra-simple health check for Railway's built-in health check system
// It's kept as simple and light as possible for maximum reliability
export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export function GET() {
  return NextResponse.json({ status: 'ok' }, { status: 200 });
}
