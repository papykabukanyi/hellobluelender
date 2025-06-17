export const runtime = 'edge';

export async function GET() {
  return new Response(JSON.stringify({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: Date.now()
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
