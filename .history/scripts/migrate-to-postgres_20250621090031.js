import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { PrismaClient } from '@prisma/client';
const Redis = require('ioredis');

// Initialize Redis client
const redisClient = new redis(process.env.REDIS_URL || 'redis://default:unlAQVqSudCdVZmmGIWsunXgsWlQKyuw@switchback.proxy.rlwy.net:15423');

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * Migrates data from Redis to PostgreSQL database
 */
async function migrateData() {
  try {
    console.log('Starting migration from Redis to PostgreSQL...');
    
    // 1. Migrate SMTP config
    await migrateSmtpConfig();
    
    // 2. Migrate email recipients
    await migrateEmailRecipients();
    
    // 3. Migrate admin users
    await migrateAdmins();
    
    // 4. Migrate applications
    await migrateApplications();
    
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close connections
    await prisma.$disconnect();
    await redisClient.quit();
  }
}

/**
 * Migrates SMTP config from Redis to PostgreSQL
 */
async function migrateSmtpConfig() {
  try {
    console.log('Migrating SMTP configuration...');
    const smtpJson = await redisClient.get('smtp:config');
    
    if (smtpJson) {
      const smtpConfig = JSON.parse(smtpJson);
      
      await prisma.sMTPConfig.create({
        data: {
          host: smtpConfig.host,
          port: smtpConfig.port,
          username: smtpConfig.username,
          password: smtpConfig.password,
          fromEmail: smtpConfig.fromEmail,
          fromName: smtpConfig.fromName,
          secure: smtpConfig.secure === true,
        },
      });
      
      console.log('SMTP configuration migrated successfully');
    } else {
      console.log('No SMTP configuration found in Redis');
    }
  } catch (error) {
    console.error('Error migrating SMTP config:', error);
  }
}

/**
 * Migrates email recipients from Redis to PostgreSQL
 */
async function migrateEmailRecipients() {
  try {
    console.log('Migrating email recipients...');
    const recipientsJson = await redisClient.get('email:recipients');
    
    if (recipientsJson) {
      const recipients = JSON.parse(recipientsJson);
      
      for (const recipient of recipients) {
        await prisma.emailRecipient.create({
          data: {
            name: recipient.name,
            email: recipient.email,
            active: recipient.active === true,
            createdAt: new Date(recipient.createdAt),
            updatedAt: new Date(recipient.updatedAt),
          },
        });
      }
      
      console.log(`${recipients.length} email recipients migrated successfully`);
    } else {
      console.log('No email recipients found in Redis');
    }
  } catch (error) {
    console.error('Error migrating email recipients:', error);
  }
}

/**
 * Migrates admin users from Redis to PostgreSQL
 */
async function migrateAdmins() {
  try {
    console.log('Migrating admin users...');
    const adminKeys = await redisClient.keys('admin:*');
    
    for (const key of adminKeys) {
      const adminJson = await redisClient.get(key);
      if (adminJson) {
        const admin = JSON.parse(adminJson);
        
        await prisma.adminUser.create({
          data: {
            id: admin.id,
            username: admin.username || null,
            email: admin.email,
            password: admin.password,
            role: admin.role || 'sub-admin',
            viewApplications: admin.permissions?.viewApplications === true,
            manageAdmins: admin.permissions?.manageAdmins === true,
            manageSmtp: admin.permissions?.manageSmtp === true, 
            manageRecipients: admin.permissions?.manageRecipients === true,
            createdAt: new Date(admin.createdAt),
            updatedAt: new Date(admin.updatedAt),
            addedBy: admin.addedBy || null,
          },
        });
      }
    }
    
    console.log(`${adminKeys.length} admin users migrated successfully`);
  } catch (error) {
    console.error('Error migrating admin users:', error);
  }
}

/**
 * Migrates loan applications from Redis to PostgreSQL with new 6-digit IDs
 */
async function migrateApplications() {
  try {
    console.log('Migrating loan applications...');
    const applicationIds = await redisClient.smembers('applications');
    
    let startingId = 100000; // Start with 6-digit ID
    
    for (const oldId of applicationIds) {
      const applicationJson = await redisClient.get(`application:${oldId}`);
      
      if (applicationJson) {
        const application = JSON.parse(applicationJson);
        const newId = (startingId++).toString();
        
        // Create personal info
        let personalInfoId = null;
        if (application.personalInfo) {
          const personalInfo = await prisma.personalInfo.create({
            data: {
              firstName: application.personalInfo.firstName,
              lastName: application.personalInfo.lastName,
              email: application.personalInfo.email,
              phone: application.personalInfo.phone,
              address: application.personalInfo.address,
              city: application.personalInfo.city,
              state: application.personalInfo.state,
              zipCode: application.personalInfo.zipCode,
              dateOfBirth: application.personalInfo.dateOfBirth,
              ssn: application.personalInfo.ssn,
              creditScore: application.personalInfo.creditScore || null,
            },
          });
          personalInfoId = personalInfo.id;
        }
        
        // Create business info
        let businessInfoId = null;
        if (application.businessInfo) {
          const businessInfo = await prisma.businessInfo.create({
            data: {
              businessName: application.businessInfo.businessName,
              businessType: application.businessInfo.businessType,
              businessAddress: application.businessInfo.businessAddress,
              businessCity: application.businessInfo.businessCity,
              businessState: application.businessInfo.businessState,
              businessZipCode: application.businessInfo.businessZipCode,
              yearsInBusiness: application.businessInfo.yearsInBusiness,
              annualRevenue: application.businessInfo.annualRevenue,
              taxId: application.businessInfo.taxId,
              businessPhone: application.businessInfo.businessPhone,
              businessEmail: application.businessInfo.businessEmail,
            },
          });
          businessInfoId = businessInfo.id;
        }
        
        // Create loan info
        let loanInfoId = null;
        if (application.loanInfo) {
          const loanInfo = await prisma.loanInfo.create({
            data: {
              loanType: application.loanInfo.loanType,
              loanAmount: application.loanInfo.loanAmount,
              loanTerm: application.loanInfo.loanTerm || null,
              loanPurpose: application.loanInfo.loanPurpose,
              equipmentType: application.loanInfo.equipmentType || null,
              equipmentCost: application.loanInfo.equipmentCost || null,
              equipmentVendor: application.loanInfo.equipmentVendor || null,
              downPayment: application.loanInfo.downPayment || null,
              monthlyRevenue: application.loanInfo.monthlyRevenue || null,
              timeInBusiness: application.loanInfo.timeInBusiness || null,
              useOfFunds: application.loanInfo.useOfFunds || null,
            },
          });
          loanInfoId = loanInfo.id;
        }
        
        // Create co-applicant info if exists
        let coApplicantInfoId = null;
        if (application.coApplicantInfo) {
          const coApplicantInfo = await prisma.coApplicantInfo.create({
            data: {
              firstName: application.coApplicantInfo.firstName,
              lastName: application.coApplicantInfo.lastName,
              email: application.coApplicantInfo.email,
              phone: application.coApplicantInfo.phone,
              address: application.coApplicantInfo.address,
              city: application.coApplicantInfo.city,
              state: application.coApplicantInfo.state,
              zipCode: application.coApplicantInfo.zipCode,
              dateOfBirth: application.coApplicantInfo.dateOfBirth,
              ssn: application.coApplicantInfo.ssn,
              creditScore: application.coApplicantInfo.creditScore || null,
              relationshipToBusiness: application.coApplicantInfo.relationshipToBusiness,
            },
          });
          coApplicantInfoId = coApplicantInfo.id;
        }
        
        // Create application
        const newApplication = await prisma.application.create({
          data: {
            id: newId,
            personalInfoId,
            businessInfoId,
            loanInfoId,
            coApplicantInfoId,
            signature: application.signature || null,
            coApplicantSignature: application.coApplicantSignature || null,
            status: application.status || 'draft',
            notes: application.notes || null,
            createdAt: new Date(application.createdAt),
            updatedAt: new Date(application.updatedAt),
          },
        });
        
        // Map old ID to new ID (store in Redis temporarily to help with transition)
        await redisClient.set(`id_map:${oldId}`, newId);
        
        console.log(`Migrated application ${oldId} to ${newId}`);
      }
    }
    
    console.log(`${applicationIds.length} applications migrated successfully`);
  } catch (error) {
    console.error('Error migrating applications:', error);
  }
}

// Start the migration
migrateData();
