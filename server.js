// server.js - Production server with built-in health check endpoint
const { createServer } = require('http');
const { parse } = require('url');
const fs = require('fs');

// Get port from environment or default to 8080
const PORT = process.env.PORT || 8080;

console.log('=== Starting Hello Blue Lenders Production Server ===');
console.log(`Environment: ${process.env.NODE_ENV}`);
console.log(`Port: ${PORT}`);
console.log(`Node version: ${process.version}`);
console.log(`Working directory: ${process.cwd()}`);

// Check if standalone build exists
const standaloneExists = fs.existsSync('./.next/standalone');
const serverExists = fs.existsSync('./.next/standalone/server.js');

console.log(`Standalone directory exists: ${standaloneExists}`);
console.log(`Standalone server.js exists: ${serverExists}`);

let app, handle;

// Always use regular Next.js mode for better compatibility
console.log('Initializing Next.js application...');
const next = require('next');

app = next({
  dev: false,
  dir: __dirname,
  quiet: false
});

handle = app.getRequestHandler();

// Log memory usage
const logMemoryUsage = () => {
  const used = process.memoryUsage();
  console.log('Memory usage:');
  for (const key in used) {
    console.log(`  ${key}: ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
  }
};

// Prepare Next.js
console.log('Preparing Next.js application...');
app.prepare()
  .then(() => {
    console.log('Next.js application prepared successfully');
    
    // Create server to handle requests
    const server = createServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      
      // Log all requests for debugging
      console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
      
      // Special handling for health check endpoints
      if (req.url === '/healthcheck' || req.url === '/health') {
        console.log(`✓ Health check request received at ${req.url}`);
        
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Cache-Control', 'no-cache');
        res.end('OK');
        return;
      }

      // Let Next.js handle all other requests
      try {
        handle(req, res, parsedUrl);
      } catch (error) {
        console.error('Error handling request:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Internal Server Error');
      }
    });

    // Handle server startup
    server.listen(PORT, '0.0.0.0', (err) => {
      if (err) {
        console.error('Failed to start server:', err);
        throw err;
      }
      
      console.log(`✓ Server ready on http://0.0.0.0:${PORT}`);
      console.log(`✓ Health check available at http://0.0.0.0:${PORT}/healthcheck`);
      
      // Log initial memory usage
      logMemoryUsage();
      
      // Test health check endpoint
      setTimeout(() => {
        const http = require('http');
        const options = {
          hostname: 'localhost',
          port: PORT,
          path: '/healthcheck',
          method: 'GET',
        };

        const req = http.request(options, (res) => {
          console.log(`✓ Health check test: Status ${res.statusCode}`);
        });

        req.on('error', (err) => {
          console.error('✗ Health check test failed:', err.message);
        });

        req.end();
      }, 1000);
    });

    // Handle graceful shutdown
    const handleShutdown = (signal) => {
      console.log(`${signal} received, shutting down gracefully...`);
      server.close(() => {
        console.log('✓ Server closed gracefully');
        process.exit(0);
      });
      
      // Force exit if graceful shutdown takes too long
      setTimeout(() => {
        console.log('⚠ Forcing shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Register signal handlers
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error('✗ Uncaught exception:', err);
      // Don't exit the process, let it continue running
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason) => {
      console.error('✗ Unhandled promise rejection:', reason);
      // Don't exit the process, let it continue running
    });
  })
  .catch((ex) => {
    console.error('✗ An error occurred starting the server:', ex);
    process.exit(1);
  });
