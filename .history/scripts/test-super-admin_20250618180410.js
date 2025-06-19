// Test script to verify super admin synchronization with SMTP config

const { createClient } = require('redis');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// Create Redis client
const redis = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });

async function main() {
  // Connect to Redis
  await redis.connect();
  console.log('Connected to Redis');
  
  // Set up mock environment variables
  process.env.SMTP_USER = 'superadmin@bluelender.com';
  process.env.SMTP_FROM_NAME = 'Blue Lender Super Admin';
  
  console.log('----- Testing Super Admin Synchronization -----');
  
  // 1. Create a function similar to our initialize.ts
  async function setupSuperAdmin() {
    const smtpEmail = process.env.SMTP_USER;
    const smtpName = process.env.SMTP_FROM_NAME;
    
    // Check if super admin user already exists
    const adminExists = await redis.exists(`admin:${smtpEmail}`);
    
    if (!adminExists) {
      // Create super admin user with password 'admin123'
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const adminUser = {
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
      console.log(`Super admin created with email: ${smtpEmail}`);
      return adminUser;
    } else {
      console.log(`Super admin already exists with email: ${smtpEmail}`);
      const adminJson = await redis.get(`admin:${smtpEmail}`);
      return JSON.parse(adminJson);
    }
  }
  
  const superAdmin = await setupSuperAdmin();
  
  // 2. Verify super admin credentials
  console.log('Super Admin:', {
    email: superAdmin.email,
    role: superAdmin.role,
    permissions: superAdmin.permissions
  });
  
  // 3. Verify password is 'admin123'
  const passwordCheck = await bcrypt.compare('admin123', superAdmin.password);
  console.log(`Password check ('admin123'): ${passwordCheck ? 'PASSED' : 'FAILED'}`);
  
  // 4. Add to email recipients
  const recipientsExist = await redis.exists('email:recipients');
  if (!recipientsExist) {
    const defaultRecipient = {
      id: uuidv4(),
      name: process.env.SMTP_FROM_NAME,
      email: process.env.SMTP_USER,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await redis.set('email:recipients', JSON.stringify([defaultRecipient]));
    console.log('Email recipient added for super admin');
  }
  
  // 5. Simulate application submission logic
  const recipients = JSON.parse(await redis.get('email:recipients') || '[]');
  const activeRecipients = recipients.filter(r => r.active);
  
  // Create recipient list with SMTP email first
  const emailRecipients = [process.env.SMTP_USER];
  
  // Add other active recipients
  activeRecipients.forEach(recipient => {
    if (recipient.email !== process.env.SMTP_USER && !emailRecipients.includes(recipient.email)) {
      emailRecipients.push(recipient.email);
    }
  });
  
  console.log('Application would be sent to:', emailRecipients);
  
  // Clean up test data if needed
  // await redis.del(`admin:${process.env.SMTP_USER}`);
  
  // Disconnect from Redis
  await redis.disconnect();
  console.log('----- Test completed -----');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
