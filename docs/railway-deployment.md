# Railway Deployment Configuration Guide

This guide provides instructions for deploying the Hempire Enterprise application on Railway, with special focus on environment variables and email configuration.

> **Note**: We now use a Docker-based deployment approach for improved reliability. See [Docker Deployment](./docker-deployment.md) for details.

## Environment Variables Configuration

To ensure the application works correctly on Railway, all required environment variables must be properly configured. The error logs indicate that the SMTP configuration is missing when the application is deployed.

### Required Environment Variables

For detailed information about required environment variables, see [Railway Environment Variables](./railway-environment-variables.md).

### Automated Setup Script (Recommended)

We've created a script to help you set up all required variables on Railway:

```bash
# Install dependencies if needed
npm install

# Run the Railway setup script
npm run railway:setup
```

This script will:

1. Check if Railway CLI is installed
2. Guide you through setting up all required variables
3. Set them in your Railway project automatically
4. Generate secure values for secrets when needed

### Manual Configuration

Alternatively, you can manually set environment variables in the Railway dashboard:

1. Go to your project on [Railway Dashboard](https://railway.app/dashboard)
2. Click on your project to open it
3. Navigate to the "Variables" tab in your project settings
4. Add each required environment variable with its value
5. Click "Deploy" to apply these changes

## Deployment Verification

After deploying your application on Railway, verify it's working correctly:

1. **Check the Healthcheck Endpoint**:
   - Visit `/healthcheck` on your deployed application
   - It should return a 200 OK response with service status

2. **Verify Email Configuration**:
   - Visit `/api/test-email` on your deployed application
   - This will attempt to send a test email and provide detailed diagnostic information
   - Check your super admin email account to confirm receipt

3. **Test Core Functionality**:
   - Test submitting a new application form
   - Verify admin panels load correctly
   - Check that chatbot functionality works
   - Verify maps and leads features for admin users

## Troubleshooting Email Issues

If email sending fails after configuring the environment variables:

1. **Verify Environment Variables**: Make sure all required environment variables are set:
   - Check Railway dashboard → Variables tab
   - Run `npm run check:env` locally to diagnose issues

2. **Check Email Provider Settings**: If using Gmail, make sure:
   - You're using an App Password (16-character password), not your regular password
   - The account has not been locked due to security concerns
   - The account has permission to send emails

3. **Test SMTP Connection**: Use the built-in test endpoint:

   ```http
   GET /api/test-email
   ```

   This endpoint will:
   - Check if all SMTP environment variables are set
   - Attempt to send a test email to your super admin email
   - Return detailed information about any errors encountered

4. **Inspect Logs**: Check Railway logs for specific SMTP error messages:
   - Look for "Missing SMTP configuration" or authentication errors
   - Check for connection timeouts or network issues
   - See if there are any rate limiting messages

5. **Common Gmail Issues**:
   - App Password required (not regular password)
   - Enable "less secure apps" for non-Google accounts
   - Check for account login blocking due to suspicious activity

## Recommended Best Practices

1. **Use Railway Secret Variables**: For sensitive information like API keys and passwords.

2. **Set NODE_ENV**: Always set `NODE_ENV=production` for production deployments.

3. **Regular Monitoring**: Check application logs periodically for email delivery issues.

4. **Testing**: After any configuration changes, test email functionality using the `/api/test-email` endpoint.

## Additional Resources

- [Railway Environment Variables Documentation](./railway-environment-variables.md)
- [Email Configuration Guide](./email-configuration.md)
- [Deployment Checklist](./deployment-checklist.md)

3. **Health Checks**: Ensure the health check endpoint (`/healthcheck`) correctly verifies all critical services, including email.

4. **Error Handling**: Implement graceful fallbacks for email failures, such as queuing failed emails for retry.
