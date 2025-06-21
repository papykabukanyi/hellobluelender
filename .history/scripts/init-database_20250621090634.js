import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Initialize the PostgreSQL database with the super admin
 * The super admin's email is taken from the SMTP_USER environment variable
 * The super admin's password is always "admin123"
 */
async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Get SMTP user from environment (super admin)
    const smtpUser = process.env.SMTP_USER || 'admin@bluelender.com';
    const superAdminPassword = 'admin123';
    
    console.log(`Setting up super admin with email: ${smtpUser}`);
    
    // Check if super admin exists
    const existingSuperAdmin = await prisma.adminUser.findFirst({
      where: {
        email: smtpUser,
      },
    });
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(superAdminPassword, 10);
    
    if (existingSuperAdmin) {
      // Update super admin to ensure it has all permissions
      console.log('Super admin already exists, updating permissions...');
      
      await prisma.adminUser.update({
        where: { id: existingSuperAdmin.id },
        data: {
          password: hashedPassword,
          role: 'admin',
          viewApplications: true,
          manageAdmins: true,
          manageSmtp: true,
          manageRecipients: true,
        },
      });
      
      console.log('Super admin permissions updated successfully');
    } else {
      // Create new super admin
      console.log('Creating new super admin account...');
      
      await prisma.adminUser.create({
        data: {
          username: smtpUser.split('@')[0], // Use part before @ as username
          email: smtpUser,
          password: hashedPassword,
          role: 'admin',
          viewApplications: true,
          manageAdmins: true,
          manageSmtp: true,
          manageRecipients: true,
        },
      });
      
      console.log('Super admin created successfully');
    }
    
    // Remove any legacy super admin accounts
    console.log('Checking for legacy admin accounts...');
    
    const legacyAdmins = await prisma.adminUser.findMany({
      where: {
        role: 'admin',
        NOT: {
          email: smtpUser,
        },
      },
    });
    
    if (legacyAdmins.length > 0) {
      console.log(`Found ${legacyAdmins.length} legacy admin accounts, updating roles to sub-admin...`);
      
      for (const admin of legacyAdmins) {
        await prisma.adminUser.update({
          where: { id: admin.id },
          data: {
            role: 'sub-admin',
            // Remove super admin permissions
            manageAdmins: false,
            manageSmtp: false,
          },
        });
      }
      
      console.log('Legacy admin accounts updated successfully');
    } else {
      console.log('No legacy admin accounts found');
    }
    
    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the initialization
initializeDatabase()
  .catch(console.error);
