import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');

    console.log('Document serve request:', { filePath, url: request.url });

    if (!filePath) {
      console.log('No file path provided');
      return NextResponse.json({ error: 'File path is required' }, { status: 400 });
    }

    // Security: ensure the path is within the uploads directory
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    console.log('Uploads directory:', uploadsDir);
    
    // Handle both absolute and relative paths
    let cleanPath = filePath;
    if (cleanPath.startsWith('/uploads/')) {
      cleanPath = cleanPath.replace(/^\/uploads\//, '');
    }
    if (cleanPath.startsWith('uploads/')) {
      cleanPath = cleanPath.replace(/^uploads\//, '');
    }
    
    const absolutePath = path.resolve(uploadsDir, cleanPath);
    console.log('Resolved path:', absolutePath);
    
    if (!absolutePath.startsWith(uploadsDir)) {
      console.log('Path outside uploads directory');
      return NextResponse.json({ error: 'Invalid file path' }, { status: 403 });
    }

    // Check if file exists
    if (!fs.existsSync(absolutePath)) {
      console.log('File not found:', absolutePath);
      // List available files for debugging
      try {
        const files = fs.readdirSync(uploadsDir);
        console.log('Available files:', files);
      } catch (e) {
        console.log('Could not list files in uploads directory');
      }
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    console.log('File found, serving:', absolutePath);

    // Read the file
    const fileBuffer = fs.readFileSync(absolutePath);
    const fileName = path.basename(absolutePath);
    
    // Determine content type based on file extension
    const ext = path.extname(fileName).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.webp':
        contentType = 'image/webp';
        break;
      case '.svg':
        contentType = 'image/svg+xml';
        break;
      case '.txt':
        contentType = 'text/plain';
        break;
      case '.doc':
        contentType = 'application/msword';
        break;
      case '.docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      default:
        contentType = 'application/octet-stream';
    }

    // Create response with appropriate headers
    const response = new NextResponse(fileBuffer);
    response.headers.set('Content-Type', contentType);
    response.headers.set('Content-Disposition', `inline; filename="${fileName}"`);
    response.headers.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    
    return response;

  } catch (error) {
    console.error('Error serving document:', error);
    return NextResponse.json({ error: 'Failed to serve document' }, { status: 500 });
  }
}
