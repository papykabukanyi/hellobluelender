import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { generatePDF } from '@/lib/pdf';
import { requirePermission } from '@/lib/permissions';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify current admin has permission to view applications
    const currentAdmin = await requirePermission(request, 'viewApplications');
    
    // If requirePermission returns a NextResponse, it means unauthorized
    if ('status' in currentAdmin && currentAdmin.status === 403) {
      return currentAdmin;
    }
    
    const applicationId = params.id;
    
    if (!applicationId) {
      return NextResponse.json(
        { success: false, error: 'Application ID is required' },
        { status: 400 }
      );
    }
    
    // Get application from Redis
    const applicationJson = await redis.get(`application:${applicationId}`);
    if (!applicationJson) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }
    
    const application = JSON.parse(applicationJson);
    
    // Generate PDF with admin metadata included
    const pdfBlob = await generatePDF(
      application, 
      application.signature,
      application.ipAddress || '0.0.0.0',
      application.userAgent || 'Unknown Device',
      true // isAdmin = true to include metadata
    );
    
    // Return the PDF as a download
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `attachment; filename="${application.loanInfo?.loanType || 'Loan'}_Application_${applicationId}.pdf"`);
    
    return new NextResponse(pdfBlob, {
      headers,
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
