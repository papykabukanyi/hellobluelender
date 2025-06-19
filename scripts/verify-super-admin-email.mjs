import { config } from 'dotenv';
import Redis from 'ioredis';

// Load environment variables
config({ path: '.env.local' });

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL);

async function validateSuperAdmin() {
  try {
    console.log('Verifying Super Admin and Email Recipients Configuration...');
    
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
    
    // 2. Check permissions
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
    
    // 3. Check if there are any duplicate admin accounts with the same email
    const adminKeys = await redis.keys('admin:*');
    let duplicateFound = false;
    
    for (const adminKey of adminKeys) {
      const adminEmail = adminKey.replace('admin:', '');
      if (adminEmail !== smtpEmail) {
        const otherAdminJson = await redis.get(adminKey);
        if (otherAdminJson) {
          const otherAdmin = JSON.parse(otherAdminJson);
          if (otherAdmin.email === smtpEmail) {
            console.error(`❌ ERROR: Duplicate admin found with super admin email: ${adminKey}`);
            duplicateFound = true;
          }
        }
      }
    }
    
    if (!duplicateFound) {
      console.log('✅ No duplicate admin accounts with super admin email');
    } else {
      process.exit(1);
    }
    
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
    
    // 5. Check if there are any duplicate email entries in the recipients list
    const superAdminEmailEntries = recipients.filter(r => r.email === smtpEmail);
    if (superAdminEmailEntries.length > 1) {
      console.error(`❌ ERROR: Multiple entries (${superAdminEmailEntries.length}) for the super admin email in recipients list!`);
      process.exit(1);
    }
    console.log('✅ No duplicate super admin entries in email recipients');
    
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

validateSuperAdmin();
