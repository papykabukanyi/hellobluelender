import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { requirePermission } from '@/lib/permissions';

// Get all loan applications or a single application by ID
export async function GET(request: NextRequest) {
  try {
    // Verify current admin has permission to view applications
    const currentAdmin = await requirePermission(request, 'viewApplications');
    
    // If requirePermission returns a NextResponse, it means unauthorized
    if ('status' in currentAdmin && currentAdmin.status === 403) {
      return currentAdmin;
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
      // If an ID is provided, get a single application
    if (id) {
      const application = await prisma.application.findUnique({
        where: { id },
        include: {
          personalInfo: true,
          businessInfo: true,
          loanInfo: true,
          coApplicantInfo: true,
          documents: true,
        },
      });
      
      if (!application) {
        return NextResponse.json(
          { success: false, error: 'Application not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        application,
      });
    }
    
    // Otherwise, get all applications
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    
    // Count total applications
    const totalApplications = await prisma.application.count();
    
    // Get paginated applications with all related data
    const applications = await prisma.application.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: {
        personalInfo: true,
        businessInfo: true,
        loanInfo: true,
        coApplicantInfo: true,
        documents: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
      return NextResponse.json({
      success: true,
      applications,
      pagination: {
        total: totalApplications,
        page,
        limit,
        totalPages: Math.ceil(totalApplications / limit),
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
    // Verify current admin has permission to view applications
    const currentAdmin = await requirePermission(request, 'viewApplications');
    
    // If requirePermission returns a NextResponse, it means unauthorized
    if ('status' in currentAdmin && currentAdmin.status === 403) {
      return currentAdmin;
    }
    
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Application ID is required' },
        { status: 400 }
      );
    }
    
    // Get application from database
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        personalInfo: true,
        businessInfo: true,
        loanInfo: true,
        coApplicantInfo: true,
        documents: true,
      },
    });
    
    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }
    
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
      // Check if application exists
    const existingApplication = await prisma.application.findUnique({
      where: { id },
    });
    
    if (!existingApplication) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }
    
    // Update application in database
    const application = await prisma.application.update({
      where: { id },
      data: {
        status,
        notes: notes || undefined,
      },
      include: {
        personalInfo: true,
        businessInfo: true,
        loanInfo: true,
        coApplicantInfo: true,
        documents: true,
      },
    });
    
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
