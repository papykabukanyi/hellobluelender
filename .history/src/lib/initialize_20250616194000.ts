import { AdminUser, EmailRecipient, SMTPConfig } from '@/types';
import redis from '@/lib/redis';
import { hashPassword } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function initializeAdminData() {
  try {
    // Check if admin user already exists
    const adminExists = await redis.exists('admin:admin@bluelender.com');
    
    if (!adminExists) {
      // Create default admin user
      const hashedPassword = await hashPassword('admin123'); // Default password, should be changed
      const adminUser: AdminUser = {
        id: uuidv4(),
        username: 'admin',
        email: 'admin@bluelender.com',
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Store in Redis
      await redis.set(`admin:${adminUser.email}`, JSON.stringify(adminUser));
      
      console.log('Default admin user created');
    }
    
    // Check if email recipients exist
    const recipientsExist = await redis.exists('email:recipients');
    
    if (!recipientsExist) {
      // Create default email recipient
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
