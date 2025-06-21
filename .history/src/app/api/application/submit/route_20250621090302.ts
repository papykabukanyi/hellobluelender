import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import redis from '@/lib/redis';
import { generatePDF } from '@/lib/pdf';
import { sendEmail } from '@/lib/email';
import { getUniqueApplicationId } from '@/lib/applicationId';

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
    
    // Server-side conversion of Blob to base64
    const pdfBase64 = await new Promise<string>((resolve) => {
      // Server-side handling for Blob
      const chunks: Buffer[] = [];
      (pdfBlob as any).arrayBuffer().then((arrayBuffer: ArrayBuffer) => {
        const buffer = Buffer.from(arrayBuffer);
        resolve(buffer.toString('base64'));
      });
    });
      // Get email recipients from Redis
    const recipientsJson = await redis.get('email:recipients');
    const recipients = recipientsJson ? JSON.parse(recipientsJson) : [];
    
    // Filter active recipients
    const activeRecipients = recipients.filter((r: any) => r.active);
      // Get SMTP owner email from environment variable (super admin, always include this)
    const smtpOwnerEmail = process.env.SMTP_USER || 'admin@bluelender.com';
    
    // Prepare recipient list with SMTP owner first
    let emailRecipients: string[] = [smtpOwnerEmail];
    
    // Add all other active recipients (avoiding duplicates)
    activeRecipients.forEach((recipient: any) => {
      if (recipient.email !== smtpOwnerEmail && !emailRecipients.includes(recipient.email)) {
        emailRecipients.push(recipient.email);
      }
    });
    
    console.log(`Super admin (${smtpOwnerEmail}) and ${activeRecipients.length} other recipients will receive this application`);
    
    // Get application details for email
    const businessName = completeApplication.businessInfo?.businessName || 'Unknown Business';
    const loanType = completeApplication.loanInfo?.loanType || 'Unknown';
    const loanAmount = completeApplication.loanInfo?.loanAmount 
      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(completeApplication.loanInfo.loanAmount)
      : 'Unknown';
    
    // Check if there's a co-applicant
    const hasCoApplicant = !!completeApplication.coApplicantInfo;
    const coApplicantName = hasCoApplicant 
      ? `${completeApplication.coApplicantInfo?.firstName} ${completeApplication.coApplicantInfo?.lastName}`
      : '';
      
    // Send to admin recipients only if there are any configured
    if (emailRecipients.length > 0) {
      console.log(`Sending application notification to ${emailRecipients.length} recipients (admin prioritized)`);
      
      await sendEmail({
        to: emailRecipients,
        subject: `New ${loanType} Loan Application - ${businessName}`,
        html: `
          <h1>New Loan Application Submission</h1>
          <p>A new ${loanType} loan application has been submitted.</p>
          <p><strong>Application ID:</strong> ${applicationId}</p>
          <p><strong>Business Name:</strong> ${businessName}</p>
          <p><strong>Applicant:</strong> ${completeApplication.personalInfo?.firstName} ${completeApplication.personalInfo?.lastName}</p>
          ${hasCoApplicant ? `<p><strong>Co-Applicant:</strong> ${coApplicantName}</p>` : ''}
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
    } else {
      console.warn('No email recipients configured for loan applications. The admin notification email was not sent.');
    }
    
    // Send confirmation email to applicant
    const applicantName = `${completeApplication.personalInfo?.firstName} ${completeApplication.personalInfo?.lastName}`;
    const applicantEmail = completeApplication.personalInfo?.email;
    
    if (applicantEmail) {
      await sendEmail({
        to: applicantEmail,
        subject: `Your Blue Lender Application - Confirmation #${applicationId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #0056b3;">Blue Lender</h1>
              <p style="font-size: 18px; color: #333;">Application Confirmation</p>
            </div>
            
            <div style="margin-bottom: 30px;">
              <p>Dear ${applicantName},</p>
              <p>Thank you for submitting your loan application to Blue Lender. We have received your ${loanType} loan application for ${loanAmount}.</p>
              <p><strong>Your Application Number:</strong> ${applicationId}</p>
              <p>Our team will review your application and contact you shortly regarding the next steps. Please keep your application number for reference in all future communications.</p>
            </div>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <h3 style="margin-top: 0; color: #0056b3;">Application Summary</h3>
              <p><strong>Business Name:</strong> ${businessName}</p>
              <p><strong>Loan Type:</strong> ${loanType}</p>
              <p><strong>Amount Requested:</strong> ${loanAmount}</p>
              <p><strong>Date Submitted:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <div style="font-size: 14px; color: #666; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
              <p>If you have any questions or need further assistance, please contact our customer support team at support@bluelender.com or call us at (123) 456-7890.</p>
              <p>Thank you for choosing Blue Lender for your financial needs.</p>
            </div>
          </div>
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
    }
    
    // Return success response
    return NextResponse.json({ 
      success: true, 
      id: applicationId 
    });  } catch (error) {
    console.error('Error submitting application:', error);
    
    // Provide more detailed error message for debugging
    let errorMessage = 'Failed to submit application';
    if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
