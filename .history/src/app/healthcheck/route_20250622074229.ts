// Simple text response that's guaranteed to work
// Railway's health check needs a simple, reliable endpoint

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export function GET() {
  return new Response('OK', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
