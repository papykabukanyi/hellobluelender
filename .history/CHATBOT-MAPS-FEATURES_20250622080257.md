# Chatbot and Maps Features Implementation

## Overview

This document outlines the implementation of two major features:

1. **Gemini AI-powered Chatbot**: An interactive chatbot that answers FAQs and guides users through the application process
2. **Geographic Insights Maps Dashboard**: A super admin only feature that visualizes application data on maps with AI-powered insights

## Gemini AI Chatbot

### Features

- Answers frequently asked questions about business financing options
- Interactive application collection through conversational interface
- Submits pre-applications to the system
- Modern, minimalist UI with typing animation
- Mobile-friendly design

### Implementation Details

- Built using Google's Gemini AI API
- Components:
  - `src/components/ChatBot.tsx`: Frontend component with UI and interaction logic
  - `src/app/api/chat/route.ts`: Backend API for Gemini AI integration
  - `src/app/api/pre-application/route.ts`: API for submitting applications collected by the chatbot

### Usage

The chatbot is automatically available on all pages of the site through a floating chat button in the corner of the screen. Users can:

1. Click the chat icon to open the chat interface
2. Ask questions about financing options, eligibility, etc.
3. Start an application process directly in the chat
4. Submit pre-applications that will be sent to administrators

## Maps Dashboard for Geographic Insights

### Features

- Interactive map showing business locations from applications
- Clustering for visualizing application density
- AI-powered insights on geographic trends
- Filtering by application status, date range, and loan amount
- Detailed location information on click

### Implementation Details

- Available only to super administrators
- Uses OpenStreetMap with Leaflet for visualization
- Gemini AI for trend analysis and insights
- Components:
  - `src/app/admin/maps/page.tsx`: Main dashboard page
  - `src/components/LeafletMap.tsx`: Reusable map component with clustering
  - `src/app/api/admin/geocode-applications/route.ts`: API for geocoding business addresses
  - `src/app/api/admin/analyze-applications/route.ts`: API for AI-powered geographic analysis

### Super Admin Restriction

Access to the Maps feature is restricted to the super admin account only. This is implemented through:

1. Server-side authorization checks
2. UI conditional rendering based on admin status
3. API route protection

## Application Deletion Restriction

As part of security enhancements, application deletion functionality is strictly limited to super administrators only. This is implemented through:

1. Server-side validation in the deletion API endpoint
2. UI controls that only display the delete button for super admins
3. Comprehensive error handling for unauthorized deletion attempts

## Technical Dependencies

- Google Gemini AI SDK: `@google/generative-ai`
- Leaflet (via react-leaflet): Open-source mapping library
- react-leaflet-markercluster: For clustering markers on the map
- Environment variables:
  - `GEMINI_API_KEY`: For Gemini AI integration

## Setup Instructions

1. Ensure API keys are properly configured in the `.env.local` file
2. Restart the application server to apply environment variable changes
3. Access the Maps feature via the Admin Dashboard (super admin only)
4. The chatbot will be automatically available on all pages
