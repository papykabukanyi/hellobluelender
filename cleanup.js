#!/usr/bin/env node

/**
 * NUCLEAR CLEANUP SCRIPT FOR NEXT.JS
 * This script brutally removes .next directory using child_process.execSync
 * No mercy for locked files or permissions
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get the current directory
const currentDir = process.cwd();

// Define the directories to clean
const nextDir = path.join(currentDir, '.next');
const cacheDir = path.join(currentDir, 'node_modules', '.cache');
const standaloneDir = path.join(nextDir, 'standalone');

console.log('🧹 STARTING AGGRESSIVE CLEANUP 🧹');

// Function to forcefully delete a directory using command line tools
function forceDeleteDirectory(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Directory ${dir} does not exist, skipping.`);
    return;
  }

  console.log(`💥 Force deleting directory: ${dir}`);

  try {
    // On Windows, use RD /S /Q which is more aggressive than fs.rmSync
    if (process.platform === 'win32') {
      execSync(`rd /s /q "${dir}"`, { stdio: 'inherit' });
    } else {
      // On Unix systems, use rm -rf
      execSync(`rm -rf "${dir}"`, { stdio: 'inherit' });
    }
    console.log(`✅ Successfully removed ${dir}`);
  } catch (error) {
    console.error(`⚠️ Command-line deletion failed: ${error.message}`);
    
    try {
      // As a fallback, try native Node.js method
      console.log('Trying Node.js native deletion...');
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`✅ Successfully removed ${dir} with Node.js`);
    } catch (fsError) {
      console.error(`🚨 CRITICAL: Could not delete ${dir}: ${fsError.message}`);
      
      // If standalone directory is the problem, try to at least delete the contents
      if (dir.includes('standalone')) {
        console.log('🔨 Emergency measures: Attempting to delete contents only...');
        try {
          const files = fs.readdirSync(dir);
          for (const file of files) {
            const filePath = path.join(dir, file);
            try {
              if (fs.statSync(filePath).isDirectory()) {
                if (process.platform === 'win32') {
                  execSync(`rd /s /q "${filePath}"`, { stdio: 'inherit' });
                } else {
                  execSync(`rm -rf "${filePath}"`, { stdio: 'inherit' });
                }
              } else {
                fs.unlinkSync(filePath);
              }
            } catch (e) {
              console.error(`Failed to delete ${filePath}: ${e.message}`);
            }
          }
          console.log('Attempted to clear directory contents.');
        } catch (e) {
          console.error('💀 Complete failure to clean directory.');
        }
      }
    }
  }
}

// First focus on the standalone directory which causes problems
if (fs.existsSync(standaloneDir)) {
  console.log('🎯 First targeting problematic standalone directory');
  forceDeleteDirectory(standaloneDir);
}

// Then clean up the entire .next directory
if (fs.existsSync(nextDir)) {
  console.log('🎯 Cleaning .next directory');
  forceDeleteDirectory(nextDir);
} else {
  console.log('.next directory does not exist, skipping');
}

// Finally clean up the cache directory
if (fs.existsSync(cacheDir)) {
  console.log('🎯 Cleaning node_modules/.cache directory');
  forceDeleteDirectory(cacheDir);
} else {
  console.log('node_modules/.cache directory does not exist, skipping');
}

console.log('🎉 Cleanup completed');
