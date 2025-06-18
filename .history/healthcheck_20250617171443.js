// Ultra simple healthcheck script for Railway - one file, one job
const { createServer } = require('http');

// Create a very simple server that just responds "OK" to any request
const server = createServer((req, res) => {
  // Log request for debugging
  console.log(`Health check received: ${req.method} ${req.url}`);
  
  // Always respond with OK
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('OK');
});

// Start the server on the specified port
const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`Healthcheck server listening on port ${port}`);
  console.log(`Node.js version: ${process.version}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Log any errors
server.on('error', (err) => {
  console.error('Server error:', err);
});

// Handle termination signals
const handleSignal = (signal) => {
  console.log(`${signal} received, shutting down health check server...`);
  server.close(() => {
    console.log('Server closed gracefully');
    process.exit(0);
  });
  
  // Force exit after 3 seconds if graceful shutdown fails
  setTimeout(() => {
    console.log('Forcing exit after timeout');
    process.exit(0);
  }, 3000);
};

process.on('SIGINT', () => handleSignal('SIGINT'));
process.on('SIGTERM', () => handleSignal('SIGTERM'));
