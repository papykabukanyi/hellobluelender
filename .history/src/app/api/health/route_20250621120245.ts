export const revalidate = 0; // Never cache this route
export const fetchCache = 'force-no-store'; // Always fetch fresh data

// Make sure this endpoint is fast since it's used for health checks
export async function GET() {
  // Simple health check that's guaranteed to be fast
  return new Response(JSON.stringify({
    status: 'healthy',
    timestamp: Date.now(),
    environment: process.env.NODE_ENV || 'development'
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}
