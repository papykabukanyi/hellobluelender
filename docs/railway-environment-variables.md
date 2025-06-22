# Railway Deployment Environment Variables

This document outlines the environment variables needed for successful deployment on Railway.

## Required Environment Variables

The following environment variables must be set in your Railway project:

| Variable | Description | Example |
|----------|-------------|---------|
| `REDIS_URL` | Redis connection string | `redis://default:password@host:port` |
| `JWT_SECRET_KEY` | Secret key for JWT authentication | `b78cd91a5f6e12ea7b9c54d6e83f2a9de45c1d0f26e79a5b3c8f7d9e1a2b3c4` |
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | Email username/address | `papy@hempire-enterprise.com` |
| `SMTP_PASS` | Email password or app password | `jgzppyquztefofdy` |
| `SMTP_FROM` | From email address | `papy@hempire-enterprise.com` |
| `SMTP_FROM_NAME` | From name for emails | `Hempire Enterprise` |
| `GEMINI_API_KEY` | API key for Gemini AI | `AIzaSyBfh6I40RUjHj_nMRYwLvjQDBgE1XGP-HQ` |

## Setting Environment Variables on Railway

### Method 1: Using Our Setup Script (Recommended)

The easiest way to set up all required environment variables is using our interactive setup script:

```bash
# Install dependencies if you haven't already
npm install

# Run the Railway setup script
npm run railway:setup
```

This script will:

1. Check if Railway CLI is installed
2. Guide you through setting up all required variables
3. Automatically set them in your Railway project
4. Generate secure values for secrets like JWT_SECRET_KEY if needed

### Method 2: Using the Railway Dashboard

If you prefer the manual approach:

1. Go to your project on [Railway Dashboard](https://railway.app/dashboard)
2. Click on your project to open it
3. Navigate to the "Variables" tab
4. Add each environment variable listed in the Required Environment Variables section
5. Click "Deploy" to apply changes

### Method 3: Using the Railway CLI

For a more programmatic approach:

1. Install the Railway CLI if you haven't already:

   ```bash
   npm i -g @railway/cli
   ```

1. Log in to Railway:

   ```bash
   railway login
   ```

1. Link to your project:

   ```bash
   railway link
   ```

1. Set environment variables:

   ```bash
   railway variables set REDIS_URL=redis://default:password@host:port
   railway variables set JWT_SECRET_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
   railway variables set SMTP_HOST=smtp.gmail.com
   railway variables set SMTP_PORT=587
   railway variables set SMTP_USER=your-email@gmail.com
   railway variables set SMTP_PASS=your-app-password
   railway variables set SMTP_FROM=your-email@gmail.com
   railway variables set SMTP_FROM_NAME="Hempire Enterprise"
   railway variables set GEMINI_API_KEY=your-gemini-api-key
   railway variables set NODE_ENV=production
   ```

## Verifying Environment Variables

After setting your environment variables, verify they are properly configured:

1. Visit the "/healthcheck" endpoint of your deployed application
2. Check the Railway logs for any environment-related errors
3. Visit the "/api/test-email" endpoint to test SMTP configuration

## Common Issues

### Missing SMTP Configuration Error

If you see `Missing SMTP configuration. Check environment variables` in your logs:

1. Verify all SMTP-related environment variables are set
2. Check for typos or extra spaces in variable names
3. Ensure the SMTP credentials are valid

### Redis Connection Errors

If your application fails to connect to Redis:

1. Verify the Redis URL is correct
2. Check if Redis service is running
3. Ensure firewall settings allow connections to Redis

### Gemini API Key Issues

If the chatbot isn't functioning:

1. Verify the API key is correctly set
2. Check if the API key has required permissions
3. Ensure the key is properly formatted (no extra spaces)

## Securing Your Environment Variables

- Never commit `.env` files to your repository
- Use Railway's secret variables feature for sensitive information
- Rotate API keys and passwords periodically
- Limit access to your Railway project to authorized team members
