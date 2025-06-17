import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { generatePDF } from '@/lib/pdf';
import { sendEmail } from '@/lib/email';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const applicationData = await request.json();
    
    // Generate a unique ID for this application
    const applicationId = uuidv4();
    
    // Add metadata
    const completeApplication = {
      ...applicationData,
      id: applicationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Store application in Redis
    await redis.set(`application:${applicationId}`, JSON.stringify(completeApplication));
    
    // Add to applications list
    await redis.sadd('applications', applicationId);
    
    // Generate PDF
    const pdfBlob = await generatePDF(
      completeApplication, 
      completeApplication.signature
    );
    
    // Convert PDF blob to base64 for email attachment
    const reader = new FileReader();
    const pdfBase64 = await new Promise((resolve) => {
      reader.onload = () => {
        const result = reader.result as string;
        // Extract base64 data from data URL
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.readAsDataURL(pdfBlob);
    });
    
    // Get email recipients from Redis
    const recipientsJson = await redis.get('email:recipients');
    const recipients = recipientsJson ? JSON.parse(recipientsJson) : [];
    
    // If no recipients are configured, use a default email
    const emailRecipients = recipients.length > 0 
      ? recipients.filter((r: any) => r.active).map((r: any) => r.email)
      : ['admin@bluelender.com'];
    
    // Send email with PDF attachment
    const businessName = completeApplication.businessInfo?.businessName || 'Unknown Business';
    const loanType = completeApplication.loanInfo?.loanType || 'Unknown';
    const loanAmount = completeApplication.loanInfo?.loanAmount 
      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(completeApplication.loanInfo.loanAmount)
      : 'Unknown';
    
    await sendEmail({
      to: emailRecipients,
      subject: `New ${loanType} Loan Application - ${businessName}`,
      html: `
        <h1>New Loan Application Submission</h1>
        <p>A new ${loanType} loan application has been submitted.</p>
        <p><strong>Application ID:</strong> ${applicationId}</p>
        <p><strong>Business Name:</strong> ${businessName}</p>
        <p><strong>Applicant:</strong> ${completeApplication.personalInfo?.firstName} ${completeApplication.personalInfo?.lastName}</p>
        <p><strong>Amount Requested:</strong> ${loanAmount}</p>
        <p><strong>Date Submitted:</strong> ${new Date().toLocaleString()}</p>
        <p>Please see the attached PDF for full application details.</p>
      `,
      attachments: [
        {
          filename: `${loanType}_Loan_Application_${applicationId}.pdf`,
          content: pdfBase64,
          encoding: 'base64',
          contentType: 'application/pdf',
        }
      ]
    });
    
    // Return success response
    return NextResponse.json({ 
      success: true, 
      id: applicationId 
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}
