/**
 * Email templates for different application statuses
 */

// Helper to get company name
const getCompanyName = () => process.env.SMTP_FROM_NAME || 'Hempire Enterprise';

/**
 * Generate approved application email template
 */
export const getApprovedEmailTemplate = (application: any) => {
  const companyName = getCompanyName();
  const { personalInfo, businessInfo } = application;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #1F7832; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-family: 'Permanent Marker', cursive, Arial, sans-serif;">${companyName}</h1>
      </div>
      
      <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
        <h2>Application Approved!</h2>
        
        <p>Dear ${personalInfo.firstName} ${personalInfo.lastName},</p>
        
        <p>Great news! We're pleased to inform you that your financing application for <strong>${businessInfo.businessName}</strong> has been <strong>approved</strong>.</p>
        
        <p>One of our financing specialists will be contacting you within the next 24-48 business hours to discuss the next steps and finalize the details of your financing.</p>
        
        <h3>What to Expect Next:</h3>
        <ul>
          <li>A call from our financing team</li>
          <li>Discussion of terms and conditions</li>
          <li>Finalization of the agreement</li>
          <li>Fund disbursement process</li>
        </ul>
        
        <p>If you have any immediate questions, please feel free to contact our support team.</p>
        
        <p>Thank you for choosing ${companyName} for your business financing needs!</p>
        
        <p>Regards,<br>
        The ${companyName} Team</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666;">
          <p>This is an automated notification. Please do not reply to this email.</p>
          <p>Application Reference: ${application.id}</p>
        </div>
      </div>
    </div>
  `;
};

/**
 * Generate denied application email template
 */
export const getDeniedEmailTemplate = (application: any) => {
  const companyName = getCompanyName();
  const { personalInfo, businessInfo } = application;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #1F7832; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-family: 'Permanent Marker', cursive, Arial, sans-serif;">${companyName}</h1>
      </div>
      
      <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
        <h2>Application Status Update</h2>
        
        <p>Dear ${personalInfo.firstName} ${personalInfo.lastName},</p>
        
        <p>Thank you for submitting your financing application for <strong>${businessInfo.businessName}</strong>.</p>
        
        <p>After careful review of your application, we regret to inform you that we are unable to approve your request for financing at this time.</p>
        
        <p>Our lending specialists may contact you to discuss alternative options that might better suit your current situation or to provide guidance on how you might improve your application for future consideration.</p>
        
        <h3>Next Steps:</h3>
        <ul>
          <li>You may reapply after 90 days</li>
          <li>Consider exploring our alternative financing programs</li>
          <li>Contact our support team if you would like feedback on your application</li>
        </ul>
        
        <p>We appreciate your interest in ${companyName} and hope to have the opportunity to work with you in the future.</p>
        
        <p>Regards,<br>
        The ${companyName} Team</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666;">
          <p>This is an automated notification. Please do not reply to this email.</p>
          <p>Application Reference: ${application.id}</p>
        </div>
      </div>
    </div>
  `;
};

/**
 * Generate in-review application email template
 */
export const getInReviewEmailTemplate = (application: any) => {
  const companyName = getCompanyName();
  const { personalInfo, businessInfo } = application;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #1F7832; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-family: 'Permanent Marker', cursive, Arial, sans-serif;">${companyName}</h1>
      </div>
      
      <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
        <h2>Application Under Review</h2>
        
        <p>Dear ${personalInfo.firstName} ${personalInfo.lastName},</p>
        
        <p>Thank you for submitting your financing application for <strong>${businessInfo.businessName}</strong>.</p>
        
        <p>We wanted to inform you that your application is currently <strong>under review</strong> by our team. Our financing specialists are carefully evaluating your information to determine the best options for your business needs.</p>
        
        <h3>What This Means:</h3>
        <ul>
          <li>Your application has been received and is in our active review queue</li>
          <li>Our underwriting team is analyzing the information provided</li>
          <li>You may be contacted for additional information if needed</li>
          <li>A decision will typically be made within 3-5 business days</li>
        </ul>
        
        <p>There's no need to take any action at this time. We'll notify you once a decision has been made or if we need any additional information from you.</p>
        
        <p>Thank you for your patience and for choosing ${companyName} for your business financing needs.</p>
        
        <p>Regards,<br>
        The ${companyName} Team</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666;">
          <p>This is an automated notification. Please do not reply to this email.</p>
          <p>Application Reference: ${application.id}</p>
        </div>
      </div>
    </div>
  `;
};
