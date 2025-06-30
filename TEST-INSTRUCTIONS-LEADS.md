# Testing Instructions for Leads and Map Features

This document provides detailed instructions for testing the newly implemented leads capture, leads management, and map features in the Hempire Enterprise application.

## Prerequisites

1. Ensure you have the `.env.local` file properly configured with:
   - `GEMINI_API_KEY`: For chatbot functionality
   - `REDIS_URL`: For storing chat sessions and leads data
   - `SMTP_USER`: Set to the email of the super admin user

2. Make sure Redis server is running and accessible via the configured URL

## 1. Testing Chatbot Lead Capture

### 1.1 Basic Chatbot Functionality

1. Navigate to the homepage of the application
2. Click on the chat icon in the bottom right corner to open the chatbot
3. Verify the chatbot displays an initial greeting
4. Test basic FAQ responses:
   - Ask "What loan types do you offer?"
   - Ask "What are your interest rates?"
   - Ask "How long does approval take?"

### 1.2 Lead Information Capture

1. Start a new conversation with the chatbot
2. Provide personal information in natural language:
   - "My name is John Doe"
   - "My email is john.doe@example.com"
   - "My phone number is 555-123-4567"
   - "I own ABC Enterprises"
3. Express interest in financing:
   - "I'm interested in getting a business loan"
   - "I need financing for equipment"
   - "How can I apply for $50,000 in working capital?"
4. Complete several distinct chat sessions with varying information

## 2. Testing Super Admin Leads Page

### 2.1 Access Control

1. Log in as a regular admin user (not the SMTP_USER account)
2. Verify the "Leads" tab is NOT visible in the sidebar
3. Attempt to navigate directly to `/admin/leads`
4. Verify you receive an "Access Denied" message
5. Log out and log in as the super admin (using the SMTP_USER email)
6. Verify the "Leads" tab IS visible in the sidebar

### 2.2 Leads Display and Filtering

1. Navigate to Admin → Leads
2. Verify leads captured from chatbot sessions appear in the list
3. Verify incomplete applications appear in the leads list
4. Test the priority filters:
   - Filter by "High" priority
   - Filter by "Medium" priority
   - Filter by "Low" priority
   - Return to "All Priorities"
5. Test the source filters:   - Filter by "Chat Conversations"
   - Filter by "Incomplete Applications"
   - Return to "All Sources"

### 2.3 Lead Management

1. Click "View Details" for a lead
2. Verify lead details are displayed
3. Click "Mark Contacted" for a lead
4. Verify the lead's status updates to reflect it was contacted
5. Verify the lead's priority changes to "low" after being marked as contacted

## 3. Testing Admin Map Feature

### 3.1 Access Control

1. Log in as a regular admin user (not the SMTP_USER account)
2. Verify the "Maps" tab is NOT visible in the sidebar
3. Attempt to navigate directly to `/admin/maps`
4. Verify you receive an "Access Denied" message
5. Log out and log in as the super admin (using the SMTP_USER email)
6. Verify the "Maps" tab IS visible in the sidebar

### 3.2 Map Functionality

1. Navigate to Admin → Maps
2. Verify the map loads properly with Leaflet tiles
3. Verify application markers appear on the map
4. Click on a marker cluster to zoom in
5. Click on an individual marker to view the popup
6. Verify the popup displays:
   - Business name
   - Application ID
   - Loan amount
   - Status
   - Creation date

## 4. End-to-End Lead Capture Flow

This test verifies the complete lead capture journey from chat to admin display.

1. Open an incognito/private browser window
2. Navigate to the homepage of the application
3. Open the chatbot and conduct the following conversation:

   ```text
   User: Hi, I'm looking for financing
   Bot: [Response]
   User: My name is Jane Smith and I need $100,000 for my business
   Bot: [Response]
   User: My email is jane.smith@example.com and my phone is 555-987-6543
   Bot: [Response]
   User: My company is called Smith Enterprises
   Bot: [Response]
   ```
4. Close the chatbot and browser window
5. Log in to the admin panel as super admin
6. Navigate to Admin → Leads
7. Verify a new lead appears with:
   - Name: Jane Smith
   - Email: jane.smith@example.com
   - Phone: 555-987-6543
   - Business: Smith Enterprises
   - High priority (due to financing mention)

## 5. Error Handling Tests

### 5.1 API Key Error

1. Temporarily remove or invalidate the GEMINI_API_KEY in .env.local
2. Restart the development server
3. Open the chatbot
4. Ask a non-FAQ question
5. Verify a graceful error message is displayed
6. Restore the valid API key

### 5.2 Redis Connection Issues

1. Temporarily change the REDIS_URL to an invalid value
2. Restart the development server
3. Complete steps from test 4 (End-to-End Lead Capture Flow)
4. Verify the application handles the Redis connection failure gracefully
5. Restore the valid Redis URL

## Troubleshooting

If you encounter issues during testing, check the following:

1. Server console logs for any API errors
2. Browser developer tools console for client-side errors
3. Verify Redis connection and data using Redis CLI:

   ```bash
   redis-cli -u [YOUR_REDIS_URL]
   keys chat:session:*
   keys chat:lead:*
   ```
4. Confirm the SMTP_USER environment variable matches the email you're using for super admin login

## Expected Results

1. The chatbot should accurately identify and save potential leads
2. Super admin should see both chat-based leads and incomplete applications
3. The map should display application locations correctly
4. All features should be properly restricted to super admin access
5. The application should handle errors gracefully at all points
