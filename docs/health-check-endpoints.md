# Health Check Endpoints

This document outlines the health check configuration for the HelloBlueLender application.

## Available Health Check Endpoints

The application provides several health check endpoints to allow different monitoring systems to verify the application's status:

1. **`/healthcheck`**: 
   - Type: Plain text response
   - Format: Text ("OK")
   - Purpose: Primary health check endpoint for Railway deployment
   - Implementation: Custom server.js handler + app/healthcheck/route.ts
   - Configuration: Specified in railway.toml

2. **`/health`**:
   - Type: Plain text response
   - Format: Text ("OK")
   - Purpose: Alternative lightweight health check
   - Implementation: Custom server.js handler + app/health/route.ts

3. **`/api/health`**:
   - Type: JSON API
   - Format: `{ status: 'healthy', timestamp: Date.now(), environment: '...' }`
   - Purpose: Basic health status with environment info
   - Implementation: app/api/health/route.ts

4. **`/api/health/detailed`**:
   - Type: JSON API
   - Format: Comprehensive health status including Redis connection details
   - Purpose: Detailed system health check for monitoring tools
   - Implementation: app/api/health/detailed/route.ts

## Health Check Configuration

- Railway deployment uses `/healthcheck` as configured in `railway.toml`
- All health check endpoints include cache prevention headers
- The custom server.js provides fallback health checks that will work even if Next.js has issues

## Best Practices

1. Don't create page.tsx files in the same directories as route.ts handlers
2. Use the most appropriate health check for your monitoring tool:
   - For basic uptime monitoring: Use `/healthcheck`
   - For more detailed monitoring: Use `/api/health/detailed`
