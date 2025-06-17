/**
 * Manual cleanup script for .next directory
 * Use this script when you need to force a clean build
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define directories to clean
const dirsToClean = ['.next', 'node_modules/.cache'];

// Attempt to close any processes that might be locking files
try {
  console.log('Attempting to close any processes that might be locking files...');
  if (process.platform === 'win32') {
    // On Windows, try to kill any node processes associated with Next.js
    try {
      execSync('taskkill /f /im node.exe', { stdio: 'ignore' });
    } catch (err) {
      // It's ok if this fails, just continue
      console.log('No active Node processes found or could not kill processes');
    }
  }
} catch (err) {
  console.warn('Warning: Could not terminate processes:', err.message);
}

// Add slight delay to allow processes to fully terminate
setTimeout(() => {
  // Clean each directory
  dirsToClean.forEach(dirName => {
    const dir = path.join(process.cwd(), dirName);
    
    if (fs.existsSync(dir)) {
      console.log(`Cleaning ${dirName} directory...`);
      
      try {
        // On Windows, try using rimraf through a command for more reliable deletion
        if (process.platform === 'win32') {
          try {
            // Try using rimraf command (make sure rimraf is installed globally or use npx)
            execSync(`npx rimraf "${dir}"`, { stdio: 'inherit' });
            console.log(`${dirName} cleaned successfully using rimraf`);
          } catch (cmdErr) {
            // Fall back to normal fs.rmSync
            fs.rmSync(dir, { recursive: true, force: true });
            console.log(`${dirName} cleaned successfully using fs.rmSync`);
          }
        } else {
          // On non-Windows platforms, use rmSync directly
          fs.rmSync(dir, { recursive: true, force: true });
          console.log(`${dirName} cleaned successfully`);
        }
      } catch (err) {
        console.error(`Error cleaning ${dirName}:`, err.message);
        
        // List files that couldn't be removed
        try {
          console.log(`The following files/directories in ${dirName} could not be removed:`);
          const listFiles = (directory) => {
            try {
              const entries = fs.readdirSync(directory, { withFileTypes: true });
              entries.forEach(entry => {
                const fullPath = path.join(directory, entry.name);
                if (entry.isDirectory()) {
                  listFiles(fullPath);
                } else {
                  console.log(`  - ${fullPath}`);
                }
              });
            } catch (e) {
              console.log(`  - Could not read ${directory}: ${e.message}`);
            }
          };
          listFiles(dir);
        } catch (listErr) {
          console.error('Could not list remaining files:', listErr.message);
        }
      }
    } else {
      console.log(`${dirName} directory does not exist, skipping`);
    }
  });
  
  console.log('Cleanup completed');
}, 1000);
