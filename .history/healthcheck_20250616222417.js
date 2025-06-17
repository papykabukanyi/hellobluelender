// Simple standalone healthcheck script for Railway
const http = require('http');

// Create a very simple health check server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('OK');
});

// Start the server on the specified port
const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`Healthcheck server listening on port ${port}`);
});

// Handle termination signals
process.on('SIGINT', () => {
  server.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  server.close();
  process.exit(0);
});
