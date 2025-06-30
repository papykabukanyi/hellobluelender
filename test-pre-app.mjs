// Test pre-application submission and verification
async function testPreApplication() {
  console.log('🧪 Testing Pre-Application Lead Creation...\n');
  
  // Step 1: Submit pre-application
  const testData = {
    personalInfo: {
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      phone: "555-123-4567",
      creditScore: "720"
    },
    businessInfo: {
      businessName: "Test Business",
      businessType: "retail",
      timeInBusiness: "2",
      monthlyRevenue: "25000"
    },
    loanInfo: {
      loanAmount: "50000",
      loanPurpose: "Equipment purchase test"
    }
  };
  
  try {
    console.log('1️⃣ Submitting pre-application...');
    const response = await fetch('http://localhost:3000/api/pre-application', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Result:`, result);
    
    if (result.success) {
      console.log(`✅ Pre-application created with ID: ${result.id}\n`);
      
      // Step 2: Wait a moment
      console.log('2️⃣ Waiting 2 seconds...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 3: Try to fetch leads (this will likely fail due to auth, but we can see the error)
      console.log('3️⃣ Checking leads API...');
      const leadsResponse = await fetch('http://localhost:3000/api/admin/leads');
      console.log(`Leads API Status: ${leadsResponse.status}`);
      
      if (leadsResponse.status === 403) {
        console.log('✅ API is protected (expected)');
      } else {
        const leadsData = await leadsResponse.json();
        console.log('Leads data:', leadsData);
      }
      
    } else {
      console.log('❌ Pre-application submission failed');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testPreApplication();
