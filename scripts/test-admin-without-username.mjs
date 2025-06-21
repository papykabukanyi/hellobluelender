import { config } from 'dotenv';
import Redis from 'ioredis';
import { hashPassword } from '../src/lib/auth';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
config({ path: '.env.local' });

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL);

async function testSubAdminWithoutUsername() {
  try {
    console.log('Testing sub-admin creation without username...');
    
    // Create a test sub-admin with only email and password
    const testEmail = `test-no-username-${Date.now()}@example.com`;
    const hashedPassword = await hashPassword('test123');
    
    const subAdmin = {
      id: uuidv4(),
      // No username property
      email: testEmail,
      password: hashedPassword,
      role: 'sub-admin',
      permissions: {
        viewApplications: true,
        manageAdmins: false,
        manageSmtp: false,
        manageRecipients: false,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Store in Redis
    await redis.set(`admin:${testEmail}`, JSON.stringify(subAdmin));
    console.log(`✅ Created test sub-admin: ${testEmail}`);
    
    // Verify the sub-admin was created correctly
    const savedAdmin = await redis.get(`admin:${testEmail}`);
    if (!savedAdmin) {
      console.error('❌ Failed to retrieve saved admin data');
      process.exit(1);
    }
    
    const parsedAdmin = JSON.parse(savedAdmin);
    
    // Verify no username property is set
    if ('username' in parsedAdmin) {
      console.error('❌ Username property should not exist but was found:', parsedAdmin.username);
      process.exit(1);
    }
    console.log('✅ Username property correctly omitted');
    
    // Clean up by removing the test user
    await redis.del(`admin:${testEmail}`);
    console.log(`✅ Removed test sub-admin: ${testEmail}`);
    
    console.log('✅ Sub-admin without username test successful!');
    
  } catch (error) {
    console.error('Error testing sub-admin without username:', error);
    process.exit(1);
  } finally {
    // Close Redis connection
    redis.quit();
  }
}

testSubAdminWithoutUsername();
