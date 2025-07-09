import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');

    if (!filePath) {
      return NextResponse.json({ error: 'File path is required' }, { status: 400 });
    }

    // Security: ensure the path is within the uploads directory
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const absolutePath = path.resolve(uploadsDir, filePath.replace(/^\/uploads\//, ''));
    
    if (!absolutePath.startsWith(uploadsDir)) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 403 });
    }

    // Check if file exists
    if (!fs.existsSync(absolutePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

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
