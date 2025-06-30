// Comprehensive test to debug pre-application leads issue
const testData = {
  personalInfo: {
    firstName: "Debug",
    lastName: "Test",
    email: "debug@test.com",
    phone: "555-999-1234",
    creditScore: "720"
  },
  businessInfo: {
    businessName: "Debug Test Business",
    businessType: "retail",
    timeInBusiness: "2",
    monthlyRevenue: "25000"
  },
  loanInfo: {
    loanAmount: "75000",
    loanPurpose: "Debug test for leads integration"
  }
};

async function comprehensiveTest() {
  console.log('🚀 Starting comprehensive pre-application leads test...\n');
  
  try {
    // Step 1: Submit pre-application
    console.log('1️⃣ Submitting pre-application...');
    const preAppResponse = await fetch('http://localhost:3000/api/pre-application', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    console.log(`   Status: ${preAppResponse.status}`);
    const preAppResult = await preAppResponse.json();
    console.log(`   Response:`, preAppResult);
    
    if (!preAppResult.success) {
      console.log('❌ Pre-application failed');
      return;
    }
    
    const preAppId = preAppResult.id;
    console.log(`   ✅ Pre-application created: ${preAppId}\n`);
    
    // Step 2: Wait for processing
    console.log('2️⃣ Waiting 3 seconds for Redis operations...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 3: Check Redis directly (this would require Redis client, so skip for now)
    console.log('3️⃣ Would check Redis keys here (skipping for browser test)\n');
    
    // Step 4: Test admin leads API (will show authentication error, but that's expected)
    console.log('4️⃣ Testing admin leads API...');
    const leadsResponse = await fetch('http://localhost:3000/api/admin/leads');
    console.log(`   Status: ${leadsResponse.status}`);
    
    if (leadsResponse.status === 403) {
      console.log('   ✅ Admin API is properly protected');
    } else if (leadsResponse.status === 200) {
      const leadsData = await leadsResponse.json();
      console.log('   📊 Leads data:', leadsData);
      
      if (leadsData.success && leadsData.leads) {
        const preAppLead = leadsData.leads.find(lead => lead.id === preAppId);
        if (preAppLead) {
          console.log('   ✅ Pre-application found in leads!');
          console.log('   📋 Lead data:', preAppLead);
        } else {
          console.log('   ❌ Pre-application NOT found in leads');
        }
      }
    } else {
      const errorData = await leadsResponse.json();
      console.log('   ❌ Error:', errorData);
    }
    
    console.log('\n🏁 Test completed!');
    console.log(`\n📝 Summary:`);
    console.log(`   - Pre-application ID: ${preAppId}`);
    console.log(`   - Expected Redis key: chat:lead:pre_${preAppId}`);
    console.log(`   - To verify: Check admin dashboard at /admin/leads`);
    console.log(`   - Login as: papy@hempire-enterprise.com`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
comprehensiveTest();
