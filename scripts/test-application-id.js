import { PrismaClient } from '@prisma/client';
import { getUniqueApplicationId } from '../src/lib/applicationId.js';

const prisma = new PrismaClient();

/**
 * Test the 6-digit application ID generation
 */
async function testApplicationId() {
  try {
    console.log('Testing 6-digit application ID generation...');
    
    // Generate a few application IDs and verify they're 6 digits
    for (let i = 0; i < 5; i++) {
      const applicationId = await getUniqueApplicationId();
      console.log(`Generated ID #${i+1}: ${applicationId}`);
      
      // Verify it's a 6-digit number
      if (!/^\d{6}$/.test(applicationId)) {
        console.error(`❌ Invalid application ID format: ${applicationId}. Should be exactly 6 digits.`);
        process.exit(1);
      }
    }
    
    console.log('✅ All application IDs generated correctly with 6 digits!');
    
    // Check all existing applications in the database
    const applications = await prisma.application.findMany({
      select: { id: true },
    });
    
    console.log(`\nChecking ${applications.length} existing application IDs...`);
    
    let validCount = 0;
    let invalidCount = 0;
    
    for (const app of applications) {
      if (!/^\d{6}$/.test(app.id)) {
        console.error(`❌ Found invalid application ID: ${app.id}`);
        invalidCount++;
      } else {
        validCount++;
      }
    }
    
    if (invalidCount > 0) {
      console.error(`Found ${invalidCount} invalid application IDs in the database!`);
    } else if (applications.length > 0) {
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
