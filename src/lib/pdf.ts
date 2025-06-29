import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// Generate PDF from form data
export const generatePDF = async (
  applicationData: any, 
  signatureDataUrl: string | null,
  ipAddress: string = '0.0.0.0',
  userAgent: string = 'Unknown Device',
  isAdmin: boolean = true
): Promise<Blob> => {
  const doc = new jsPDF();
    // Add company header with updated branding
  doc.setFontSize(28);
  doc.setTextColor(0, 0, 0); // Black color for EMPIRE ENTREPRISE
  doc.setFont(undefined, 'bold');
  doc.text('EMPIRE ENTREPRISE', 105, 20, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text(applicationData.loanInfo?.loanType + ' Loan Application', 105, 30, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
    // Personal Information
  doc.setFontSize(12);
  doc.text('Personal Information', 20, 40);
  doc.setFontSize(10);
  doc.text(`Full Name: ${applicationData.personalInfo.firstName} ${applicationData.personalInfo.lastName}`, 20, 50);
  doc.text(`Email: ${applicationData.personalInfo.email}`, 20, 55);
  doc.text(`Phone: ${applicationData.personalInfo.phone}`, 20, 60);
  doc.text(`Date of Birth: ${applicationData.personalInfo.dateOfBirth || 'N/A'}`, 20, 65);
  doc.text(`SSN: ${applicationData.personalInfo.ssn || 'N/A'}`, 20, 70);  
  doc.text(`Address: ${applicationData.personalInfo.address}`, 20, 75);
  doc.text(`City: ${applicationData.personalInfo.city}, State: ${applicationData.personalInfo.state}, Zip: ${applicationData.personalInfo.zipCode}`, 20, 80);
    // Business Information
  doc.setFontSize(12);
  doc.text('Business Information', 20, 90);
  doc.setFontSize(10);
  doc.text(`Business Name: ${applicationData.businessInfo.businessName}`, 20, 100);
  doc.text(`Business Type: ${applicationData.businessInfo.businessType}`, 20, 105);
  doc.text(`Tax ID / EIN: ${applicationData.businessInfo.taxId || 'N/A'}`, 20, 110);
  doc.text(`Business Address: ${applicationData.businessInfo.businessAddress}`, 20, 115);
  doc.text(`City: ${applicationData.businessInfo.businessCity}, State: ${applicationData.businessInfo.businessState}, Zip: ${applicationData.businessInfo.businessZipCode}`, 20, 120);
  doc.text(`Years in Business: ${applicationData.businessInfo.yearsInBusiness}`, 20, 125);
  doc.text(`Annual Revenue: $${applicationData.businessInfo.annualRevenue}`, 20, 130);
  doc.text(`Business Phone: ${applicationData.businessInfo.businessPhone || 'N/A'}`, 20, 135);
  doc.text(`Business Email: ${applicationData.businessInfo.businessEmail || 'N/A'}`, 20, 140);
    // Loan Information
  doc.setFontSize(12);
  doc.text('Loan Information', 20, 150);
  doc.setFontSize(10);  doc.text(`Loan Type: ${applicationData.loanInfo.loanType}`, 20, 160);
  doc.text(`Loan Amount Requested: $${applicationData.loanInfo.loanAmount}`, 20, 165);
  
  // Handle loan purpose display - different field names based on loan type
  const loanPurpose = applicationData.loanInfo.loanType === 'Business' 
    ? applicationData.loanInfo.useOfFunds 
    : applicationData.loanInfo.loanPurpose;
  doc.text(`Loan Purpose: ${loanPurpose || 'Not specified'}`, 20, 170);
  
  // If it's an equipment loan
  if (applicationData.loanInfo.loanType === 'Equipment') {
    const equipmentLoanInfo = applicationData.loanInfo as any;
    doc.text(`Equipment Type: ${equipmentLoanInfo.equipmentType || 'N/A'}`, 20, 175);
    doc.text(`Equipment Cost: $${equipmentLoanInfo.equipmentCost || 'N/A'}`, 20, 180);
    doc.text(`Equipment Vendor: ${equipmentLoanInfo.equipmentVendor || 'N/A'}`, 20, 185);
  }
    
  // Co-Applicant Information (if provided)
  if (applicationData.coApplicantInfo) {
    doc.setFontSize(12);
    doc.text('Co-Applicant Information', 20, applicationData.loanInfo.loanType === 'Equipment' ? 195 : 185);
    doc.setFontSize(10);
    const coY = applicationData.loanInfo.loanType === 'Equipment' ? 205 : 195;
    doc.text(`Co-Applicant Name: ${applicationData.coApplicantInfo.firstName} ${applicationData.coApplicantInfo.lastName}`, 20, coY);
    doc.text(`Relationship to Business: ${applicationData.coApplicantInfo.relationshipToBusiness || 'N/A'}`, 20, coY + 5);
    doc.text(`Email: ${applicationData.coApplicantInfo.email || 'N/A'}`, 20, coY + 10);
    doc.text(`Phone: ${applicationData.coApplicantInfo.phone || 'N/A'}`, 20, coY + 15);
    doc.text(`SSN: ${applicationData.coApplicantInfo.ssn || 'N/A'}`, 20, coY + 20);
    doc.text(`Date of Birth: ${applicationData.coApplicantInfo.dateOfBirth || 'N/A'}`, 20, coY + 25);
  }
    
  // Co-Applicant Information (if provided)
  if (applicationData.coApplicantInfo) {
    doc.setFontSize(12);
    doc.text('Co-Applicant Information', 20, applicationData.loanInfo.loanType === 'Equipment' ? 195 : 185);
    doc.setFontSize(10);
    const coY = applicationData.loanInfo.loanType === 'Equipment' ? 205 : 195;
    doc.text(`Co-Applicant Name: ${applicationData.coApplicantInfo.firstName} ${applicationData.coApplicantInfo.lastName}`, 20, coY);
    doc.text(`Relationship to Business: ${applicationData.coApplicantInfo.relationshipToBusiness || 'N/A'}`, 20, coY + 5);
    doc.text(`Email: ${applicationData.coApplicantInfo.email || 'N/A'}`, 20, coY + 10);
    doc.text(`Phone: ${applicationData.coApplicantInfo.phone || 'N/A'}`, 20, coY + 15);
    doc.text(`SSN: ${applicationData.coApplicantInfo.ssn || 'N/A'}`, 20, coY + 20);
    doc.text(`Date of Birth: ${applicationData.coApplicantInfo.dateOfBirth || 'N/A'}`, 20, coY + 25);
  }
    
    // Agreement
  doc.setFontSize(12);
  const agreementY = applicationData.coApplicantInfo 
    ? (applicationData.loanInfo.loanType === 'Equipment' ? 240 : 230)
    : 195;
  doc.text('Agreement', 20, agreementY);
  doc.setFontSize(10);
  doc.text('I confirm that the information provided in this application is true and accurate.', 20, agreementY + 10);
  doc.text('I authorize EMPIRE ENTREPRISE to verify any information provided in this application.', 20, agreementY + 15);
    // Add signature if provided or generate a signature from name
  const signatureY = agreementY + 25;
  if (signatureDataUrl) {
    doc.text('Signature:', 20, signatureY);
    doc.addImage(signatureDataUrl, 'PNG', 60, signatureY - 5, 50, 20);
  } else if (applicationData.personalInfo?.firstName && applicationData.personalInfo?.lastName) {
    // Generate a signature-like text with the name
    doc.text('Signature:', 20, signatureY);
    
    // Set signature style with italics and signature-like font
    doc.setFont('italic');
    doc.setFontSize(18);
    doc.text(`${applicationData.personalInfo.firstName} ${applicationData.personalInfo.lastName}`, 60, signatureY);
    
    // Reset font
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
  }
  
  // Add date
  const currentDate = new Date().toLocaleDateString();
  doc.text(`Date: ${currentDate}`, 20, signatureY + 25);
  // Add submission metadata (only visible in admin version)
  if (isAdmin) {
    const metadataY = (applicationData.coApplicantInfo 
      ? (applicationData.loanInfo.loanType === 'Equipment' ? 290 : 280)
      : 265) + 25;
    doc.setFontSize(9);
    doc.text('Application Metadata (For Internal Use Only)', 20, metadataY);
    doc.setFontSize(8);
    doc.text(`IP Address: ${ipAddress}`, 20, metadataY + 8);
    doc.text(`User Agent: ${userAgent}`, 20, metadataY + 14);
    doc.text(`Submission Date: ${new Date().toLocaleString()}`, 20, metadataY + 20);
    doc.text(`Application ID: ${applicationData.id || 'Not assigned yet'}`, 20, metadataY + 26);
  }
    // Footer
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.text('EMPIRE ENTREPRISE - Confidential Application Document', 105, 280, { align: 'center' });
  
  // Save to blob
  const pdfBlob = doc.output('blob');
  return pdfBlob;
};
