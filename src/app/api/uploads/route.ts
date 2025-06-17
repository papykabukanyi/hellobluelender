import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import redis from '@/lib/redis';

// Ensure uploads directory exists
const createUploadsDir = async () => {
  const uploadsDir = join(process.cwd(), 'public', 'uploads');
  try {
    await mkdir(uploadsDir, { recursive: true });
  } catch (error) {
    console.error('Error creating uploads directory:', error);
  }
  return uploadsDir;
};

export async function POST(request: NextRequest) {
  try {
    // Check if this is a multipart/form-data request
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { success: false, error: 'Content type must be multipart/form-data' },
        { status: 400 }
      );
    }
    
    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const applicationId = formData.get('applicationId') as string;
    const documentType = formData.get('documentType') as string;

    if (!file || !applicationId || !documentType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create a unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    
    // Create the uploads directory if it doesn't exist
    const uploadsDir = await createUploadsDir();
    const applicationDir = join(uploadsDir, applicationId);
    await mkdir(applicationDir, { recursive: true });

    // Write the file to disk
    const filePath = join(applicationDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Store the file reference in Redis
    const fileData = {
      originalName: file.name,
      fileName: fileName,
      type: file.type,
      size: file.size,
      path: `/uploads/${applicationId}/${fileName}`,
      uploadedAt: new Date().toISOString(),
      documentType: documentType
    };

    // Get the application from Redis
    const applicationJson = await redis.get(`application:${applicationId}`);
    if (applicationJson) {
      const application = JSON.parse(applicationJson);
      
      // Update the documents field in the application
      const documents = application.documents || {};
      
      // If the document type is already an array, push to it
      if (Array.isArray(documents[documentType])) {
        documents[documentType].push(fileData);
      } else {
        // Otherwise create a new array or just set the value
        documents[documentType] = [fileData];
      }
      
      // Update the application in Redis
      application.documents = documents;
      application.updatedAt = new Date().toISOString();
      await redis.set(`application:${applicationId}`, JSON.stringify(application));
    }

    return NextResponse.json({
      success: true,
      file: fileData
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// For deleting a file
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');
    const applicationId = searchParams.get('applicationId');
    const documentType = searchParams.get('documentType');
    
    if (!filePath || !applicationId || !documentType) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // Get the application from Redis
    const applicationJson = await redis.get(`application:${applicationId}`);
    if (!applicationJson) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }
    
    const application = JSON.parse(applicationJson);
    const documents = application.documents || {};
    
    // Filter out the file to delete
    if (Array.isArray(documents[documentType])) {
      documents[documentType] = documents[documentType].filter(
        (doc: any) => doc.path !== filePath
      );
      
      // Update the application in Redis
      application.documents = documents;
      application.updatedAt = new Date().toISOString();
      await redis.set(`application:${applicationId}`, JSON.stringify(application));
    }
    
    // Note: In a production environment, you would also delete the file from disk
    
    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
