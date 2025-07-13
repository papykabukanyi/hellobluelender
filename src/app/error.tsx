'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#f9fafb',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '28rem' }}>
        <h1 style={{ 
          fontSize: '4rem', 
          fontWeight: 'bold', 
          color: '#2563eb', 
          marginBottom: '1rem' 
        }}>
          500
        </h1>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '600', 
          color: '#374151', 
          marginBottom: '1rem' 
        }}>
          Server Error
        </h2>
        <p style={{ 
          color: '#6b7280', 
          marginBottom: '2rem' 
        }}>
          Hello Blue Lenders encountered an unexpected error. Our blue team is working to fix this.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={() => reset()}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
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
            Try Again
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
            Return Home
          </a>
        </div>
      </div>
    </div>
  );
}
