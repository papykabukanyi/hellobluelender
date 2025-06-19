# Blue Lender Super Admin and Email Configuration

This document explains the super admin role and how email notifications work in the Blue Lender application.

## Super Admin

The Blue Lender application has a super admin role that is automatically assigned to the account that matches the SMTP configuration email address (`SMTP_USER` environment variable). This super admin:

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
