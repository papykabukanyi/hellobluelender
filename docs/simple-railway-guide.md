# Simple Railway Deployment Guide

This guide provides straightforward instructions for deploying your Hempire Enterprise application to Railway.

## Steps to Deploy

1. **Install Railway CLI**

   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**

   ```bash
   railway login
   ```

3. **Set Environment Variables**

   ```bash
   npm run railway:setup
   ```

   This will guide you through setting up all required environment variables.

4. **Deploy the Application**

   ```bash
   railway up
   ```

## Required Environment Variables

Make sure these variables are set:

- `REDIS_URL` - Redis connection string
- `JWT_SECRET_KEY` - Secret key for JWT authentication
- `SMTP_HOST` - Email server host (e.g., smtp.gmail.com)
- `SMTP_PORT` - Email server port (usually 587)
- `SMTP_USER` - Email username (your email address)
- `SMTP_PASS` - Email password (App Password for Gmail)
- `SMTP_FROM` - From email address
- `SMTP_FROM_NAME` - From name for emails
- `GEMINI_API_KEY` - API key for the chatbot
- `NODE_ENV` - Set to "production"

## Troubleshooting

If you encounter deployment issues:

1. **Check Logs**
   
   ```bash
   railway logs
   ```

2. **Test Email Configuration**
   
   Visit `/api/test-email` on your deployed application.

3. **Verify Build Settings**
   
   Make sure your Railway project is using the Nixpacks builder.

4. **Memory Issues**
   
   If you see memory errors during build, increase the builder's memory allocation in the Railway dashboard.
