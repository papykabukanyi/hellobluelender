/**
 * Comprehensive Application Testing Script
 * 
 * This script tests the full loan application flow including:
 * 1. Application submission with all required fields
 * 2. Signature capture and validation
 * 3. Application ID generation (ensuring 6-digit format)
 * 4. Email notifications to admin and borrower
 * 5. PDF generation
 * 
 * It sends 10 test applications with different data to verify the system is working properly.
 */

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const API_URL = 'http://localhost:3000/api';
const TEST_EMAIL = 'papykabukanyi@gmail.com';
const NUM_APPLICATIONS = 10;

// Sample data for generating test applications
const businessTypes = ['LLC', 'Corporation', 'Sole Proprietorship', 'Partnership', 'S-Corporation'];
const loanTypes = ['Business', 'Equipment'];
const loanPurposes = ['Equipment Purchase', 'Working Capital', 'Expansion', 'Inventory', 'Refinancing'];
const states = ['CA', 'NY', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI'];
const businessNames = [
  'Green Horizon Farms', 'Cannaplex Solutions', 'Hemp Innovators', 
  'EcoFiber Technologies', 'Pure Leaf Extracts', 'Hempire Ventures',
  'Sustainable Growth Co', 'CBD Wellness Labs', 'Natural Fiber Products',
  'Organic Hemp Industries', 'Hempire Enterprise'
];

// Generate mock signature data
function generateSignature() {
  // Simple mock of a data URL representing a signature
  return `data:image/png;base64,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`;
}

// Generate a random data point
function randomData(options) {
  return options[Math.floor(Math.random() * options.length)];
}

// Generate a random number between min and max
function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate a test application
function generateTestApplication(index) {
  // Use a fixed email for all tests so we can see them all
  return {
    personalInfo: {
      firstName: `Test${index}`,
      lastName: `Applicant${index}`,
      email: TEST_EMAIL, // Use the test email for all applications
      phone: `555-${randomNumber(100, 999)}-${randomNumber(1000, 9999)}`,
      address: `${randomNumber(100, 9999)} Test St`,
      city: `Test City ${index}`,
      state: randomData(states),
      zipCode: `${randomNumber(10000, 99999)}`,
      dateOfBirth: `${1960 + index}/0${randomNumber(1, 9)}/15`,
      ssn: `${randomNumber(100, 999)}-${randomNumber(10, 99)}-${randomNumber(1000, 9999)}`,
    },
    businessInfo: {
      businessName: randomData(businessNames) + ` #${index}`,
      businessType: randomData(businessTypes),
      businessAddress: `${randomNumber(100, 9999)} Business Ave`,
      businessCity: `Business City ${index}`,
      businessState: randomData(states),
      businessZipCode: `${randomNumber(10000, 99999)}`,
      yearsInBusiness: randomNumber(1, 15),
      annualRevenue: randomNumber(100000, 5000000),
      taxId: `${randomNumber(10, 99)}-${randomNumber(1000000, 9999999)}`,
      businessPhone: `555-${randomNumber(100, 999)}-${randomNumber(1000, 9999)}`,
      businessEmail: TEST_EMAIL,
    },
    loanInfo: {
      loanType: randomData(loanTypes),
      loanAmount: randomNumber(50000, 500000),
      loanPurpose: randomData(loanPurposes),
    },
    // Sometimes include a co-applicant
    ...(index % 3 === 0 ? {
      coApplicantInfo: {
        firstName: `Co${index}`,
        lastName: `Applicant${index}`,
        email: TEST_EMAIL,
        phone: `555-${randomNumber(100, 999)}-${randomNumber(1000, 9999)}`,
        address: `${randomNumber(100, 9999)} Co-App St`,
        city: `Co-App City ${index}`,
        state: randomData(states),
        zipCode: `${randomNumber(10000, 99999)}`,
        dateOfBirth: `${1965 + index}/0${randomNumber(1, 9)}/20`,
        ssn: `${randomNumber(100, 999)}-${randomNumber(10, 99)}-${randomNumber(1000, 9999)}`,
        relationshipToBusiness: 'Partner',
      },
      coApplicantSignature: generateSignature(),
    } : {}),
    signature: generateSignature(),
  };
}

// Submit a test application
async function submitTestApplication(appData, index) {
  try {
    console.log(`Submitting test application #${index + 1}: ${appData.businessInfo.businessName}...`);
    
    const response = await axios.post(`${API_URL}/application/submit`, appData);
    
    if (response.data && response.data.success) {
      console.log(`✅ Application #${index + 1} submitted successfully! Application ID: ${response.data.id}`);
      return response.data.id;
    } else {
      console.error(`❌ Failed to submit application #${index + 1}.`);
      console.error('Error:', response.data?.error || 'Unknown error');
      return null;
    }
  } catch (error) {
    console.error(`❌ Error submitting application #${index + 1}:`, error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return null;
  }
}

// Main test function
async function runTests() {
  console.log('='.repeat(80));
  console.log('HEMPIRE ENTERPRISE LOAN APPLICATION SYSTEM - COMPREHENSIVE TEST');
  console.log('='.repeat(80));
  console.log(`Testing with ${NUM_APPLICATIONS} applications`);
  console.log(`All test emails will be sent to: ${TEST_EMAIL}`);
  console.log('-'.repeat(80));
  
  const startTime = Date.now();
  const results = {
    success: 0,
    failed: 0,
    applicationIds: [],
  };
  
  // Submit test applications in sequence
  for (let i = 0; i < NUM_APPLICATIONS; i++) {
    const testApp = generateTestApplication(i);
    const appId = await submitTestApplication(testApp, i);
    
    if (appId) {
      results.success++;
      results.applicationIds.push(appId);
    } else {
      results.failed++;
    }
    
    // Small delay between submissions
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Print test summary
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log('\n' + '='.repeat(80));
  console.log('TEST SUMMARY');
  console.log('-'.repeat(80));
  console.log(`Total applications submitted: ${NUM_APPLICATIONS}`);
  console.log(`Successful submissions: ${results.success}`);
  console.log(`Failed submissions: ${results.failed}`);
  console.log(`Success rate: ${((results.success / NUM_APPLICATIONS) * 100).toFixed(2)}%`);
  console.log(`Total time: ${duration} seconds`);
  
  if (results.applicationIds.length > 0) {
    console.log('\nApplication IDs generated:');
    results.applicationIds.forEach((id, index) => {
      console.log(`  ${index + 1}. ${id}`);
      
      // Validate application ID format (6 digits)
      if (!/^\d{6}$/.test(id)) {
        console.error(`  ❌ INVALID FORMAT! Application ID should be exactly 6 digits.`);
      }
    });
    
    // Check for duplicate IDs
    const uniqueIds = new Set(results.applicationIds);
    if (uniqueIds.size < results.applicationIds.length) {
      console.error(`\n❌ WARNING: Found ${results.applicationIds.length - uniqueIds.size} duplicate application IDs!`);
    } else {
      console.log(`\n✅ All application IDs are unique!`);
    }
  }
  
  console.log('\n✉️  Check your email at ' + TEST_EMAIL + ' for confirmation emails.');
  console.log('='.repeat(80));
}

// Start the tests
console.log('Starting application tests...');
runTests().catch(err => {
  console.error('Error running tests:', err);
  process.exit(1);
});
