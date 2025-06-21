const { v4: uuidv4 } = require('uuid');
const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL || 'redis://default:unlAQVqSudCdVZmmGIWsunXgsWlQKyuw@switchback.proxy.rlwy.net:15423');

// Function to generate a 6-digit application ID - same as in route.ts
function generateApplicationId() {
  const uuid = uuidv4();
  const hex = uuid.replace(/-/g, '').substring(0, 6);
  const decimal = parseInt(hex, 16);
  // Ensure it's exactly 6 digits by modulo and padding
  return (100000 + (decimal % 900000)).toString();
}

/**
 * Test the 6-digit application ID generation
 */
async function testApplicationId() {
  try {
    console.log('Testing 6-digit application ID generation...');
    
    // Generate a few application IDs and verify they're 6 digits
    for (let i = 0; i < 5; i++) {
      const applicationId = generateApplicationId();
      console.log(`Generated ID #${i+1}: ${applicationId}`);
      
      // Verify it's a 6-digit number
      if (!/^\d{6}$/.test(applicationId)) {
        console.error(`❌ Invalid application ID format: ${applicationId}. Should be exactly 6 digits.`);
        process.exit(1);
      }
    }
    
    console.log('✅ All application IDs generated correctly with 6 digits!');
    
    // Check all existing applications in Redis
    const applicationIds = await redis.smembers('applications');
    
    console.log(`\nChecking ${applicationIds.length} existing application IDs...`);
    
    let validCount = 0;
    let invalidCount = 0;
    
    for (const id of applicationIds) {
      if (!/^\d{6}$/.test(id)) {
        console.error(`❌ Found invalid application ID: ${id}`);
        invalidCount++;
      } else {
        validCount++;
      }
    }
      if (invalidCount > 0) {
      console.error(`Found ${invalidCount} invalid application IDs in Redis!`);
    } else if (applicationIds.length > 0) {
      console.log(`✅ All ${validCount} existing application IDs are valid 6-digit numbers!`);
    } else {
      console.log('No existing applications found in the database.');
    }
    
  } catch (error) {
    console.error('Error testing application IDs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testApplicationId()
  .catch(console.error);
