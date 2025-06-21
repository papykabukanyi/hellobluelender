# Step-by-Step Testing Instructions for Hempire Enterprise

## Prerequisites

1. Make sure all dependencies are installed:

   ```bash
   npm install
   ```

2. Ensure Redis is running. The application is configured to use:

   ```plaintext
   REDIS_URL=redis://default:unlAQVqSudCdVZmmGIWsunXgsWlQKyuw@switchback.proxy.rlwy.net:15423
   ```

## Testing Process

### Step 1: Start the Application Server

1. Open a terminal and start the development server:

   ```bash
   cd c:\Users\lovingtracktor\Desktop\hellobluelender
   npm run dev
   ```

2. Wait until you see a message that the server is running on `http://localhost:3000`

### Step 2: Verify the Server is Running

1. Open your browser and navigate to `http://localhost:3000`
2. Check that the Hempire Enterprise homepage loads correctly

### Step 3: Run the Comprehensive Tests

1. Open a new terminal window (keep the server running in the first window)
2. Run the test script:
   ```bash
   cd c:\Users\lovingtracktor\Desktop\hellobluelender
   npm run test
   ```

3. The test will:
   - Submit 10 different loan applications
   - Test application ID generation (6-digit IDs)
   - Verify signature capture
   - Send email notifications to papykabukanyi@gmail.com
   - Generate PDF documents

### Step 4: Check Email Notifications

1. Check the email inbox at **papykabukanyi@gmail.com**
2. You should receive:
   - 10 admin notification emails with application details
   - 10 applicant confirmation emails

### Step 5: Verify Application Storage

1. You can check if applications were properly stored in Redis
2. Applications are stored with keys like: `application:{6-digit-id}`

## Troubleshooting

If you encounter errors:

1. **Server Not Running**: Make sure the development server is running on port 3000
2. **Redis Connection Issues**: Verify Redis is accessible with the provided URL
3. **Email Sending Failures**: Check the SMTP configuration in .env.local
4. **Console Errors**: Look for error messages in both terminal windows

## Important Notes

- All data is real and processes the complete application flow
- All tests use the real APIs, not simulations
- Email confirmations are sent to papykabukanyi@gmail.com
- The tests create applications with appropriate validation
