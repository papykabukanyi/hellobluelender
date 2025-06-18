// server.js - Production server with built-in health check endpoint
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Get port from environment or default to 3000
const PORT = process.env.PORT || 8080;

console.log('Starting Blue Lender production server...');
console.log(`Environment: ${process.env.NODE_ENV}`);
console.log(`Port: ${PORT}`);
console.log(`Node version: ${process.version}`);

// Initialize Next.js
const app = next({
  dev: false,
  dir: __dirname,
  quiet: false
});

const handle = app.getRequestHandler();

// Log memory usage
const logMemoryUsage = () => {
  const used = process.memoryUsage();
  console.log('Memory usage:');
  for (const key in used) {
    console.log(`  ${key}: ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
  }
};

// Prepare Next.js
console.log('Preparing Next.js...');
app.prepare()
  .then(() => {
    // Create server to handle requests
    const server = createServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      
      // Special handling for health check endpoints
      if (req.url === '/healthcheck' || req.url === '/health') {
        // Log the health check request for debugging
        console.log(`Health check request received at ${req.url}`);
        
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('OK');
        return;
      }

      // Let Next.js handle all other requests
      handle(req, res, parsedUrl);
    });

    // Handle server startup
    server.listen(PORT, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://localhost:${PORT}`);
      
      // Log initial memory usage
      logMemoryUsage();
      
      // Schedule periodic memory usage logging
      setInterval(logMemoryUsage, 30 * 60 * 1000); // Every 30 minutes
    });

    // Handle graceful shutdown
    const handleShutdown = (signal) => {
      console.log(`${signal} received, shutting down...`);
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
      
      // Force exit if graceful shutdown takes too long
      setTimeout(() => {
        console.log('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Register signal handlers
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error('Uncaught exception:', err);
      // Don't exit the process, let it continue running
    });
  })
  .catch((ex) => {
    console.error('An error occurred starting the server:', ex);
    process.exit(1);
  });

// Handle termination signals
process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down...');
  healthCheckServer.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  healthCheckServer.close();
  process.exit(0);
});
