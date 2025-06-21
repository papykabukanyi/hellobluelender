#!/usr/bin/env node

// Simple application ID test script
const crypto = require('crypto');

// Function that mimics our UUID-based application ID generation
function generateRandomHex(length) {
  return crypto.randomBytes(length).toString('hex').substring(0, length);
}

// Function to generate a 6-digit application ID - same as in route.ts
function generateApplicationId() {
  const hex = generateRandomHex(6);
  const decimal = parseInt(hex, 16);
  // Ensure it's exactly 6 digits by modulo and padding
  return (100000 + (decimal % 900000)).toString();
}

/**
 * Test the 6-digit application ID generation
 */
function testApplicationId() {
  try {
    console.log('Testing 6-digit application ID generation...');
    
    // Generate a few application IDs and verify they're 6 digits
    for (let i = 0; i < 20; i++) {
      const applicationId = generateApplicationId();
      console.log(`Generated ID #${i+1}: ${applicationId}`);
      
      // Verify it's a 6-digit number
      if (!/^\d{6}$/.test(applicationId)) {
        console.error(`❌ Invalid application ID format: ${applicationId}. Should be exactly 6 digits.`);
        process.exit(1);
      }
    }
    
    console.log('✅ All application IDs generated correctly with 6 digits!');
    
    // Test for collisions
    console.log('\nChecking for potential collisions in application IDs:');
    
    let collisions = checkForCollisions(100);
    console.log(`Generated 100 IDs with ${collisions} collisions (${collisions}% collision rate)`);
    
    collisions = checkForCollisions(1000);
    console.log(`Generated 1000 IDs with ${collisions} collisions (${(collisions/10).toFixed(1)}% collision rate)`);
    
    console.log('\nNote: Some collisions are expected due to the 6-digit limit (1 million possible values).');
    console.log('In a production environment, additional uniqueness checks should be performed.');
  } catch (error) {
    console.error('Error while testing application IDs:', error);
    process.exit(1);
  }
}

// Function to check collision rate
function checkForCollisions(count) {
  const ids = new Set();
  for (let i = 0; i < count; i++) {
    ids.add(generateApplicationId());
  }
  return count - ids.size;
}

// Run the test
testApplicationId();
