import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/permissions';
import redis from '@/lib/redis';

// API route to geocode applications
export async function POST(request: NextRequest) {
  try {
    // Check if user is a super admin
    const currentAdmin = await requirePermission(request, 'viewApplications');
    
    // If requirePermission returns a NextResponse, it means unauthorized
    if ('status' in currentAdmin && currentAdmin.status === 403) {
      return currentAdmin;
    }
    
    // Check if user is a super admin (SMTP User from env)
    const smtpUser = process.env.SMTP_USER || '';
    if (currentAdmin.email !== smtpUser) {
      return NextResponse.json(
        { success: false, error: 'Only the super admin can access this endpoint' },
        { status: 403 }
      );
    }
    
    const { applications } = await request.json();
    
    if (!applications || !Array.isArray(applications)) {
      return NextResponse.json(
        { success: false, error: 'Applications array is required' },
        { status: 400 }
      );
    }
      // Geocode each application
    const geocodedApplications = await Promise.all(
      applications.map(async (app) => {
        try {
          // Try to get location from business address or ZIP code
          const address = app.businessInfo?.businessAddress;
          const city = app.businessInfo?.city;
          const state = app.businessInfo?.state;
          const zipCode = app.businessInfo?.zipCode;
          
          // Skip if no address information is available
          if (!address && !zipCode) {
            return {
              ...app,
              location: null
            };
          }
          
          // Format the address query
          const query = `${address || ''} ${city || ''} ${state || ''} ${zipCode || ''}`.trim();
          const encodedQuery = encodeURIComponent(query);
          
          // Call the Nominatim API (OpenStreetMap)
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=1`, {
            headers: {
              'User-Agent': 'HempireEnterprise/1.0',
              'Accept-Language': 'en-US,en;q=0.9'
            }
          });
          
          if (!response.ok) {
            throw new Error(`Nominatim API returned ${response.status}`);
          }
          
          const data = await response.json();
            // Check if we got results
          if (!data || data.length === 0) {
            console.warn(`No geocoding results found for address: ${query}`);
            return {
              ...app,
              location: null
            };
          }
            // Extract coordinates from the first result
          const result = data[0];
          const location = {
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon),
            accuracy: Math.round(parseFloat(result.importance) * 10), // Convert importance to an accuracy score (0-10)
          };
            // Store the location data with the application in Redis
          const applicationJson = await redis.get(`application:${app.id}`);
          if (applicationJson) {
            const applicationData = JSON.parse(applicationJson);
            applicationData.location = location;
            
            await redis.set(`application:${app.id}`, JSON.stringify(applicationData));
          }
          
          // Add 1-second delay to respect Nominatim usage policy
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          return {
            ...app,
            location
          };
        } catch (error) {
          console.error(`Error geocoding application ${app.id}:`, error);
          return {
            ...app,
            location: null
          };
        }
      })
    );
    
    return NextResponse.json({ 
      success: true, 
      geocodedApplications: geocodedApplications.filter(app => app.location)
    });
  } catch (error) {
    console.error('Error geocoding applications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to geocode applications' },
      { status: 500 }
    );
  }
}
