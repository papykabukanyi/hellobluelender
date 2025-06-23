#!/usr/bin/env node

/**
 * Script to reset all admin accounts except superadmin
 * 
 * This script:
 * 1. Sets superadmin credentials to papy@hempire-entreprise.com with password Admin001
 * 2. Removes all other admin accounts
 * 3. Ensures the superadmin has all permissions
 * 4. Makes sure the superadmin is included in email recipients
 */

import Redis from 'ioredis';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
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

// Define new superadmin details
const SUPER_ADMIN_EMAIL = 'papy@hempire-enterprise.com';
const SUPER_ADMIN_PASSWORD = 'Admin001';
const SUPER_ADMIN_NAME = 'Super Admin';

async function resetAdmins() {
  let redisClient;

  try {
    console.log('🚀 Starting admin reset process...');

    // Create Redis client
    redisClient = new Redis(process.env.REDIS_URL);
    console.log('✅ Connected to Redis');

    // 1. Hash the new password
    const hashedPassword = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);
    console.log('✅ Generated password hash');

    // 2. Get all admin keys to remove them later
    const adminKeys = await redisClient.keys('admin:*');
    console.log(`Found ${adminKeys.length} admin accounts in the system`);

    // 3. Create or update the superadmin user
    const adminExists = await redisClient.exists(`admin:${SUPER_ADMIN_EMAIL}`);
    
    let superAdminId;
    if (adminExists) {
      const existingAdmin = JSON.parse(await redisClient.get(`admin:${SUPER_ADMIN_EMAIL}`));
      superAdminId = existingAdmin.id;
      console.log('✅ Found existing superadmin account, will update');
    } else {
      superAdminId = uuidv4();
      console.log('✅ Creating new superadmin account');
    }

    const superAdmin = {
      id: superAdminId,
      username: SUPER_ADMIN_NAME,
      email: SUPER_ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
      permissions: {
        viewApplications: true,
        manageAdmins: true,
        manageSmtp: true,
        manageRecipients: true
      },
      createdAt: adminExists ? 
        JSON.parse(await redisClient.get(`admin:${SUPER_ADMIN_EMAIL}`)).createdAt :
        new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 4. Store the superadmin in Redis
    await redisClient.set(`admin:${SUPER_ADMIN_EMAIL}`, JSON.stringify(superAdmin));
    console.log(`✅ Superadmin created/updated with email: ${SUPER_ADMIN_EMAIL}`);

    // 5. Remove all other admin accounts
    for (const adminKey of adminKeys) {
      const adminEmail = adminKey.replace('admin:', '');
      if (adminEmail !== SUPER_ADMIN_EMAIL) {
        await redisClient.del(adminKey);
        console.log(`❌ Removed admin account: ${adminEmail}`);
      }
    }
    console.log('✅ Cleaned up all other admin accounts');

    // 6. Update environment variables if they don't match
    if (process.env.SMTP_USER !== SUPER_ADMIN_EMAIL) {
      console.log(`⚠️ Warning: Current SMTP_USER (${process.env.SMTP_USER}) doesn't match superadmin email (${SUPER_ADMIN_EMAIL})`);
      console.log('⚠️ Please update your .env.local file to set SMTP_USER=' + SUPER_ADMIN_EMAIL);
    }

    // 7. Update email recipients list to include superadmin
    const recipientsJson = await redisClient.get('email:recipients');
    let recipients = [];
    
    if (recipientsJson) {
      recipients = JSON.parse(recipientsJson);
      
      // Remove any duplicates of the superadmin email
      recipients = recipients.filter(r => r.email !== SUPER_ADMIN_EMAIL);
    }
    
    // Add the superadmin as a recipient
    recipients.push({
      id: uuidv4(),
      name: SUPER_ADMIN_NAME,
      email: SUPER_ADMIN_EMAIL,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    await redisClient.set('email:recipients', JSON.stringify(recipients));
    console.log('✅ Updated email recipients list with superadmin');

    console.log('\n🎉 All done! Super Admin account has been configured:');
    console.log(`Email: ${SUPER_ADMIN_EMAIL}`);
    console.log(`Password: ${SUPER_ADMIN_PASSWORD}`);
    console.log('This account has full permissions to the admin dashboard.');

  } catch (error) {
    console.error('❌ Error during reset:', error);
  } finally {
    if (redisClient) {
      await redisClient.quit();
      console.log('✅ Closed Redis connection');
    }
  }
}

resetAdmins();
