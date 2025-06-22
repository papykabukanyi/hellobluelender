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
