# Blue Lender Admin Permission System

This document outlines the permission system implemented for Blue Lender's admin panel.

## Permission Types

The system has four main permission types:

1. **viewApplications** - Allows viewing loan applications
2. **manageAdmins** - Allows adding, editing, and removing admin users
3. **manageSmtp** - Allows viewing and testing SMTP configuration
4. **manageRecipients** - Allows managing email recipients for applications

## Admin Types

### Super Admin

- The super admin is automatically synced with the SMTP email configuration (`SMTP_USER` env variable)
- Always has the fixed password `admin123` (should be changed after first login for security)
- Has full access to all parts of the system (all permissions enabled)
- Cannot be deleted or have permissions revoked through the admin UI or API
- Always receives all application submissions automatically as the first recipient
- If the SMTP configuration changes, the super admin account is automatically updated
- Previous super admin accounts are removed when the SMTP email changes to prevent confusion

### Sub-Admins

- Created by the super admin or admins with `manageAdmins` permission
- Can be given customized permissions based on their role
- By default, only have `viewApplications` permission
- Cannot delete the super admin or modify their own permissions

## Implementation Details

### Authentication Flow

1. Login via `/api/auth/login` - JWT token is issued with user info including permissions
2. Auth checks via `/api/auth/verify` - User status and permissions are verified on each request
3. Permission checking with `AuthCheck` component - UI-level permission control
4. API permission guards with `requirePermission` utility - Backend permission control

### UI Permission Controls

- Sidebar menu items are dynamically shown/hidden based on permissions
- Pages check for required permissions using `AuthCheck` component
- Permission-denied messages guide users back to authorized areas

### API Permission Controls

- All admin API endpoints check for appropriate permissions
- The `requirePermission` utility enforces access control consistently
- Main admin always has access to all functions regardless of explicit permissions

## Testing

### Test Permissions System

You can test the permission system with:

```bash
npm run test:permissions
```

This will create a test sub-admin user with limited permissions for testing the system.

### Verify Super Admin Configuration

You can verify that the super admin is properly configured with:

```bash
npm run verify:super-admin
```

This will check:
1. The super admin exists with the correct SMTP email
2. The super admin has the password set to `admin123`
3. The super admin has all required permissions enabled
4. The super admin is included in the email recipients list

## Recommendations

1. Always log in as a sub-admin to test permission restrictions
2. Periodically review admin accounts and permissions
3. Keep the super admin credentials secure as this account has full system access
4. Change the default password (`admin123`) immediately after setting up the SMTP configuration
