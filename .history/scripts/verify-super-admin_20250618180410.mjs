/**
 * Script to verify the Super Admin configuration
 * 
 * This script checks if:
 * 1. The super admin user exists with the SMTP email
 * 2. The super admin has the correct password (admin123)
 * 3. The super admin has all required permissions
 * 4. The super admin is included in the email recipients list
 */

import { config } from 'dotenv';
import Redis from 'ioredis';
import bcrypt from 'bcrypt';

// Load environment variables
config({ path: '.env.local' });

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL);

async function verifyAdminConfig() {
  try {
    console.log('Verifying Super Admin Configuration...');
    
    // Get SMTP email from environment variables
    const smtpEmail = process.env.SMTP_USER || 'admin@bluelender.com';
    console.log(`Expected Super Admin Email: ${smtpEmail}`);
    
    // 1. Check if super admin user exists
    const adminJson = await redis.get(`admin:${smtpEmail}`);
    if (!adminJson) {
      console.error('❌ ERROR: Super admin user does not exist!');
      process.exit(1);
    }
    
    const admin = JSON.parse(adminJson);
    console.log('✅ Super admin user exists');
    
    // 2. Check password (without revealing the actual hash)
    const isCorrectPassword = await bcrypt.compare('admin123', admin.password);
    if (!isCorrectPassword) {
      console.error('❌ ERROR: Super admin password is not set to "admin123"!');
      process.exit(1);
    }
    console.log('✅ Super admin password is correctly set to "admin123"');
    
    // 3. Check permissions
    const hasAllPermissions = 
      admin.role === 'admin' && 
      admin.permissions?.viewApplications === true && 
      admin.permissions?.manageAdmins === true &&
      admin.permissions?.manageSmtp === true &&
      admin.permissions?.manageRecipients === true;
    
    if (!hasAllPermissions) {
      console.error('❌ ERROR: Super admin does not have all required permissions!');
      console.log('Current permissions:', admin.permissions);
      process.exit(1);
    }
    console.log('✅ Super admin has all required permissions');
    
    // 4. Check if super admin is in the email recipients list
    const recipientsJson = await redis.get('email:recipients');
    if (!recipientsJson) {
      console.error('❌ ERROR: No email recipients configured!');
      process.exit(1);
    }
    
    const recipients = JSON.parse(recipientsJson);
    const superAdminInRecipients = recipients.some(r => r.email === smtpEmail);
    
    if (!superAdminInRecipients) {
      console.error('❌ ERROR: Super admin is not in the email recipients list!');
      process.exit(1);
    }
    console.log('✅ Super admin is in the email recipients list');
    
    // All checks passed
    console.log('✅ Super admin configuration verified successfully.');
    
  } catch (error) {
    console.error('Error verifying super admin config:', error);
    process.exit(1);
  } finally {
    // Close Redis connection
    redis.quit();
  }
}

verifyAdminConfig();
