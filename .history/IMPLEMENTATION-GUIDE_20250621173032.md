# Email, Session, and Compliance Implementation Guide

This document provides an overview of the comprehensive email notification system, session management, and regulatory compliance features implemented in the Hempire Enterprise application.

## 1. Email Notification System

### Core Email Functionality (`src/lib/email.ts`)

We've implemented a robust email sending system with the following features:

- **Transporter Caching**: The system caches the email transporter for 30 minutes to improve performance and reduce connection overhead.
- **Connection Pooling**: Allows multiple emails to be sent over the same connection.
- **Timeouts**: Prevents hanging connections with 10s connection and 20s socket timeouts.
- **TLS Security**: Ensures secure email transmission with certificate verification.
- **Input Validation**: Validates recipient email format before attempting to send.
- **Error Classification**: Distinguishes between transient errors (worth retrying) and permanent failures.
- **Retry Mechanism**: Uses exponential backoff (1s, 2s, 4s) for transient failures.
- **Compliance Headers**: X-Priority, X-Auto-Response-Suppress, X-Report-Abuse, List-Unsubscribe.

### Email Templates (`src/lib/templates/statusEmails.ts`)

Professional HTML email templates for different application statuses:
- **Approved**: Congratulatory messaging with next steps.
- **Denied**: Sensitively worded rejection with alternative options.
- **In-Review**: Information about the review process and timeline.

### Application Submission Email (`src/app/api/application/submit/route.ts`)

- **Admin Notification**: Detailed notification with application information and PDF attachment.
- **Applicant Confirmation**: Professional receipt with application details and PDF copy.
- **Failed Email Queue**: Stores failed emails in Redis for later retry.

### Status Update Emails (`src/app/api/admin/applications/route.ts`)

- Sends appropriate status update emails when application status changes.
- Uses status-specific templates for approved, denied, and in-review statuses.
- Implements error handling to prevent API failure if email sending fails.

## 2. Session Management (`src/components/SessionManager.tsx`)

- **90-Minute Inactivity Timeout**: Shows warning after 89 minutes of inactivity.
- **Warning Popup**: Displays a 1-minute countdown before automatic logout.
- **Notification Sound**: Plays `/public/notification.mp3` to alert users.
- **Activity Detection**: Monitors mouse, keyboard, scroll, and touch events.
- **Persistent Tracking**: Stores last activity in localStorage for reliability.
- **Session Refresh**: API call to refresh the session when user indicates they want to stay logged in.
- **Super Admin Exemption**: Super admins are not subject to the timeout.

## 3. Cookie Consent (`src/components/CookieConsent.tsx`)

A comprehensive cookie consent system that:

- **Appears on First Visit**: Shows up automatically for new visitors.
- **Offers Customization**: Users can choose which cookie categories to accept.
- **Categorizes Cookies**: Necessary (required), Functional, Analytics, Marketing.
- **Stores Preferences**: Saves settings in both localStorage and cookies.
- **Records Timestamp**: Captures when consent was given for compliance.
- **Broadcasts Events**: Triggers custom events for scripts that depend on cookie consent.
- **Provides Visual Appeal**: Smooth animations and professional design.
- **Site Integration**: Integrated into the main layout (`src/app/layout.tsx`).

## Usage Notes

### Email System

The email system automatically handles:
- Application submission notifications
- Status update emails
- Error handling and retries

No manual intervention is required for normal operation.

### Session Management

The session timeout warning will:
- Appear after 89 minutes of inactivity
- Give the user 1 minute to respond
- Play a notification sound
- Auto-logout if no response

### Cookie Consent

The cookie consent popup:
- Appears on first visit
- Remembers user choices
- Can be customized with detailed preferences

## Best Practices

1. **Monitor Email Delivery**: Check logs periodically for failed emails.
2. **Test Session Timeout**: Verify session management works in all browsers.
3. **Cookie Compliance**: Keep the consent mechanism up to date with changing regulations.

## Future Improvements

1. Implement a scheduled job to retry failed emails from the Redis queue.
2. Add server-side logging of cookie consent for audit purposes.
3. Consider adding email delivery tracking and analytics.
