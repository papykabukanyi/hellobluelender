#!/usr/bin/env node

/**
 * Simple Railway setup script
 * This script automatically copies all environment variables from .env.local to Railway
 */

const fs = require('fs');
const { execSync } = require('child_process');
const readline = require('readline');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ask a question and get a response
function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Load environment variables from .env.local
function loadEnvFile() {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const envVars = {};
    
    // Parse each line
    envContent.split('\n').forEach(line => {
      // Skip comments and empty lines
      if (!line || line.trim().startsWith('#')) return;
      
      // Extract key-value pairs
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        
        envVars[key] = value;
      }
    });
    
    console.log("✅ Loaded variables from .env.local");
    return envVars;
  } catch (error) {
    console.warn("⚠️ Could not load .env.local:", error.message);
    console.error("Please make sure .env.local exists and contains all required environment variables.");
    process.exit(1);
  }
}

// Additional required variables that might not be in .env.local
const additionalVars = {
  NODE_ENV: 'production'
};

async function main() {
  console.log("=== Railway Environment Setup ===");
  console.log("This script will automatically copy all variables from .env.local to Railway");
    // Check for dry run flag
  const isDryRun = process.argv.includes('--dry-run');
  if (isDryRun) {
    console.log("DRY RUN MODE: No variables will actually be set on Railway");
  }
  
  // Check if Railway CLI is installed (skip in dry run mode)
  if (!isDryRun) {
    try {
      execSync('railway --version', { stdio: 'ignore' });
    } catch (err) {
      console.error('Error: Railway CLI not found. Please install it with:');
      console.error('npm i -g @railway/cli');
      process.exit(1);
    }
  }
    // Check if user is logged in (skip in dry run mode)
  if (!isDryRun) {
    try {
      execSync('railway whoami', { stdio: 'ignore' });
    } catch (err) {
      console.error('Error: Not logged in to Railway. Please run:');
      console.error('railway login');
      process.exit(1);
    }
  }
    // Load variables from .env.local
  const envVars = loadEnvFile();
  
  // Check if DATABASE_URL exists, if not add it
  if (!envVars.DATABASE_URL) {
    console.log("\n⚠️ No DATABASE_URL found in .env.local");
    console.log("A DATABASE_URL is required for Prisma to work");
    additionalVars.DATABASE_URL = 'postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}';
    console.log("Added DATABASE_URL template that will use Railway's PostgreSQL service");
  }
  
  // Combine with additional variables
  const allVars = {...envVars, ...additionalVars};
  
  console.log("\nThe following variables will be set in Railway:");  // Display all variables (mask sensitive values)
  Object.entries(allVars).forEach(([key, value]) => {
    const displayValue = key.includes('KEY') || key.includes('PASS') || key.includes('SECRET') 
      ? '******' 
      : value;
    console.log(`• ${key}: ${displayValue}`);
  });
  
  // Ask for confirmation
  const proceed = await ask("\nProceed with setting these variables in Railway? (Y/n): ");
  
  if (proceed.toLowerCase() === 'n') {
    console.log("Operation cancelled by user.");
    process.exit(0);
  }
  
  console.log("\nSetting environment variables on Railway...");
    // Set all variables in Railway
  for (const [name, value] of Object.entries(allVars)) {
    if (value) {
      try {
        if (!isDryRun) {
          // Set the variable in Railway
          execSync(`railway variables set ${name}="${value}"`, { stdio: 'inherit' });
          console.log(`✓ Set ${name}`);
        } else {
          console.log(`[DRY RUN] Would set ${name}`);
        }
      } catch (err) {
        console.error(`× Failed to set ${name}: ${err.message}`);
      }
    } else {
      console.warn(`× Skipped ${name} (no value provided)`);
    }
  }
  
  console.log("\n=== Setup Complete ===");
  console.log("You can now deploy your application with:");
  console.log("railway up");
  
  rl.close();
}

main().catch(error => console.error("Error:", error));
