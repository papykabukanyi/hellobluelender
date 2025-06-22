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
          
          if (data.status !== 'OK' || !data.results || data.results.length === 0) {
            throw new Error(`Geocoding failed for ${formattedAddress}: ${data.status}`);
          }
          
          const location = data.results[0].geometry.location;
          const accuracy = data.results[0].geometry.location_type === 'ROOFTOP' ? 1 :
                          data.results[0].geometry.location_type === 'RANGE_INTERPOLATED' ? 2 :
                          data.results[0].geometry.location_type === 'GEOMETRIC_CENTER' ? 3 : 4;
          
          // Store the location data with the application in Redis
          const applicationJson = await redis.get(`application:${app.id}`);
          if (applicationJson) {
            const applicationData = JSON.parse(applicationJson);
            applicationData.location = {
              lat: location.lat,
              lng: location.lng,
              accuracy
            };
            
            await redis.set(`application:${app.id}`, JSON.stringify(applicationData));
          }
          
          return {
            ...app,
            location: {
              lat: location.lat,
              lng: location.lng,
              accuracy
            }
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
