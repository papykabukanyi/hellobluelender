import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const applicationData = await request.json();
    
    // Generate a unique pre-application ID (using UUID v4)
    const uuid = uuidv4();
    const hex = uuid.replace(/-/g, '').substring(0, 6);
    const decimal = parseInt(hex, 16);
    const preApplicationId = `PRE-${(100000 + (decimal % 900000)).toString()}`;
    
    // Add metadata
    const completePreApplication = {
      ...applicationData,
      id: preApplicationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'pre-application',
      source: 'chatbot',
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 '0.0.0.0',
      userAgent: request.headers.get('user-agent') || 'Unknown'
    };
    
    // Store pre-application in Redis
    await redis.set(`pre-application:${preApplicationId}`, JSON.stringify(completePreApplication));
    
    // Add to pre-applications list
    await redis.sadd('pre-applications', preApplicationId);
    
    // Extract data for lead creation and email formatting
    const firstName = applicationData.personalInfo?.firstName || 'Unknown';
    const lastName = applicationData.personalInfo?.lastName || 'Unknown';
    const email = applicationData.personalInfo?.email || 'Unknown';
    const phone = applicationData.personalInfo?.phone || 'Unknown';
    const businessName = applicationData.businessInfo?.businessName || 'Unknown Business';
    const businessType = applicationData.businessInfo?.businessType || 'Unknown';
    const loanAmount = applicationData.loanInfo?.loanAmount 
      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(applicationData.loanInfo.loanAmount)
      : 'Unknown';
    const loanPurpose = applicationData.loanInfo?.loanPurpose || 'Unknown';
    
    // Create a lead entry for the admin leads dashboard
    const leadData = {
      id: preApplicationId,
      name: `${firstName} ${lastName}`,
      firstName: firstName,
      lastName: lastName,
      email: email !== 'Unknown' ? email : '',
      phone: phone !== 'Unknown' ? phone : '',
      businessName: businessName !== 'Unknown Business' ? businessName : '',
      businessType: businessType !== 'Unknown' ? businessType : '',
      loanAmount: applicationData.loanInfo?.loanAmount || '',
      monthlyRevenue: applicationData.businessInfo?.monthlyRevenue || '',
      timeInBusiness: applicationData.businessInfo?.timeInBusiness || '',
      creditScore: applicationData.personalInfo?.creditScore || '',
      source: 'Chat Bot Pre-Application',
      status: 'New',
      priority: 'high', // Pre-applications are high priority since user completed the form
      qualificationScore: 10, // Max score since they completed pre-application
      interestLevel: 'high',
      notes: `Pre-application submitted via chatbot. ID: ${preApplicationId}. Purpose: ${loanPurpose}`,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    // Save lead for admin dashboard (using same format as chat leads)
    await redis.set(`chat:lead:pre_${preApplicationId}`, JSON.stringify(leadData));
    await redis.sadd('leads', leadData.id);
    
    console.log('✅ Pre-application lead created:', {
      id: preApplicationId,
      leadKey: `chat:lead:pre_${preApplicationId}`,
      leadData: leadData
    });
    
    // Get email recipients from Redis
    const recipientsJson = await redis.get('email:recipients');
    const recipients = recipientsJson ? JSON.parse(recipientsJson) : [];
    
    // Filter active recipients
    const activeRecipients = recipients.filter((r: any) => r.active);
    
    // Get SMTP owner email from environment variable (super admin, always include this)
    const smtpOwnerEmail = process.env.SMTP_USER || 'papykabukanyi@gmail.com';
    
    // Prepare recipient list with SMTP owner first
    const emailRecipients: string[] = [smtpOwnerEmail];
    
    // Add all other active recipients (avoiding duplicates)
    activeRecipients.forEach((recipient: any) => {
      if (recipient.email !== smtpOwnerEmail && !emailRecipients.includes(recipient.email)) {
        emailRecipients.push(recipient.email);
      }
    });

    // Import sendEmail function
    const { sendEmail } = await import('@/lib/email');
    
    // Send to admin recipients
    if (emailRecipients.length > 0) {
      try {
        await sendEmail({
          to: emailRecipients,
          subject: `New Pre-Application from Chatbot - ${businessName}`,
          html: `
            <h1>New Pre-Application from Chatbot</h1>
            <p>A new pre-application has been submitted via the chatbot.</p>
            
            <h2>Pre-Application Details</h2>
            <p><strong>Pre-Application ID:</strong> ${preApplicationId}</p>
            <p><strong>Date Submitted:</strong> ${new Date().toLocaleString()}</p>
            
            <h3>Personal Information</h3>
            <p><strong>Name:</strong> ${firstName} ${lastName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            
            <h3>Business Information</h3>
            <p><strong>Business Name:</strong> ${businessName}</p>
            <p><strong>Business Type:</strong> ${businessType}</p>
            <p><strong>Time in Business:</strong> ${applicationData.businessInfo?.timeInBusiness || 'Unknown'}</p>
            
            <h3>Financing Details</h3>
            <p><strong>Amount Requested:</strong> ${loanAmount}</p>
            <p><strong>Purpose:</strong> ${loanPurpose}</p>
            
            <p>Please follow up with this lead as soon as possible.</p>
          `
        });
      } catch (emailError) {
        console.error('Error sending pre-application notification to admin:', emailError);
        // Continue with the process even if email fails
      }
    }
    
    // Send confirmation email to applicant if email is provided
    if (email && email !== 'Unknown') {
      try {
        await sendEmail({
          to: email,
          subject: `Your Pre-Application Has Been Received - Hempire Enterprise`,
          html: `
            <div style="font-family: 'Montserrat', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #1F7832; font-family: 'Impact', 'Montserrat', sans-serif; letter-spacing: 1px; font-size: 32px;">HEMPIRE ENTERPRISE</h1>
                <p style="font-size: 18px; color: #333;">Pre-Application Confirmation</p>
              </div>
              
              <div style="margin-bottom: 30px;">
                <p>Dear ${firstName},</p>
                <p>Thank you for submitting your pre-application to Hempire Enterprise. We have received your information and a member of our team will contact you shortly to discuss your financing needs.</p>
                <p><strong>Your Pre-Application ID:</strong> ${preApplicationId}</p>
              </div>
              
              <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                <h3 style="margin-top: 0; color: #0056b3;">Summary of Information</h3>
                <p><strong>Business Name:</strong> ${businessName}</p>
                <p><strong>Financing Amount:</strong> ${loanAmount}</p>
                <p><strong>Purpose:</strong> ${loanPurpose}</p>
                <p><strong>Date Submitted:</strong> ${new Date().toLocaleString()}</p>
              </div>
              
              <div style="margin-top: 20px;">
                <p>To complete your full application, please visit our website and apply online. Having your pre-application ID ready will help expedite the process.</p>
              </div>
              
              <div style="font-size: 14px; color: #666; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
                <p>If you have any questions or need further assistance, please contact our customer support team at papykabukanyi@gmail.com or call us at (123) 456-7890.</p>
                <p>Thank you for choosing Hempire Enterprise for your financial needs.</p>
              </div>
            </div>
          `
        });
      } catch (emailError) {
        console.error('Error sending pre-application confirmation to applicant:', emailError);
        // Continue with the process even if email fails
      }
    }
    
    // Return success response
    return NextResponse.json({ 
      success: true, 
      id: preApplicationId 
    });
  } catch (error) {
    console.error('Error submitting pre-application:', error);
    
    // Provide more detailed error message for debugging
    let errorMessage = 'Failed to submit pre-application';
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
