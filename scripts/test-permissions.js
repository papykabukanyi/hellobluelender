// Test script for admin permissions

const { createClient } = require('redis');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// Create Redis client
const redis = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });

async function main() {
  // Connect to Redis
  await redis.connect();
  console.log('Connected to Redis');
  
  // 1. Check if main admin exists
  const mainAdminJson = await redis.get('admin:admin@bluelender.com');
  console.log('Main admin exists:', !!mainAdminJson);
  
  if (mainAdminJson) {
    const mainAdmin = JSON.parse(mainAdminJson);
    console.log('Main admin permissions:', mainAdmin.permissions);
  } else {
    console.log('Creating main admin...');
    
    // Hash password
    const passwordHash = await bcrypt.hash('adminpassword', 10);
    
    // Create main admin
    const mainAdmin = {
      id: uuidv4(),
      username: 'admin',
      email: 'admin@bluelender.com',
      password: passwordHash,
      role: 'admin',
      permissions: {
        viewApplications: true,
        manageAdmins: true,
        manageSmtp: true,
        manageRecipients: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Save to Redis
    await redis.set('admin:admin@bluelender.com', JSON.stringify(mainAdmin));
    console.log('Main admin created');
  }
  
  // 2. Create a test sub-admin with limited permissions
  console.log('Creating test sub-admin...');
  
  const passwordHash = await bcrypt.hash('subadmin123', 10);
  
  const subAdmin = {
    id: uuidv4(),
    username: 'subadmin',
    email: 'subadmin@test.com',
    password: passwordHash,
    role: 'sub-admin',
    permissions: {
      viewApplications: true,
      manageAdmins: false,
      manageSmtp: false,
      manageRecipients: false
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    addedBy: 'test-script'
  };
  
  // Save to Redis
  await redis.set('admin:subadmin@test.com', JSON.stringify(subAdmin));
  console.log('Test sub-admin created');
  
  // Print all admins
  console.log('\nAll admin users:');
  const adminKeys = await redis.keys('admin:*');
  for (const key of adminKeys) {
    const adminJson = await redis.get(key);
    if (adminJson) {
      const admin = JSON.parse(adminJson);
      const { password, ...adminInfo } = admin;
      console.log(`- ${admin.email} (${admin.role}):`);
      console.log('  Permissions:', admin.permissions);
    }
  }
  
  // Disconnect from Redis
  await redis.disconnect();
  console.log('\nTest completed');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
