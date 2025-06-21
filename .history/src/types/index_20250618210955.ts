// Application Types
export type LoanType = 'Business' | 'Equipment';

export interface BusinessInfo {
  businessName: string;
  businessType: string;
  businessAddress: string;
  businessCity: string;
  businessState: string;
  businessZipCode: string;
  yearsInBusiness: number;
  annualRevenue: number;
  taxId: string; // EIN or SSN
  businessPhone: string;
  businessEmail: string;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  dateOfBirth: string;
  ssn: string;
  creditScore?: number;
}

// Co-applicant info structure (same as PersonalInfo)
export interface CoApplicantInfo extends PersonalInfo {
  relationshipToBusiness: string;
}

export interface LoanInfo {
  loanType: LoanType;
  loanAmount: number;
  loanTerm?: number; // in months
  loanPurpose: string;
}

export interface EquipmentLoanInfo extends LoanInfo {
  equipmentType: string;
  equipmentCost: number;
  equipmentVendor?: string;
  downPayment?: number;
}

export interface BusinessLoanInfo extends LoanInfo {
  monthlyRevenue: number;
  timeInBusiness: number;
  useOfFunds: string;
}

export interface ApplicationDocuments {
  businessTaxReturns?: File[];
  personalTaxReturns?: File[];
  bankStatements?: File[];
  profitLossStatements?: File[];
  equipmentInvoice?: File; // For equipment loans
  businessLicense?: File;
  identificationDocument?: File;
}

export interface LoanApplication {
  id?: string;
  personalInfo: PersonalInfo;
  businessInfo: BusinessInfo;
  loanInfo: LoanInfo | EquipmentLoanInfo | BusinessLoanInfo;
  coApplicantInfo?: CoApplicantInfo; // Optional co-applicant information
  coApplicantSignature?: string; // Optional co-applicant signature
  documents?: ApplicationDocuments;
  signature?: string; // Base64 encoded signature
  status?: 'draft' | 'submitted' | 'in-review' | 'approved' | 'denied';
  createdAt?: string;
  updatedAt?: string;
}

// Admin Types
export interface AdminUser {
  id: string;
  username?: string; // Optional field, primarily for super admin
  email: string;
  password: string; // Hashed
  role: 'admin' | 'sub-admin';
  permissions: {
    viewApplications: boolean;
    manageAdmins: boolean;
    manageSmtp: boolean;
    manageRecipients: boolean;
  };
  createdAt: string;
  updatedAt: string;
  addedBy?: string; // ID of admin who added this admin
}

export interface EmailRecipient {
  id: string;
  name: string;
  email: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SMTPConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  secure: boolean;
}
