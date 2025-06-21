# Database Migration Guide

This document describes the migration from Redis to a relational PostgreSQL database for the Blue Lender application.

## Why We Migrated

The Blue Lender application was originally built using Redis as a key-value store. While Redis provided simplicity and speed, as the application grew, we needed a more robust solution with the following benefits:

1. **Proper Data Relationships**: A relational database allows us to model the complex relationships between applications, applicants, businesses, and documents.
2. **Data Integrity**: Foreign key constraints ensure that related data is always consistent.
3. **Structured Queries**: SQL provides powerful querying capabilities for reporting and analytics.
4. **Transaction Support**: Ensures data consistency during multi-step operations.
5. **Better Schema Management**: Allows for proper data types, constraints, and validation.

## Database Schema

The new database schema includes the following tables:

- **Application**: Stores core application data with 6-digit application IDs
- **PersonalInfo**: Stores applicant personal information
- **BusinessInfo**: Stores business details
- **LoanInfo**: Stores loan request details
- **CoApplicantInfo**: Stores co-applicant information (optional)
- **Document**: Tracks uploaded documents
- **AdminUser**: Stores admin user accounts with role-based permissions
- **AdminSession**: Manages admin session timeouts
- **EmailRecipient**: Manages email notification recipients
- **SMTPConfig**: Stores SMTP configuration

## Key Changes

### 6-Digit Application Numbers

All application IDs are now 6-digit numbers (100000 to 999999). This provides:

- More user-friendly application references
- Easier verbal communication of application IDs
- Professional appearance in communications
- Sufficient capacity for over 900,000 applications

### Relational Structure

- Each application is now properly linked to its related data (personal info, business info, etc.)
- Documents are linked to their respective applications
- Sub-admins are linked to the admin who created them
- Sessions are linked to their respective admin users

### Data Migration Process

The migration process involves:

1. Creating the PostgreSQL schema with Prisma ORM
2. Migrating all data from Redis to PostgreSQL
3. Converting UUIDs to 6-digit application numbers
4. Establishing proper relationships between entities
5. Validating data integrity after migration

## Technical Implementation

### Prisma ORM

We're using Prisma ORM for database interactions, which provides:

- Type-safe database access
- Auto-generated TypeScript types
- Migration management
- Connection pooling
- Query optimization

### Migration Scripts

The migration is handled by scripts in the `scripts/` directory:

- `migrate-to-postgres.js`: Handles the one-time migration from Redis
- `init-database.js`: Initializes the super admin account

### Environment Configuration

To use the PostgreSQL database, set the following in your .env.local file:

```env
DATABASE_URL="postgresql://username:password@hostname:port/database?schema=public"
```

## Maintaining Both Systems During Transition

During the migration period, both Redis and PostgreSQL are maintained to ensure a smooth transition:

1. All new applications are stored in PostgreSQL with 6-digit IDs
2. The application continues to read from both systems during the transition
3. A mapping between old UUIDs and new 6-digit IDs is temporarily maintained

## Validation

To validate the migration:

1. Run the database migration: `npm run db:migrate`
2. Initialize the database: `npm run db:init`
3. Verify super admin setup: `npm run verify:super-admin`
4. Validate application data integrity through the admin panel
