import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    // List all files in uploads directory
    function listFilesRecursive(dir: string, relativePath = ''): string[] {
      const files: string[] = [];
      try {
        const items = fs.readdirSync(dir);
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const itemRelativePath = path.join(relativePath, item);
          
          if (fs.statSync(fullPath).isDirectory()) {
            files.push(...listFilesRecursive(fullPath, itemRelativePath));
          } else {
            files.push(itemRelativePath);
          }
        }
      } catch (error) {
        console.error('Error reading directory:', dir, error);
      }
      return files;
    }

    const allFiles = listFilesRecursive(uploadsDir);
    
    return NextResponse.json({
      uploadsDir,
      totalFiles: allFiles.length,
      files: allFiles.slice(0, 20), // Show first 20 files
      message: allFiles.length > 20 ? `Showing first 20 of ${allFiles.length} files` : 'All files shown'
    });

  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 });
  }
}
