# Hempire Enterprise Email Configuration and Troubleshooting

This document explains email functionality in the Hempire Enterprise application, including SMTP configuration, super admin role, and troubleshooting common email issues.

## Super Admin

The Hempire Enterprise application has a super admin role that is automatically assigned to the account that matches the SMTP configuration email address (`SMTP_USER` environment variable). This super admin:

1. Has full access to all system functions
2. Can add/remove other admin users
3. Can assign permissions to sub-admins
4. Always receives all loan application submissions
5. Uses the password `admin123` by default (should be changed)

## Overview

When a new loan application is submitted, email notifications are automatically sent to:

1. The super admin (SMTP owner email configured in environment variables)
2. All active email recipients added in the admin panel

## SMTP Configuration

The SMTP configuration is stored in environment variables:

- `SMTP_HOST`: SMTP server hostname
- `SMTP_PORT`: SMTP server port
- `SMTP_USER`: SMTP username (automatically becomes the super admin account)
- `SMTP_PASS`: SMTP password
- `SMTP_FROM`: From email address
- `SMTP_FROM_NAME`: From name for emails

The super admin (`SMTP_USER`) will **always** receive application notifications, regardless of whether they are listed in the email recipients panel.

## Email Recipients Management

The admin can add additional email recipients in the Admin Panel → Email Recipients section. Each recipient has:

- Name
- Email address
- Active status

Only recipients marked as "Active" will receive application notifications.

## Application Notification Process

1. When an application is submitted, the system automatically generates a PDF of the application
2. The system sends an email with the PDF attachment to:
   - The SMTP owner email (first recipient)
   - All active email recipients

## Security Considerations

- The SMTP owner always receives notifications, ensuring no applications are missed
- Email recipients can be easily added/removed by admins with appropriate permissions
- Application details (including signatures) are included in the PDF for comprehensive review

## Troubleshooting Email Issues

### Common Errors

#### "Missing SMTP configuration. Check environment variables."

This error occurs when the application cannot find the required SMTP environment variables. Ensure all variables listed in the SMTP Configuration section are properly set.

### Solutions

#### 1. Verify Environment Variables

Make sure all required SMTP variables are set in your environment:

**For local development**:
- Check your `.env.local` file contains all required variables
- Verify the values are correct (no typos, extra spaces, etc.)

**For Railway deployment**:
- Go to your project in Railway dashboard
- Check the "Variables" tab
- Verify all SMTP variables are present and have correct values

#### 2. Create App Password for Gmail

If using Gmail, you need to create an "App Password" instead of using your regular password:

1. Visit your Google Account security page: https://myaccount.google.com/security
2. Enable 2-Step Verification if not already enabled
3. Under "Signing in to Google," find "App passwords"
4. Select "Mail" as the app and "Other" as the device
5. Enter a name for the app password (e.g., "Hempire Enterprise")
6. Click "Generate"
7. Use the generated 16-character password as your `SMTP_PASS`

#### 3. Test SMTP Configuration

Use the built-in test endpoint to verify your SMTP configuration:

```
GET /api/test-email
```

This endpoint will test the connection and send a test email to verify configuration.

#### 4. Check Email Service Provider Restrictions

Some email providers have restrictions on sending emails from applications:

**Gmail**:
- Limited to 500 emails per day
- May block automated emails if they look like spam
- Requires App Passwords for applications

**Microsoft 365/Outlook**:
- May require specific authentication settings
- Often blocks emails from unknown applications

#### 5. Railway-specific Configuration

When deploying to Railway, make sure to:

1. Set all environment variables in the Railway dashboard
2. Use the included setup-railway.js script to automate this process
3. Verify variables are properly set after deployment
4. Check Railway logs for any SMTP-related errors
