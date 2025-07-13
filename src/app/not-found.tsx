export default function NotFound() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#f8fafc',
      fontFamily: 'system-ui, sans-serif',
      padding: '1rem'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '4rem', 
          fontWeight: 'bold', 
          color: '#2563eb', 
          margin: '0 0 1rem 0'
        }}>
          404
        </h1>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '600', 
          color: '#374151', 
          margin: '0 0 1rem 0'
        }}>
          Page Not Found
        </h2>
        <p style={{ 
          color: '#6b7280', 
          margin: '0 0 2rem 0'
        }}>
          The page you are looking for does not exist.
        </p>
        <a
          href="/"
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#2563eb',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '0.5rem',
            fontWeight: '600'
          }}
        >
          Return to Home
        </a>
      </div>
    </div>
  );
}
