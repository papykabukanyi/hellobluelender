# Docker-based Deployment for Railway

This document outlines the Docker-based deployment strategy for Hempire Enterprise on Railway.

## Overview

We've configured the application to use a custom Dockerfile for Railway deployment. This approach offers several advantages:

1. More control over the build environment
2. Better memory management during build
3. Optimized multi-stage build process
4. Consistent builds across environments
5. Better isolation and security with a non-root user

## Docker Build Process

The Dockerfile uses a multi-stage build approach:

1. **Base stage**:
   - Uses Node.js 18 Alpine
   - Installs build dependencies for node-canvas
   - Copies and installs npm dependencies
   - Builds the Next.js application

2. **Runner stage**:
   - Creates a minimal production image
   - Copies only the necessary build artifacts
   - Includes only production dependencies
   - Runs as a non-root user

## Deploying with Docker on Railway

Railway is configured to use our custom Dockerfile via the `railway.json` and `railway.toml` files:

```json
"build": {
  "builder": "DOCKERFILE",
  "dockerfilePath": "Dockerfile"
}
```

### Memory Issues During Build

If you encounter memory issues during the build process:

1. The Dockerfile already sets `NODE_OPTIONS='--max-old-space-size=4096'`
2. A multi-stage build reduces memory pressure during deployment
3. The build process includes cleanup steps to remove unused files

## Troubleshooting Docker Builds

If you encounter issues with Docker builds:

1. **Check Railway build logs** for specific error messages
2. **Verify image size** is not exceeding Railway limits
3. **Check for missing dependencies** that might be required at build time
4. **Review environment variables** for any that might be needed during build

## Local Testing

To test the Docker build locally before deploying:

```bash
# Build the Docker image
docker build -t hempire-enterprise .

# Run the container
docker run -p 8080:8080 --env-file .env.local hempire-enterprise
```

This will help identify any issues with the Dockerfile before deploying to Railway.

## Railway Resource Allocation

Make sure your Railway project has adequate resources:

1. **Memory**: At least 1GB RAM for production
2. **CPU**: At least 1vCPU
3. **Disk**: At least 2GB for the application and dependencies

You can adjust these in the Railway dashboard under your project's settings.
