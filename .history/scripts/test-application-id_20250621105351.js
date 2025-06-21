#!/usr/bin/env node

// Simple application ID test script
import { randomBytes } from 'crypto';

// Function that mimics our UUID-based application ID generation
function generateRandomHex(length) {
  return randomBytes(length).toString('hex').substring(0, length);
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
function testApplicationId() {  try {
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
    
    // No Redis in this simplified test
    console.log('\nNote: This test does not check existing IDs in Redis.');
    console.log('It only verifies that the generation algorithm produces 6-digit IDs consistently.');
    
    // Check for collisions
    function checkForCollisions(count) {
      const ids = new Set();
      let collisions = 0;
      
      for (let i = 0; i < count; i++) {
        const id = generateApplicationId();
        if (ids.has(id)) {
          collisions++;
        } else {
          ids.add(id);
        }
      }
      
      return collisions;
    }
    
    let collisions = checkForCollisions(100);
    console.log(`\nGenerated 100 IDs with ${collisions} collisions (${collisions}% collision rate)`);
    
    collisions = checkForCollisions(1000);
    console.log(`Generated 1000 IDs with ${collisions} collisions (${(collisions/10).toFixed(1)}% collision rate)`);  } catch (error) {
    console.error('Error testing application IDs:', error);
  }
}

// Run the test
testApplicationId();
