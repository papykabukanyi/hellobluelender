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
    const id = searchParams.get('id');    // If an ID is provided, get a single application
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

import { sendEmail } from '@/lib/email';
import { getApprovedEmailTemplate, getDeniedEmailTemplate, getInReviewEmailTemplate } from '@/lib/templates/statusEmails';

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
    const previousStatus = application.status;
    
    // Update application status
    application.status = status;
    if (notes) {
      application.notes = notes;
    }
    application.updatedAt = new Date().toISOString();
    
    // Save back to Redis
    await redis.set(`application:${id}`, JSON.stringify(application));
    
    // Send status update email to applicant if status changed to approved, denied, or in-review
    if (
      status !== previousStatus && 
      ['approved', 'denied', 'in-review'].includes(status) && 
      application.personalInfo && 
      application.personalInfo.email
    ) {
      try {
        const applicantEmail = application.personalInfo.email;
        let emailSubject = '';
        let emailHtml = '';
        
        // Select the appropriate email template based on status
        switch (status) {
          case 'approved':
            emailSubject = 'Your Application Has Been Approved! - Hempire Enterprise';
            emailHtml = getApprovedEmailTemplate(application);
            break;
          case 'denied':
            emailSubject = 'Update on Your Application - Hempire Enterprise';
            emailHtml = getDeniedEmailTemplate(application);
            break;
          case 'in-review':
            emailSubject = 'Your Application is Under Review - Hempire Enterprise';
            emailHtml = getInReviewEmailTemplate(application);
            break;
        }
        
        // Send email to applicant
        await sendEmail({
          to: applicantEmail,
          subject: emailSubject,
          html: emailHtml
        });
        
        console.log(`Status update email sent to applicant (${applicantEmail}): Application ${status}`);
      } catch (emailError) {
        console.error('Error sending status update email:', emailError);
        // Don't fail the API call if email fails, just log the error
      }
    }
    
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

// Delete an application (only super admin can perform this action)
export async function DELETE(request: NextRequest) {
  try {
    // Get the current admin user
    const currentAdmin = await requirePermission(request, 'viewApplications');
    
    // If requirePermission returns a NextResponse, it means unauthorized
    if ('status' in currentAdmin && currentAdmin.status === 403) {
      return currentAdmin;
    }
    
    // Check if user is a super admin (SMTP User from env)
    const smtpUser = process.env.SMTP_USER || '';
    if (currentAdmin.email !== smtpUser) {
      return NextResponse.json(
        { success: false, error: 'Only the super admin can delete applications' },
        { status: 403 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Application ID is required' },
        { status: 400 }
      );
    }
    
    // Check if application exists
    const applicationExists = await redis.exists(`application:${id}`);
    if (!applicationExists) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }
    
    // Delete application from Redis
    await redis.del(`application:${id}`);
    
    // Remove from applications set
    await redis.srem('applications', id);
    
    return NextResponse.json({
      success: true,
      message: 'Application deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting application:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete application' },
      { status: 500 }
    );
  }
}
