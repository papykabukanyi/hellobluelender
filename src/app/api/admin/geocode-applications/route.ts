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
    console.log('Geocode API - Current admin:', currentAdmin.email, 'SMTP user:', smtpUser);
    
    if (currentAdmin.email !== smtpUser) {
      console.log('Access denied: Not super admin');
      return NextResponse.json(
        { success: false, error: 'Only the super admin can access this endpoint' },
        { status: 403 }
      );
    }
    
    console.log('Super admin access granted');
    
    const { applications } = await request.json();
    
    if (!applications || !Array.isArray(applications)) {
      return NextResponse.json(
        { success: false, error: 'Applications array is required' },
        { status: 400 }
      );
    }
      // Geocode each application using business address
    const geocodedApplications = await Promise.all(
      applications.map(async (app) => {
        try {
          // Use business address primarily for geocoding
          const businessAddress = app.businessInfo?.businessAddress;
          const businessCity = app.businessInfo?.businessCity;
          const businessState = app.businessInfo?.businessState;
          const businessZipCode = app.businessInfo?.businessZipCode;
          
          // Build full business address
          let fullAddress = '';
          if (businessAddress) {
            fullAddress = businessAddress;
            if (businessCity) {
              fullAddress += `, ${businessCity}`;
            }
            if (businessState) {
              fullAddress += `, ${businessState}`;
            }
            if (businessZipCode) {
              fullAddress += ` ${businessZipCode}`;
            }
          } else if (businessZipCode) {
            // Fallback to ZIP code if no business address
            fullAddress = businessZipCode;
          }
          
          // Skip if no address information is available
          if (!fullAddress) {
            console.warn(`No business address found for application ${app.id}`);
            return {
              ...app,
              location: null
            };
          }
          
          // Use full business address for geocoding
          console.log(`Geocoding business address for ${app.id}: ${fullAddress}`);
          const encodedQuery = encodeURIComponent(fullAddress);
          
          // Call the Nominatim API (OpenStreetMap)
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=1&countrycodes=us`, {
            headers: {
              'User-Agent': 'EMPIRE-ENTREPRISE-Admin/1.0',
              'Accept-Language': 'en-US,en;q=0.9'
            }
          });
          
          if (!response.ok) {
            throw new Error(`Nominatim API returned ${response.status}`);
          }
          
          const data = await response.json();
            // Check if we got results
          if (!data || data.length === 0) {
            console.warn(`No geocoding results found for business address: ${fullAddress}`);
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
