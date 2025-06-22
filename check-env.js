#!/usr/bin/env node

/**
 * This script verifies environment variables and fixes common issues.
 * It can be used both locally and in deployment environments.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\x1b[36m%s\x1b[0m', '🔍 Checking environment variables');

// Required environment variables
const requiredVariables = [
  { key: 'REDIS_URL', description: 'Redis connection URL' },
  { key: 'JWT_SECRET_KEY', description: 'Secret key for JWT authentication' },
  { key: 'SMTP_HOST', description: 'SMTP server hostname' },
  { key: 'SMTP_PORT', description: 'SMTP server port' },
  { key: 'SMTP_USER', description: 'Email username' },
  { key: 'SMTP_PASS', description: 'Email password' },
  { key: 'SMTP_FROM', description: 'From email address' },
  { key: 'SMTP_FROM_NAME', description: 'From name for emails' },
  { key: 'GEMINI_API_KEY', description: 'API key for Gemini AI' }
];

// Check if running in a local environment
const isLocal = !process.env.RAILWAY_ENVIRONMENT && !process.env.VERCEL_ENV;

// Load .env.local if in a local environment
let localEnvVars = {};
if (isLocal) {
  try {
    const envPath = path.join(__dirname, '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      
      // Parse .env file
      envContent.split('\n').forEach(line => {
        const match = line.match(/^([^#=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          let value = match[2].trim();
          
          // Remove quotes if present
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          
          localEnvVars[key] = value;
        }
      });
      
      console.log('\x1b[32m%s\x1b[0m', '✅ Loaded .env.local file');
    } else {
      console.log('\x1b[33m%s\x1b[0m', '⚠️ No .env.local file found');
    }
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', `❌ Error reading .env.local: ${error.message}`);
  }
}

// Check each required variable
const missingVariables = [];
const presentVariables = [];

for (const variable of requiredVariables) {
  // Check process.env first, then local .env vars
  const value = process.env[variable.key] || localEnvVars[variable.key];
  
  if (!value) {
    missingVariables.push(variable);
    console.log('\x1b[31m%s\x1b[0m', `❌ Missing ${variable.key} (${variable.description})`);
  } else {
    const maskedValue = variable.key.includes('KEY') || variable.key.includes('PASS') 
      ? '****' 
      : value.substring(0, 10) + (value.length > 10 ? '...' : '');
    
    console.log('\x1b[32m%s\x1b[0m', `✅ ${variable.key}: ${maskedValue}`);
    presentVariables.push(variable);
  }
}

// Summary
console.log('\n\x1b[36m%s\x1b[0m', '📊 Environment Variable Summary');
console.log('\x1b[32m%s\x1b[0m', `✅ ${presentVariables.length}/${requiredVariables.length} variables configured`);

if (missingVariables.length > 0) {
  console.log('\x1b[31m%s\x1b[0m', `❌ ${missingVariables.length} variables missing`);
  
  // If local, offer to fix missing variables
  if (isLocal) {
    console.log('\n\x1b[36m%s\x1b[0m', '💡 To fix missing variables, create or update your .env.local file:');
    
    console.log('\n# Add these variables to your .env.local file:');
    for (const variable of missingVariables) {
      console.log(`${variable.key}=  # ${variable.description}`);
    }
    
    console.log('\n\x1b[33m%s\x1b[0m', '⚠️ For deployment on Railway, use:');
    console.log('npm run railway:setup');
  } else {
    // If on Railway or Vercel, provide appropriate instructions
    if (process.env.RAILWAY_ENVIRONMENT) {
      console.log('\n\x1b[33m%s\x1b[0m', '⚠️ For Railway deployment, set these variables in the Railway dashboard:');
      console.log('https://railway.app/project/YOUR_PROJECT_ID/variables');
    } else if (process.env.VERCEL_ENV) {
      console.log('\n\x1b[33m%s\x1b[0m', '⚠️ For Vercel deployment, set these variables in the Vercel project settings:');
      console.log('https://vercel.com/YOUR_USERNAME/YOUR_PROJECT/settings/environment-variables');
    }
  }
} else {
  console.log('\x1b[32m%s\x1b[0m', '✨ All required environment variables are configured!');
}

// SMTP specific validation
if (process.env.SMTP_HOST || localEnvVars.SMTP_HOST) {
  console.log('\n\x1b[36m%s\x1b[0m', '📧 SMTP Configuration Check');
  
  // Validate port
  const smtpPort = process.env.SMTP_PORT || localEnvVars.SMTP_PORT;
  if (smtpPort) {
    const portNumber = parseInt(smtpPort, 10);
    if (isNaN(portNumber) || portNumber < 1 || portNumber > 65535) {
      console.log('\x1b[31m%s\x1b[0m', `❌ Invalid SMTP_PORT: ${smtpPort} (should be a number between 1-65535)`);
    } else if (portNumber !== 25 && portNumber !== 465 && portNumber !== 587) {
      console.log('\x1b[33m%s\x1b[0m', `⚠️ Unusual SMTP_PORT: ${portNumber} (common ports are 25, 465, or 587)`);
    } else {
      console.log('\x1b[32m%s\x1b[0m', `✅ SMTP_PORT: ${portNumber} is valid`);
    }
  }
  
  // Check Gmail specific settings
  const smtpHost = process.env.SMTP_HOST || localEnvVars.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER || localEnvVars.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS || localEnvVars.SMTP_PASS;
  
  if (smtpHost?.includes('gmail') && smtpUser?.includes('@gmail.com') && smtpPass?.length !== 16) {
    console.log('\x1b[33m%s\x1b[0m', `⚠️ You're using Gmail but your password doesn't look like an App Password`);
    console.log('\x1b[33m%s\x1b[0m', '⚠️ Gmail requires an App Password for third-party apps. See docs/email-configuration.md');
  }
}

// Gemini API check
if (process.env.GEMINI_API_KEY || localEnvVars.GEMINI_API_KEY) {
  console.log('\n\x1b[36m%s\x1b[0m', '🤖 Gemini API Configuration Check');
  
  const apiKey = process.env.GEMINI_API_KEY || localEnvVars.GEMINI_API_KEY;
  if (apiKey.startsWith('AIza')) {
    console.log('\x1b[32m%s\x1b[0m', '✅ Gemini API key format appears valid');
  } else {
    console.log('\x1b[31m%s\x1b[0m', '❌ Gemini API key format appears invalid (should start with "AIza")');
  }
}
