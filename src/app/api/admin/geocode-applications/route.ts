import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/permissions';
import redis from '@/lib/redis';

// Backup geocoding function using multiple services
async function tryGeocoding(address: string, appId: string): Promise<{lat: number, lng: number, accuracy: number} | null> {
  // Try Nominatim first
  try {
    console.log(`Trying Nominatim for ${appId}: ${address}`);
    const encodedQuery = encodeURIComponent(address);
    
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=1&countrycodes=us&addressdetails=1&dedupe=1`, {
      headers: {
        'User-Agent': 'EMPIRE-ENTREPRISE-Admin/1.0 (business@empire-entreprise.com)',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        const result = data[0];
        return {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          accuracy: Math.round(parseFloat(result.importance || 0.5) * 10),
        };
      }
    }
  } catch (error) {
    console.warn(`Nominatim failed for ${address}:`, error);
  }
  
  // Try Photon (another OpenStreetMap-based service) as backup
  try {
    console.log(`Trying Photon for ${appId}: ${address}`);
    const encodedQuery = encodeURIComponent(address);
    
    const response = await fetch(`https://photon.komoot.io/api/?q=${encodedQuery}&limit=1&osm_tag=!city`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.features && data.features.length > 0) {
        const feature = data.features[0];
        const [lng, lat] = feature.geometry.coordinates;
        return {
          lat: lat,
          lng: lng,
          accuracy: 7, // Default accuracy for Photon
        };
      }
    }
  } catch (error) {
    console.warn(`Photon failed for ${address}:`, error);
  }
  
  return null;
}

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
      // Geocode each application using business address with fallback strategies
    const geocodedApplications = await Promise.all(
      applications.map(async (app) => {
        try {
          // Use business address primarily for geocoding
          const businessAddress = app.businessInfo?.businessAddress;
          const businessCity = app.businessInfo?.businessCity;
          const businessState = app.businessInfo?.businessState;
          const businessZipCode = app.businessInfo?.businessZipCode;
          
          // Try multiple address formats for better geocoding success
          const addressVariations = [];
          
          // Full address
          if (businessAddress) {
            let fullAddress = businessAddress;
            if (businessCity) {
              fullAddress += `, ${businessCity}`;
            }
            if (businessState) {
              fullAddress += `, ${businessState}`;
            }
            if (businessZipCode) {
              fullAddress += ` ${businessZipCode}`;
            }
            addressVariations.push(fullAddress);
          }
          
          // City, State ZIP
          if (businessCity && businessState) {
            addressVariations.push(`${businessCity}, ${businessState} ${businessZipCode || ''}`);
          }
          
          // State ZIP
          if (businessState && businessZipCode) {
            addressVariations.push(`${businessState} ${businessZipCode}`);
          }
          
          // ZIP code only
          if (businessZipCode) {
            addressVariations.push(businessZipCode);
          }
          
          // Skip if no address information is available
          if (addressVariations.length === 0) {
            console.warn(`No business address found for application ${app.id}`);
            return {
              ...app,
              location: null
            };
          }
          
          // Try geocoding with different address variations
          for (const address of addressVariations) {
            try {
              console.log(`Geocoding business address for ${app.id}: ${address}`);
              
              // Call the Nominatim API (OpenStreetMap) with better parameters
              const location = await tryGeocoding(address, app.id);
              
              if (location) {
                console.log(`Successfully geocoded ${app.id} with address: ${address}`);
                
                // Store the location data with the application in Redis
                const applicationJson = await redis.get(`application:${app.id}`);
                if (applicationJson) {
                  const applicationData = JSON.parse(applicationJson);
                  applicationData.location = location;
                  
                  await redis.set(`application:${app.id}`, JSON.stringify(applicationData));
                }
                
                // Add delay to respect Nominatim usage policy
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                return {
                  ...app,
                  location
                };
              }
              
              // Add small delay between attempts
              await new Promise(resolve => setTimeout(resolve, 500));
            } catch (geocodeError) {
              console.warn(`Geocoding attempt failed for ${address}:`, geocodeError);
              continue;
            }
          }
          
          // If all geocoding attempts failed, try to use ZIP code for approximate location
          if (businessZipCode) {
            // Basic ZIP code to approximate coordinates mapping for common areas
            const zipCodeLocations: {[key: string]: {lat: number, lng: number}} = {
              '78660': { lat: 30.4580, lng: -97.6173 }, // Pflugerville, TX
              '84104': { lat: 40.7478, lng: -111.8792 }, // Salt Lake City, UT
              // Add more as needed
            };
            
            if (zipCodeLocations[businessZipCode]) {
              const location = {
                ...zipCodeLocations[businessZipCode],
                accuracy: 3 // Low accuracy for ZIP-based location
              };
              
              console.log(`Using ZIP-based location for ${app.id}: ${businessZipCode}`);
              
              // Store the location data with the application in Redis
              const applicationJson = await redis.get(`application:${app.id}`);
              if (applicationJson) {
                const applicationData = JSON.parse(applicationJson);
                applicationData.location = location;
                
                await redis.set(`application:${app.id}`, JSON.stringify(applicationData));
              }
              
              return {
                ...app,
                location
              };
            }
          }
          
          console.warn(`All geocoding attempts failed for application ${app.id}`);
          return {
            ...app,
            location: null
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
