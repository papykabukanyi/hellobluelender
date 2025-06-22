# Super Admin Permissions

## Overview

This document explains the special permissions granted to the super admin in the Hempire Enterprise application.

## Super Admin Definition

The super admin is automatically defined by the `SMTP_USER` environment variable. This ensures that the account used for system emails also has full administrative control over the application.

## Special Permissions

The super admin has the following special permissions that regular admins do not have:

1. **Application Deletion**: Only the super admin can permanently delete applications from the system
2. **Admin Management**: The super admin can add, edit, and delete other admin users
3. **System Configuration**: The super admin can modify system-wide settings
4. **Unlimited Session Duration**: The super admin's session does not time out due to inactivity
5. **Cannot Be Deleted**: The super admin account cannot be deleted through the admin interface

## Implementation Details

### Application Deletion

- The DELETE endpoint in `/api/admin/applications` verifies that the requesting user is the super admin
- The application detail page only shows the Delete button to the super admin
- A confirmation dialog prevents accidental deletions
- When an application is deleted:
  - The application is removed from the Redis database
  - The application ID is removed from the applications set
  - All associated data is permanently deleted

### Admin Management

- The super admin cannot be modified or deleted through the admin interface
- Regular admin accounts cannot have the same email as the super admin
- The super admin is always active and has all permissions enabled

### Security Considerations

1. **Environment Variables**: The `SMTP_USER` and `NEXT_PUBLIC_SMTP_USER` values should be kept secure
2. **Password Protection**: The super admin password should be strong and changed regularly
3. **Access Control**: The super admin should be the only user with complete system access
4. **Audit Trail**: All super admin actions are logged for security purposes

## Testing Super Admin Functionality

To test the super admin functionality:

1. Sign in with the super admin account (email matching `SMTP_USER` in environment variables)
2. Navigate to an application detail page
3. Verify that the Delete Application button is visible
4. Test the deletion functionality on a test application
5. Confirm that regular admin users cannot see or access the deletion functionality
