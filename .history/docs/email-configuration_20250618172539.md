# Blue Lender Email Configuration

This document explains how email notifications work in the Blue Lender application.

## Overview

When a new loan application is submitted, email notifications are automatically sent to:

1. The SMTP owner email (configured in environment variables)
2. All active email recipients added in the admin panel

## SMTP Configuration 

The SMTP configuration is stored in environment variables:

- `SMTP_HOST`: SMTP server hostname
- `SMTP_PORT`: SMTP server port
- `SMTP_USER`: SMTP username (also used as the main admin email)
- `SMTP_PASS`: SMTP password
- `SMTP_FROM`: From email address
- `SMTP_FROM_NAME`: From name for emails

The SMTP owner (`SMTP_USER`) will **always** receive application notifications, regardless of whether they are listed in the email recipients panel.

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
