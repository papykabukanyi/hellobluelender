/**
 * Script to verify the Super Admin configuration
 * 
 * This script checks if:
 * 1. The super admin user exists with the SMTP email
 * 2. The super admin has the correct password (admin123)
 * 3. The super admin has all required permissions
 * 4. The super admin is included in the email recipients list
 */

import Redis from 'ioredis';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables manually from .env.local
function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '..', '.env.local');
    const content = fs.readFileSync(envPath, 'utf8');
    
    content.split('\n').forEach(line => {
      if (!line || line.trim().startsWith('#')) return;
      
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^['"]|['"]$/g, ''); // Remove quotes if present
        process.env[key] = value;
      }
    });
    
    console.log('✅ Loaded environment variables from .env.local');
  } catch (err) {
    console.error('❌ Failed to load .env.local file:', err.message);
  }
}

// Load environment variables
loadEnvFile();

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL);

async function verifyAdminConfig() {
  try {
    console.log('Verifying Super Admin Configuration...');    // Use the hardcoded superadmin email for verification
    const superAdminEmail = 'papy@hempire-enterprise.com';
    console.log(`Expected Super Admin Email: ${superAdminEmail}`);
    
    // 1. Check if super admin user exists
    const adminJson = await redis.get(`admin:${superAdminEmail}`);
    if (!adminJson) {
      console.error('❌ ERROR: Super admin user does not exist!');
      process.exit(1);
    }
    
    const admin = JSON.parse(adminJson);
    console.log('✅ Super admin user exists');    // 2. Check password (without revealing the actual hash)
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
    const superAdminInRecipients = recipients.some(r => r.email === superAdminEmail);
    
    if (!superAdminInRecipients) {
      console.error('❌ ERROR: Super admin is not in the email recipients list!');
      process.exit(1);
    }
    console.log('✅ Super admin is in the email recipients list');
    
    // 5. Check if the superadmin is active in the recipients list
    const superAdminActive = recipients.some(r => r.email === superAdminEmail && r.active === true);
    if (!superAdminActive) {
      console.error('❌ ERROR: Super admin is in recipients list but not marked as active!');
      process.exit(1);
    }
    console.log('✅ Super admin is active in the email recipients list');
    
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
