import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// Generate PDF from form data
export const generatePDF = async (
  applicationData: any, 
  signatureDataUrl: string | null
): Promise<Blob> => {
  const doc = new jsPDF();
  
  // Add company header
  doc.setFontSize(20);
  doc.setTextColor(31, 32, 65); // #1F2041
  doc.text('BLUE LENDER', 105, 20, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text(applicationData.loanType + ' Loan Application', 105, 30, { align: 'center' });
  
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
  doc.text(`Business Name: ${applicationData.businessName}`, 20, 90);
  doc.text(`Business Type: ${applicationData.businessType}`, 20, 95);
  doc.text(`Business Address: ${applicationData.businessAddress}`, 20, 100);
  doc.text(`City: ${applicationData.businessCity}, State: ${applicationData.businessState}, Zip: ${applicationData.businessZipCode}`, 20, 105);
  doc.text(`Years in Business: ${applicationData.yearsInBusiness}`, 20, 110);
  doc.text(`Annual Revenue: $${applicationData.annualRevenue}`, 20, 115);
  
  // Loan Information
  doc.setFontSize(12);
  doc.text('Loan Information', 20, 125);
  doc.setFontSize(10);
  doc.text(`Loan Type: ${applicationData.loanType}`, 20, 135);
  doc.text(`Loan Amount Requested: $${applicationData.loanAmount}`, 20, 140);
  doc.text(`Loan Purpose: ${applicationData.loanPurpose}`, 20, 145);
  
  // If it's an equipment loan
  if (applicationData.loanType === 'Equipment') {
    doc.text(`Equipment Type: ${applicationData.equipmentType || 'N/A'}`, 20, 150);
    doc.text(`Equipment Cost: $${applicationData.equipmentCost || 'N/A'}`, 20, 155);
    doc.text(`Equipment Vendor: ${applicationData.equipmentVendor || 'N/A'}`, 20, 160);
  }
  
  // Agreement
  doc.setFontSize(12);
  doc.text('Agreement', 20, 170);
  doc.setFontSize(10);
  doc.text('I confirm that the information provided in this application is true and accurate.', 20, 180);
  doc.text('I authorize Blue Lender to verify any information provided in this application.', 20, 185);
  
  // Add signature if provided
  if (signatureDataUrl) {
    doc.text('Signature:', 20, 195);
    doc.addImage(signatureDataUrl, 'PNG', 60, 190, 50, 20);
  }
  
  // Add date
  const currentDate = new Date().toLocaleDateString();
  doc.text(`Date: ${currentDate}`, 20, 215);
  
  // Footer
  doc.setFontSize(8);
  doc.text('Blue Lender - Confidential Application Document', 105, 280, { align: 'center' });
  
  // Save to blob
  const pdfBlob = doc.output('blob');
  return pdfBlob;
};
