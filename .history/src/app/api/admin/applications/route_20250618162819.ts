import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';

// Get all loan applications or a single application by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // If an ID is provided, get a single application
    if (id) {
      const applicationJson = await redis.get(`application:${id}`);
      if (!applicationJson) {
        return NextResponse.json(
          { success: false, error: 'Application not found' },
          { status: 404 }
        );
      }
      
      const application = JSON.parse(applicationJson);
      return NextResponse.json({
        success: true,
        application,
      });
    }
    
    // Otherwise, get all applications
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '100', 10); // Increased to show all apps
    
    // Get all application IDs
    const applicationIds = await redis.smembers('applications');
    
    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedIds = applicationIds.slice(startIndex, endIndex);
    
    // Get application data for paginated IDs
    const applicationPromises = paginatedIds.map(async (id) => {
      const applicationJson = await redis.get(`application:${id}`);
      return applicationJson ? JSON.parse(applicationJson) : null;
    });
    
    const applications = (await Promise.all(applicationPromises))
      .filter(app => app !== null)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return NextResponse.json({
      success: true,
      applications,
      pagination: {
        total: applicationIds.length,
        page,
        limit,
        totalPages: Math.ceil(applicationIds.length / limit),
      },
    });
  } catch (error) {
    console.error('Error getting applications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get applications' },
      { status: 500 }
    );
  }
}

// Get a single application
export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Application ID is required' },
        { status: 400 }
      );
    }
    
    // Get application from Redis
    const applicationJson = await redis.get(`application:${id}`);
    if (!applicationJson) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }
    
    const application = JSON.parse(applicationJson);
    
    return NextResponse.json({
      success: true,
      application,
    });
  } catch (error) {
    console.error('Error getting application:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get application' },
      { status: 500 }
    );
  }
}

// Update application status
export async function PUT(request: NextRequest) {
  try {
    const { id, status, notes } = await request.json();
    
    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'Application ID and status are required' },
        { status: 400 }
      );
    }
    
    // Validate status
    const validStatuses = ['draft', 'submitted', 'in-review', 'approved', 'denied'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status value' },
        { status: 400 }
      );
    }
    
    // Get application from Redis
    const applicationJson = await redis.get(`application:${id}`);
    if (!applicationJson) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }
    
    const application = JSON.parse(applicationJson);
    
    // Update application status
    application.status = status;
    if (notes) {
      application.notes = notes;
    }
    application.updatedAt = new Date().toISOString();
    
    // Save back to Redis
    await redis.set(`application:${id}`, JSON.stringify(application));
    
    return NextResponse.json({
      success: true,
      application,
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update application' },
      { status: 500 }
    );
  }
}
