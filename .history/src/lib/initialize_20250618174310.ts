import { AdminUser, EmailRecipient, SMTPConfig } from '@/types';
import redis from '@/lib/redis';
import { hashPassword } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function initializeAdminData() {
  try {
    // Get SMTP email from environment variables - this will be the super admin
    const smtpEmail = process.env.SMTP_USER || 'admin@bluelender.com';
    
    // Check if super admin user already exists
    const adminExists = await redis.exists(`admin:${smtpEmail}`);
    
    if (!adminExists) {
      // Create super admin user with password 'admin123'
      const hashedPassword = await hashPassword('admin123'); 
      const adminUser: AdminUser = {
        id: uuidv4(),
        username: 'Super Admin',
        email: smtpEmail,
        password: hashedPassword,
        role: 'admin',
        permissions: {
          viewApplications: true,
          manageAdmins: true,
          manageSmtp: true,
          manageRecipients: true
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Store in Redis
      await redis.set(`admin:${smtpEmail}`, JSON.stringify(adminUser));
      
      console.log(`Super admin user created with email: ${smtpEmail}`);
    }
    
    // If there's a legacy admin account with default email and it's not the same as SMTP email, remove it
    if (smtpEmail !== 'admin@bluelender.com') {
      const legacyAdminExists = await redis.exists('admin:admin@bluelender.com');
      if (legacyAdminExists) {
        await redis.del('admin:admin@bluelender.com');
        console.log('Legacy admin account removed');
      }
    }
      // Check if email recipients exist
    const recipientsExist = await redis.exists('email:recipients');
    
    if (!recipientsExist) {      // Create default email recipient
      const defaultRecipient: EmailRecipient = {
        id: uuidv4(),
        name: 'Admin User',
        email: 'admin@bluelender.com',
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Store in Redis
      await redis.set('email:recipients', JSON.stringify([defaultRecipient]));
      
      console.log('Default email recipient created');
    }
      // SMTP config will be read directly from .env.local - not stored in Redis
    // Delete any existing SMTP config from Redis to ensure it's always using env variables
    await redis.del('smtp:config');
    console.log('Using SMTP config from environment variables');
    
    return { success: true };
  } catch (error) {
    console.error('Error initializing admin data:', error);
    return { success: false, error };
  }
}
