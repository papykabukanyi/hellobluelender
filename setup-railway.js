#!/usr/bin/env node

// Super simple Railway setup script
const fs = require('fs');
const { execSync } = require('child_process');
const readline = require('readline');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Simple prompt function
function prompt(question) {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer);
    });
  });
}

// Main function
async function main() {
  try {
    console.log('=== Railway Setup Script ===');
    
    // Check for dry run mode
    const isDryRun = process.argv.includes('--dry-run');
    if (isDryRun) {
      console.log('DRY RUN MODE: No variables will actually be set');
    }
    
    // Read .env.local file
    let envVars = {};
    try {
      const envContent = fs.readFileSync('.env.local', 'utf8');
      envContent.split('\n').forEach(line => {
        // Skip comments and empty lines
        if (!line || line.trim().startsWith('#')) return;
        
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          envVars[match[1].trim()] = match[2].trim();
        }
      });
      console.log('✅ Loaded variables from .env.local');
    } catch (error) {
      console.error(`❌ Could not read .env.local: ${error.message}`);
      process.exit(1);
    }    
    // We're only using Redis, not PostgreSQL
    
    // Set NODE_ENV to production if not set
    if (!envVars.NODE_ENV) {
      envVars.NODE_ENV = 'production';
      console.log('✅ Added NODE_ENV=production');
    }
    
    // Show variables (mask sensitive ones)
    console.log('\nVariables to set on Railway:');
    for (const [key, value] of Object.entries(envVars)) {
      const isSensitive = key.includes('KEY') || key.includes('SECRET') || key.includes('PASS') || key.includes('TOKEN');
      const displayValue = isSensitive ? '******' : value;
      console.log(`• ${key}: ${displayValue}`);
    }
    
    // Get confirmation
    const confirm = await prompt('\nSet these variables on Railway? (Y/n): ');
    if (confirm.toLowerCase() === 'n') {
      console.log('Operation canceled');
      process.exit(0);
    }
    
    // Check for Railway CLI and login status (skip in dry run)
    if (!isDryRun) {
      try {
        execSync('railway version', { stdio: 'ignore' });
      } catch (error) {
        console.error('❌ Railway CLI not found. Install with: npm install -g @railway/cli');
        process.exit(1);
      }
      
      try {
        execSync('railway whoami', { stdio: 'ignore' });
      } catch (error) {
        console.error('❌ Not logged into Railway. Please run: railway login');
        process.exit(1);
      }
    }
    
    // Set variables on Railway
    console.log('\nSetting environment variables:');
    for (const [key, value] of Object.entries(envVars)) {
      try {
        if (!isDryRun) {
          execSync(`railway variables set ${key}="${value}"`, { stdio: 'inherit' });
          console.log(`✅ Set ${key}`);
        } else {
          console.log(`[DRY RUN] Would set ${key}`);
        }
      } catch (error) {
        console.error(`❌ Failed to set ${key}: ${error.message}`);
      }
    }
    
    console.log('\n✅ Setup complete! You can now run:');
    console.log('railway up');
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  } finally {
    rl.close();
  }
}

// Run the script
main();
