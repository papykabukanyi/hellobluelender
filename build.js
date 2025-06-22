#!/usr/bin/env node

/**
 * Enhanced build script for Railway deployment
 * This script helps diagnose and fix common build issues
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Print banner
console.log('\n🚂 Enhanced Railway Build Process 🚂');
console.log('=======================================\n');

// Set environment variables for better builds
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.NODE_OPTIONS = '--max-old-space-size=4096';

// Display environment information
console.log('📊 Environment Information:');
console.log(`• Node Version: ${process.version}`);
console.log(`• Platform: ${process.platform}`);
console.log(`• Memory Allocated: 4GB`);

// Helper function to execute commands with logging
function runCommand(command, errorMessage) {
  console.log(`\n▶️ Running: ${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`\n❌ ${errorMessage || 'Command failed'}:`);
    console.error(`Command: ${command}`);
    console.error(`Error: ${error.message}`);
    return false;
  }
}

// Main build process
async function build() {
  // Step 1: Clean build artifacts
  console.log('\n🧹 Cleaning previous build artifacts...');
  
  const nextDir = path.join(process.cwd(), '.next');
  if (fs.existsSync(nextDir)) {    try {
      fs.rmSync(nextDir, { recursive: true, force: true });
      console.log('✅ Previous build cleaned');
    } catch (error) {
      console.warn(`⚠️ Warning: Could not clean .next directory: ${error.message}`);
    }
  }
  
  // Step 2: Run Next.js build
  console.log('\n� Building Next.js application...');
  const buildSuccess = runCommand('next build', 'Next.js build failed');
  
  if (!buildSuccess) {
    console.error('\n❌ Build failed. See errors above.');
    process.exit(1);
  }
  
  // Step 3: Verify build output
  console.log('\n🔍 Verifying build output...');
  const standalonePath = path.join(process.cwd(), '.next', 'standalone');
  
  if (fs.existsSync(standalonePath)) {
    console.log('✅ Standalone output directory created successfully');
  } else {
    console.warn(`⚠️ Warning: Standalone output directory not found. Check your next.config.js`);
    console.warn(`Make sure your next.config.js includes: output: 'standalone'`);
  }
  
  // Step 4: Build summary
  console.log('\n🎉 Build completed successfully!');
  console.log('=======================================');
}

// Start the build process
build().catch(error => {
  console.error('\n❌ Unexpected error during build:');
  console.error(error);
  process.exit(1);
});
