export const runtime = 'edge';

// Make sure this endpoint is fast since it's used for health checks
export async function GET() {
  return new Response(JSON.stringify({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: Date.now()
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate'
    }
  });
}
