// cleanup-api-keys.js - Script to clean up files with exposed API keys in the .history folder

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting cleanup of potentially exposed API keys...');

const historyFolder = path.join(__dirname, '.history');

// Exit if no history folder exists
if (!fs.existsSync(historyFolder)) {
  console.log('No .history folder found. Nothing to clean up.');
  process.exit(0);
}

// Function to recursively process files in a directory
function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.isFile()) {
      if (fullPath.endsWith('.ts') || fullPath.endsWith('.js') || fullPath.endsWith('.tsx') || fullPath.endsWith('.jsx')) {
        cleanupApiKeys(fullPath);
      }
    }
  }
}

// API key pattern - this is a simplified regex for demo purposes
// In production, use a more robust regex or dedicated secret scanning tool
const API_KEY_PATTERNS = [
  /AIza[0-9A-Za-z_-]{35}/g,  // Google API keys
  /new GoogleGenerativeAI\([^)]*'[^']*'\)/g, // GoogleGenerativeAI instantiations
  /new GoogleGenerativeAI\([^)]*"[^"]*"\)/g,
  /GEMINI_API_KEY.*=.*['"][^'"]*['"]|['"][^'"]*['"].*GEMINI_API_KEY/g // Potential GEMINI_API_KEY assignments
];

// Function to clean up API keys in a file
function cleanupApiKeys(filePath) {  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Replace all matches of API key patterns with redacted text
    for (const pattern of API_KEY_PATTERNS) {
      content = content.replace(pattern, match => {
        if (match.includes("process.env.GEMINI_API_KEY || ''")) {
          // This is a secure pattern, don't modify
          return match;
        }
        modified = true;
        if (match.includes('GoogleGenerativeAI')) {
          return "new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')";
        }
        return '[REDACTED-API-KEY]';
      });
    }
    
    // Only write back if modified
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Cleaned API keys in: ${filePath}`);
    }
    
  } catch (error) {
    console.error(`Error processing file ${filePath}: ${error.message}`);
  }
}

// Start processing
processDirectory(historyFolder);

console.log('API key cleanup complete.');
console.log('IMPORTANT: This script provides basic cleanup, but you must still:');
console.log('1. Revoke and rotate any exposed API keys');
console.log('2. Consider using git-filter-repo or BFG Repo-Cleaner for thorough git history cleanup');
console.log('3. Follow best practices in API-KEY-SECURITY.md');
