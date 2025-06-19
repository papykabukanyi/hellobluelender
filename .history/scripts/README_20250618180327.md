# Blue Lender Scripts

This directory contains utility scripts for Blue Lender project.

## Available Scripts

### `test-permissions.js`

Tests the permission system by creating test admin accounts with limited permissions.

```bash
npm run test:permissions
```

### `verify-super-admin.mjs`

Verifies that the super admin is properly configured according to the requirements.

```bash
npm run verify:super-admin
```

This script checks:

1. The super admin exists with the SMTP email from environment variables
2. The super admin password is set to `admin123`
3. The super admin has all required permissions enabled
4. The super admin is included in the email recipients list

## Running Scripts

All scripts can be run through npm commands defined in package.json.
