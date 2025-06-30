// Simple test to submit pre-application and verify data
fetch('http://localhost:3000/api/pre-application', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    personalInfo: {
      firstName: "John",
      lastName: "Test",
      email: "john.test@example.com",
      phone: "555-123-4567"
    },
    businessInfo: {
      businessName: "Test Business",
      businessType: "retail"
    },
    loanInfo: {
      loanAmount: "50000",
      loanPurpose: "Testing leads integration"
    }
  })
})
.then(response => response.json())
.then(data => {
  console.log('✅ Pre-application result:', data);
  if (data.success) {
    console.log(`🎯 Created pre-application with ID: ${data.id}`);
    console.log('Now check the admin leads dashboard!');
  }
})
.catch(error => {
  console.error('❌ Error:', error);
});
