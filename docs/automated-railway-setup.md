# Automated Railway Setup Guide

This guide explains how to use the automated setup script to deploy your application to Railway with all environment variables automatically configured.

## Prerequisites

1. Install the Railway CLI:
   ```
   npm i -g @railway/cli
   ```

2. Log in to Railway:
   ```
   railway login
   ```

3. Ensure your `.env.local` file contains all required environment variables:
   - REDIS_URL
   - JWT_SECRET_KEY
   - SMTP_HOST
   - SMTP_PORT
   - SMTP_USER
   - SMTP_PASS
   - SMTP_FROM
   - SMTP_FROM_NAME
   - GEMINI_API_KEY

## Automated Setup Process

1. Run the setup script:
   ```
   node setup-railway.js
   ```

2. The script will:
   - Check if Railway CLI is installed
   - Check if you're logged in to Railway
   - Load all variables from `.env.local`
   - Display which variables will be set in Railway (with sensitive values masked)
   - Ask for confirmation before proceeding
   - Automatically set all variables in your Railway project

3. Deploy your application:
   ```
   railway up
   ```

## Troubleshooting

If you encounter any issues:

1. **Missing variables**: Make sure your `.env.local` file includes all required variables.
2. **Railway CLI not installed**: Run `npm i -g @railway/cli` to install it.
3. **Not logged in**: Run `railway login` to authenticate with Railway.
4. **Deployment errors**: Check Railway logs with `railway logs`.
5. **Health check failures**: Visit `/healthcheck` endpoint to verify your application status.
6. **Dependency conflicts**: The application uses React 19, but some packages like `react-leaflet-cluster` expect React 18. The Dockerfile has been updated to use the `--legacy-peer-deps` flag to resolve these conflicts.

## Handling Dependency Conflicts

The project uses React 19, but some dependencies like `react-leaflet-cluster` require React 18. To handle this:

1. We've updated the Dockerfile to use `--legacy-peer-deps` during installation:
   ```bash
   RUN npm ci --legacy-peer-deps
   ```

2. The build script also includes the same flag:
   ```bash
   RUN npm run build --legacy-peer-deps
   ```

3. If you need to install new packages locally, use:
   ```bash
   npm install package-name --legacy-peer-deps
   ```

4. All Railway deployment configurations have been updated to use the Dockerfile-based deployment method to ensure consistent builds.

## Database Configuration

The application uses Prisma with PostgreSQL. When deploying to Railway:

1. Railway automatically provisions a PostgreSQL database when it detects Prisma in your project.

2. The setup script will automatically configure the `DATABASE_URL` environment variable using Railway's PostgreSQL service variables:
   ```bash
   DATABASE_URL=postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}
   ```

3. Railway will automatically substitute these variables with actual values for your PostgreSQL instance.

4. If you need to manually set up the database URL, you can do so with:
   ```bash
   railway variables set DATABASE_URL="postgresql://username:password@hostname:port/database"
   ```

5. The Dockerfile has been configured to:
   - Copy the Prisma schema before running npm install
   - Skip automatic Prisma generation during npm install (--ignore-scripts)
   - Run Prisma generate explicitly after installation

## Resolving Node.js Version Conflicts

Some dependencies like `file-type@21.0.0` require Node.js v20+, but we're using Node.js 18 for compatibility reasons. You may see warnings like:

```
npm warn EBADENGINE Unsupported engine {
  package: 'file-type@21.0.0',
  required: { node: '>=20' },
  current: { node: 'v18.20.8', npm: '10.8.2' }
}
```

These warnings can be safely ignored for now. If you want to eliminate them, you could:

1. Update the Dockerfile to use Node.js 20:
   ```dockerfile
   FROM node:20-alpine
   ```

2. Test thoroughly as this may introduce other compatibility issues.

## Checking Deployment Status

1. After deploying, verify your application's health:
   ```
   railway open
   ```

2. Navigate to the `/healthcheck` endpoint to verify all services are working correctly.

3. Test the email functionality by visiting `/api/test-email` (if implemented in your application).

## Security Notes

- Your `.env.local` file and all other sensitive configuration files are automatically excluded from git via `.gitignore`.
- Never commit sensitive environment variables or API keys to your repository.
- The setup script masks sensitive values when displaying them.
