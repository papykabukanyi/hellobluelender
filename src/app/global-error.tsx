'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ margin: 0, fontFamily: 'Arial, sans-serif' }}>
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          backgroundColor: '#f9fafb'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 'bold', 
              color: '#dc2626', 
              marginBottom: '1rem' 
            }}>
              Something went wrong!
            </h1>
            <p style={{ 
              color: '#6b7280', 
              marginBottom: '2rem' 
            }}>
              Hello Blue Lenders encountered an unexpected error.
            </p>
            <button
              onClick={() => reset()}
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '600',
                marginRight: '1rem',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                border: '2px solid #2563eb',
                color: '#2563eb',
                textDecoration: 'none',
                borderRadius: '0.5rem',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#2563eb';
                e.currentTarget.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#2563eb';
              }}
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
