#!/usr/bin/env node

/**
 * This script helps set up environment variables on Railway.
 * Run this script before deploying to ensure all required variables are set.
 * 
 * Usage: node setup-railway.js
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { execSync } from 'child_process';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  console.log('\x1b[36m%s\x1b[0m', '🚂 Railway Environment Variable Setup');
  console.log('This script will help you set up your environment variables on Railway.');
  console.log('Make sure you have the Railway CLI installed and are logged in.');
  
  // Check if Railway CLI is installed
  try {
    execSync('railway --version', { stdio: 'ignore' });
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Railway CLI not found. Please install it first:');
    console.log('npm i -g @railway/cli');
    process.exit(1);
  }
  
  // Check if user is logged in
  try {
    execSync('railway whoami', { stdio: 'ignore' });
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Not logged in to Railway. Please login first:');
    console.log('railway login');
    process.exit(1);
  }
  
  const projectId = await askQuestion('Enter your Railway project ID (or leave blank to use current project): ');
  
  // Define required environment variables
  const requiredVars = [
    { key: 'REDIS_URL', question: 'Redis URL: ' },
    { key: 'JWT_SECRET_KEY', question: 'JWT Secret Key (leave blank to generate random): ' },
    { key: 'SMTP_HOST', question: 'SMTP Host (e.g., smtp.gmail.com): ' },
    { key: 'SMTP_PORT', question: 'SMTP Port (e.g., 587): ', default: '587' },
    { key: 'SMTP_USER', question: 'SMTP Username/Email: ' },
    { key: 'SMTP_PASS', question: 'SMTP Password (App Password recommended for Gmail): ' },
    { key: 'SMTP_FROM', question: 'Email "From" address: ' },
    { key: 'SMTP_FROM_NAME', question: 'Email "From" name: ', default: 'Hempire Enterprise' },
    { key: 'GEMINI_API_KEY', question: 'Gemini API Key: ' }
  ];
  
  // Load existing variables from .env files if they exist
  const envValues = {};
  
  // Try to read from .env.local
  try {
    const envLocal = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
    envLocal.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match && !line.startsWith('#')) {
        const key = match[1].trim();
        const value = match[2].trim();
        if (value) {
          envValues[key] = value;
        }
      }
    });
    console.log('\x1b[32m%s\x1b[0m', '✅ Loaded values from .env.local');
  } catch (error) {
    console.log('No .env.local file found or could not be read');
  }
  
  // Collect values for each required variable
  const finalValues = {};
  
  for (const variable of requiredVars) {
    const existingValue = envValues[variable.key] || '';
    let value;
    
    if (existingValue) {
      const useExisting = await askQuestion(`Use existing ${variable.key}? (${existingValue}) [Y/n]: `);
      if (useExisting.toLowerCase() !== 'n') {
        value = existingValue;
      }
    }
    
    if (!value) {      if (variable.key === 'JWT_SECRET_KEY' && !envValues[variable.key]) {
        // Generate random JWT secret if not provided
        value = crypto.randomBytes(32).toString('hex');
        console.log(`Generated random JWT secret: ${value.substring(0, 8)}...`);
      } else {
        value = await askQuestion(`${variable.question}${variable.default ? ` (default: ${variable.default})` : ''} `);
        if (!value && variable.default) {
          value = variable.default;
        }
      }
    }
    
    if (!value) {
      console.error('\x1b[31m%s\x1b[0m', `❌ ${variable.key} is required`);
      process.exit(1);
    }
    
    finalValues[variable.key] = value;
  }
  
  // Set variables on Railway
  console.log('\n\x1b[36m%s\x1b[0m', '🚀 Setting variables on Railway...');
  
  for (const [key, value] of Object.entries(finalValues)) {
    try {
      const command = projectId 
        ? `railway variables set ${key}="${value}" --project=${projectId}`
        : `railway variables set ${key}="${value}"`;
      
      execSync(command, { stdio: 'ignore' });
      console.log(`\x1b[32m✅ ${key}\x1b[0m`);
    } catch (error) {
      console.error(`\x1b[31m❌ Failed to set ${key}: ${error.message}\x1b[0m`);
    }
  }
  
  console.log('\n\x1b[32m%s\x1b[0m', '✅ Environment variables set up successfully!');
  console.log('\x1b[36m%s\x1b[0m', '🚂 You can now deploy your application on Railway.');
  
  rl.close();
}

main().catch(error => {
  console.error('\x1b[31m%s\x1b[0m', `❌ Error: ${error.message}`);
  rl.close();
  process.exit(1);
});
