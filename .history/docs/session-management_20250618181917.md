# Session Management in Blue Lender Admin

This document explains how user sessions are managed in the Blue Lender admin panel.

## Session Duration

- Regular admin users: Sessions last for 1 hour of activity
- Super admin users: Sessions do not have inactivity timeout

## Inactivity Handling

### Regular Admin Users

- After 55 minutes of inactivity, a warning notification appears
- The warning gives a 5-minute countdown to extend the session
- If no action is taken, the user is automatically logged out after the 5 minutes
- Any user activity (mouse movement, clicks, typing, scrolling) resets the inactivity timer

### Super Admin Users

- The super admin (matching the SMTP email configuration) does not experience session timeouts
- This ensures uninterrupted access for the primary administrator

## Extending Sessions

Users can extend their session in two ways:

1. **Through normal activity**: Moving the mouse, clicking, typing, or scrolling during a session will automatically extend it
2. **Through the timeout warning**: When the timeout warning appears, clicking "Stay Logged In" will refresh the session for another hour

## Implementation Details

- Sessions use a JWT token stored in an HTTP-only cookie
- Initial token expiration is set to 1 hour
- The `SessionManager` component in the frontend tracks user activity
- The warning notification appears 5 minutes before session expiration
- The session refresh API endpoint (`/api/auth/refresh`) creates a new token when needed

## Security Considerations

- HTTP-only cookies protect against client-side script access to the auth token
- 1-hour timeout reduces the risk of unauthorized access if a user leaves their computer unattended
- Automatic logout ensures unattended sessions are terminated
- All session refreshes verify the user still exists in the database
