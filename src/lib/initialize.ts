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
  // Create or update the super admin user with SMTP email
  const hashedPassword = await hashPassword('admin123');    // Always use the hardcoded superadmin email, if SMTP_USER is different, we'll handle both
  const superAdminEmail = 'papy@hempire-enterprise.com';
  
  // Check if super admin exists already
  const adminExists = await redis.exists(`admin:${superAdminEmail}`);
  
  const adminUser: AdminUser = {
    id: adminExists ? JSON.parse(await redis.get(`admin:${superAdminEmail}`)).id : uuidv4(),
    username: 'Super Admin',
    email: superAdminEmail,
    password: hashedPassword, // Use admin123 as the password
    role: 'admin',
    permissions: {
      viewApplications: true,
      manageAdmins: true,
      manageSmtp: true,
      manageRecipients: true
    },
    createdAt: adminExists ? 
      JSON.parse(await redis.get(`admin:${superAdminEmail}`)).createdAt :
      new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
    // Store in Redis - always update to ensure correct permissions and password
  await redis.set(`admin:${superAdminEmail}`, JSON.stringify(adminUser));
  
  console.log(`Super admin user created/updated with email: ${superAdminEmail}`);
  
  // If the SMTP email is different from the superadmin email, remove any admin with that email
  // This ensures there's no confusion and only the superadmin has admin access
  if (smtpEmail !== superAdminEmail && await redis.exists(`admin:${smtpEmail}`)) {
    await redis.del(`admin:${smtpEmail}`);
    console.log(`Removed alternate admin account with email: ${smtpEmail}`);
  }
}

// Helper function to clean up any legacy admin accounts - now REMOVES ALL admin accounts except superadmin
async function cleanupLegacyAdmins(smtpEmail: string) {  // Get all admin keys
  const adminKeys = await redis.keys('admin:*');
  const superAdminEmail = 'papy@hempire-enterprise.com';
  
  console.log(`Cleaning up all admin accounts except superadmin: ${superAdminEmail}`);
  
  // Go through each admin account and delete everything except the superadmin
  for (const adminKey of adminKeys) {
    const adminEmail = adminKey.replace('admin:', '');
    
    // Skip the superadmin account - this is the ONLY account we keep
    if (adminEmail === superAdminEmail) continue;
    
    // Delete any other admin account
    await redis.del(adminKey);
    console.log(`Removed admin account: ${adminEmail}`);
  }
    console.log('All admin accounts except superadmin have been removed');
}

// Helper function to initialize email recipients
async function initializeEmailRecipients(smtpEmail: string, smtpName: string) {  // Always ensure the superadmin email is included
  const superAdminEmail = 'papy@hempire-enterprise.com';
  const superAdminName = 'Super Admin';
  
  // Check if email recipients exist
  const recipientsExist = await redis.exists('email:recipients');
  
  if (!recipientsExist) {
    // Create recipients list with superadmin and SMTP email (if different)
    const recipients: EmailRecipient[] = [
      {
        id: uuidv4(),
        name: superAdminName,
        email: superAdminEmail,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];
    
    // Add SMTP user if different
    if (smtpEmail !== superAdminEmail) {
      recipients.push({
        id: uuidv4(),
        name: smtpName,
        email: smtpEmail,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    
    // Store in Redis
    await redis.set('email:recipients', JSON.stringify(recipients));
    
    console.log(`Email recipients initialized with superadmin: ${superAdminEmail}`);  } else {
    // If recipients exist, ensure the superadmin is included and no duplicates exist
    const recipientsJson = await redis.get('email:recipients');
    if (recipientsJson) {
      let recipients = JSON.parse(recipientsJson) as EmailRecipient[];
      
      // Check if superadmin email is already in recipients list
      const superAdminEmail = 'papy@hempire-entreprise.com';
      const superAdminExists = recipients.some(r => r.email === superAdminEmail);
      
      // First, remove any duplicate superadmin entries to ensure one clean entry
      if (superAdminExists) {
        // Keep only the first instance of superadmin
        let foundFirst = false;
        recipients = recipients.filter(r => {
          if (r.email === superAdminEmail) {
            if (!foundFirst) {
              foundFirst = true;
              return true;
            }
            return false;
          }
          return true;
        });
      }
      
      // If superadmin doesn't exist at all, add it
      if (!superAdminExists) {
        recipients.push({
          id: uuidv4(),
          name: 'Super Admin',
          email: superAdminEmail,
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        console.log(`Added superadmin email ${superAdminEmail} to recipients list`);
      } else {
        // Ensure superadmin is always active
        recipients = recipients.map(r => {
          if (r.email === superAdminEmail) {
            return {
              ...r,
              name: 'Super Admin',
              active: true,
              updatedAt: new Date().toISOString()
            };
          }
          return r;
        });
        console.log(`Updated superadmin email recipient: ${superAdminEmail}`);
      }
      
      // Now handle SMTP email if it's different from superadmin
      if (smtpEmail !== superAdminEmail) {
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
          console.log(`Added SMTP email ${smtpEmail} to recipients list`);
        } else {
          // Update SMTP recipient info
          recipients = recipients.map(r => {
            if (r.email === smtpEmail) {
              return {
                ...r,
                name: smtpName,
                active: true,
                updatedAt: new Date().toISOString()
              };
            }
            return r;
          });
        }
      }
      
      // Update recipients list in Redis
      await redis.set('email:recipients', JSON.stringify(recipients));
    }
  }
}
