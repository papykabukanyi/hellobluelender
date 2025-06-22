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
  
  // Add company header
  doc.setFontSize(24);
  doc.setTextColor(31, 120, 50); // Green color for Hempire
  doc.text('HEMPIRE ENTERPRISE', 105, 20, { align: 'center' });
  
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
  doc.text(`Address: ${applicationData.personalInfo.address}`, 20, 65);
  doc.text(`City: ${applicationData.personalInfo.city}, State: ${applicationData.personalInfo.state}, Zip: ${applicationData.personalInfo.zipCode}`, 20, 70);
    // Business Information
  doc.setFontSize(12);
  doc.text('Business Information', 20, 80);
  doc.setFontSize(10);
  doc.text(`Business Name: ${applicationData.businessInfo.businessName}`, 20, 90);
  doc.text(`Business Type: ${applicationData.businessInfo.businessType}`, 20, 95);
  doc.text(`Business Address: ${applicationData.businessInfo.businessAddress}`, 20, 100);
  doc.text(`City: ${applicationData.businessInfo.businessCity}, State: ${applicationData.businessInfo.businessState}, Zip: ${applicationData.businessInfo.businessZipCode}`, 20, 105);
  doc.text(`Years in Business: ${applicationData.businessInfo.yearsInBusiness}`, 20, 110);
  doc.text(`Annual Revenue: $${applicationData.businessInfo.annualRevenue}`, 20, 115);
    // Loan Information
  doc.setFontSize(12);
  doc.text('Loan Information', 20, 125);
  doc.setFontSize(10);  doc.text(`Loan Type: ${applicationData.loanInfo.loanType}`, 20, 135);
  doc.text(`Loan Amount Requested: $${applicationData.loanInfo.loanAmount}`, 20, 140);
  
  // Handle loan purpose display - different field names based on loan type
  const loanPurpose = applicationData.loanInfo.loanType === 'Business' 
    ? applicationData.loanInfo.useOfFunds 
    : applicationData.loanInfo.loanPurpose;
  doc.text(`Loan Purpose: ${loanPurpose || 'Not specified'}`, 20, 145);
  
  // If it's an equipment loan
  if (applicationData.loanInfo.loanType === 'Equipment') {
    const equipmentLoanInfo = applicationData.loanInfo as any;
    doc.text(`Equipment Type: ${equipmentLoanInfo.equipmentType || 'N/A'}`, 20, 150);
    doc.text(`Equipment Cost: $${equipmentLoanInfo.equipmentCost || 'N/A'}`, 20, 155);
    doc.text(`Equipment Vendor: ${equipmentLoanInfo.equipmentVendor || 'N/A'}`, 20, 160);
  }
  
  // Agreement
  doc.setFontSize(12);
  doc.text('Agreement', 20, 170);
  doc.setFontSize(10);
  doc.text('I confirm that the information provided in this application is true and accurate.', 20, 180);
  doc.text('I authorize Hempire Enterprise to verify any information provided in this application.', 20, 185);
  
  // Add signature if provided
  if (signatureDataUrl) {
    doc.text('Signature:', 20, 195);
    doc.addImage(signatureDataUrl, 'PNG', 60, 190, 50, 20);
  }
  
  // Add date
  const currentDate = new Date().toLocaleDateString();
  doc.text(`Date: ${currentDate}`, 20, 215);
  // Add submission metadata (only visible in admin version)
  if (isAdmin) {
    doc.setFontSize(9);
    doc.text('Application Metadata (For Internal Use Only)', 20, 240);
    doc.setFontSize(8);
    doc.text(`IP Address: ${ipAddress}`, 20, 248);
    doc.text(`User Agent: ${userAgent}`, 20, 254);
    doc.text(`Submission Date: ${new Date().toLocaleString()}`, 20, 260);
    doc.text(`Application ID: ${applicationData.id || 'Not assigned yet'}`, 20, 266);
  }
  
  // Footer
  doc.setFontSize(8);
  doc.text('Hempire Enterprise - Confidential Application Document', 105, 280, { align: 'center' });
  
  // Save to blob
  const pdfBlob = doc.output('blob');
  return pdfBlob;
};
