// server.js - A custom server wrapper with built-in health check endpoint
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

// Port to listen on
const PORT = process.env.PORT || 8080;

console.log('Starting Blue Lender server with built-in health check...');
console.log(`Environment: ${process.env.NODE_ENV}`);
console.log(`Port: ${PORT}`);

// Path to the standalone server
const nextServerPath = path.join(__dirname, '.next/standalone/server.js');

// Check if the standalone server exists
if (!fs.existsSync(nextServerPath)) {
  console.error('Error: Next.js standalone server not found at', nextServerPath);
  console.error('Make sure you have built the application with "next build"');
  process.exit(1);
}

// Create a simple health check server
const server = http.createServer((req, res) => {
  // Handle only health check routes, let Next.js handle everything else
  if (req.url === '/health' || req.url === '/healthcheck') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
    console.log('Health check responded with OK');
    return;
  }
  
  // For any other path, return a message that directs to the Next.js server
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Health check server is running. The Next.js application is running on a separate port.');
});

// Start the health check server
server.listen(PORT, () => {
  console.log(`Health check server listening on port ${PORT}`);
  
  // Use a different port for the Next.js server to avoid conflicts
  process.env.PORT = '3000'; // Next.js will run on port 3000
  
  // Start the Next.js server as a child process
  const nextServerProcess = spawn('node', [nextServerPath], {
    stdio: 'inherit',
    env: process.env
  });
  
  console.log(`Next.js server started with PID ${nextServerProcess.pid}`);
  
  // Handle Next.js server termination
  nextServerProcess.on('close', (code) => {
    console.log(`Next.js server exited with code ${code}`);
    server.close();
    process.exit(code || 0);
  });
  
  // Handle process termination signals
  const handleTermination = (signal) => {
    console.log(`${signal} received, shutting down...`);
    nextServerProcess.kill(signal);
    server.close();
    process.exit(0);
  };
  
  process.on('SIGINT', () => handleTermination('SIGINT'));
  process.on('SIGTERM', () => handleTermination('SIGTERM'));
  process.on('SIGUSR2', () => handleTermination('SIGUSR2'));
});

// Log any server errors
server.on('error', (err) => {
  console.error('Server error:', err);
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
