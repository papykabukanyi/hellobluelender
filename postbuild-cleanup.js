#!/usr/bin/env node

/**
 * POST-BUILD CLEANUP SCRIPT
 * This script runs after the build to clean up any remaining files
 * Specifically handles the standalone directory issue
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 POST-BUILD CLEANUP STARTING 🧹');

const currentDir = process.cwd();
const nextDir = path.join(currentDir, '.next');
const standaloneDir = path.join(nextDir, 'standalone');

// Only clean up if we're not in production mode and standalone exists
if (fs.existsSync(standaloneDir) && !process.env.NODE_ENV === 'production') {
  console.log('🎯 Cleaning up standalone directory post-build...');
  
  try {
    if (process.platform === 'win32') {
      execSync(`rd /s /q "${standaloneDir}" 2>nul || echo "Standalone cleanup complete"`, { stdio: 'inherit' });
    } else {
      execSync(`rm -rf "${standaloneDir}"`, { stdio: 'inherit' });
    }
    console.log('✅ Post-build cleanup completed');
  } catch (error) {
    console.log('ℹ️ Post-build cleanup finished (some files may remain)');
  }
} else {
  console.log('ℹ️ No post-build cleanup needed');
}
