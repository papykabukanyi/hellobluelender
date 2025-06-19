import { AdminUser, EmailRecipient, SMTPConfig } from '@/types';
import redis from '@/lib/redis';
import { hashPassword } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function initializeAdminData() {
  try {
    // Get SMTP email and name from environment variables - this will be the super admin
    const smtpEmail = process.env.SMTP_USER || 'admin@bluelender.com';
    const smtpName = process.env.SMTP_FROM_NAME || 'Super Admin';
    
    // 1. Initialize super admin user based on SMTP_USER
    await initializeSuperAdmin(smtpEmail);
    
    // 2. Initialize email recipients
    await initializeEmailRecipients(smtpEmail, smtpName);
    
    // 3. Clean up any legacy admin accounts if needed
    await cleanupLegacyAdmins(smtpEmail);
    
    // SMTP config will be read directly from .env.local - not stored in Redis
    await redis.del('smtp:config');
    console.log('Using SMTP config from environment variables');
    
    return { success: true };
  } catch (error) {
    console.error('Error initializing admin data:', error);
    return { success: false, error };
  }
}

// Helper function to initialize super admin
async function initializeSuperAdmin(smtpEmail: string) {
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
}

// Helper function to clean up any legacy admin accounts
async function cleanupLegacyAdmins(smtpEmail: string) {
  if (smtpEmail !== 'admin@bluelender.com') {
    const legacyAdminExists = await redis.exists('admin:admin@bluelender.com');
    if (legacyAdminExists) {
      await redis.del('admin:admin@bluelender.com');
      console.log('Legacy admin account removed');
    }
  }
}

// Helper function to initialize email recipients
async function initializeEmailRecipients(smtpEmail: string, smtpName: string) {
  // Check if email recipients exist
  const recipientsExist = await redis.exists('email:recipients');
  
  if (!recipientsExist) {
    // Create default email recipient using SMTP email
    const defaultRecipient: EmailRecipient = {
      id: uuidv4(),
      name: smtpName,
      email: smtpEmail,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Store in Redis
    await redis.set('email:recipients', JSON.stringify([defaultRecipient]));
    
    console.log(`Default email recipient created with email: ${smtpEmail}`);
  } else {
    // If recipients exist, ensure the SMTP email is included
    const recipientsJson = await redis.get('email:recipients');
    if (recipientsJson) {
      const recipients = JSON.parse(recipientsJson) as EmailRecipient[];
      
      // Check if SMTP email is already in the recipients list
      const smtpRecipientExists = recipients.some(r => r.email === smtpEmail);
      
      if (!smtpRecipientExists) {
        // Add SMTP email as a recipient
        recipients.push({
          id: uuidv4(),
          name: smtpName,
          email: smtpEmail,
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        
        // Update recipients list
        await redis.set('email:recipients', JSON.stringify(recipients));
        console.log(`Added SMTP email ${smtpEmail} to recipients list`);
      }
    }
  }
}
