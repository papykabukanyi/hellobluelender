'use client';

import { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';
import dynamic from 'next/dynamic';

interface Application {
  id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  businessInfo: {
    businessName: string;
    businessAddress?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    businessType?: string;
  };
  loanInfo: {
    loanAmount: number;
    loanType?: string;
  };
  status: string;
  createdAt: string;
  location?: {
    lat: number;
    lng: number;
    accuracy?: number;
  };
}

interface LocationData {
  lat: number;
  lng: number;
  accuracy?: number;
  id: string;
  businessName: string;
  loanAmount: number;
  status: string;
  createdAt: string;
}

// Using dynamic import for Leaflet components to prevent SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then(mod => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then(mod => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then(mod => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then(mod => mod.Popup),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import('react-leaflet').then(mod => mod.CircleMarker),
  { ssr: false }
);

export default function ApplicationsMap() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [heatmapVisible, setHeatmapVisible] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [clusterInsights, setClusterInsights] = useState<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const markersRef = useRef<any[]>([]);
  
  // Check if current user is super admin
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        // Get the SMTP user from env (who is the super admin)
        const res = await fetch('/api/admin/me');
        if (!res.ok) throw new Error('Failed to fetch admin data');
        
        const data = await res.json();
        const smtpUserRes = await fetch('/api/admin/smtp-user');
        
        if (!smtpUserRes.ok) throw new Error('Failed to fetch SMTP user');
        const { smtpUser } = await smtpUserRes.json();
        
        setIsSuperAdmin(data.admin.email === smtpUser);
        
        if (data.admin.email !== smtpUser) {
          setError('Only the super admin can access the applications map');
        }
      } catch (err) {
        setError('Failed to check admin permissions');
        console.error(err);
      }
    };
    
    checkAdmin();
  }, []);

  // Fetch applications when component loads
  useEffect(() => {
    if (!isSuperAdmin) return;
    
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/admin/applications');
        if (!response.ok) {
          throw new Error('Failed to fetch applications');
        }
        
        const data = await response.json();
        setApplications(data.applications);
        
        // Process applications to extract locations
        const locationData = await processApplicationsForMap(data.applications);
        setLocations(locationData);
      } catch (error) {
        console.error('Error fetching applications:', error);
        setError('Failed to load applications data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, [isSuperAdmin]);

  // Process applications to get geolocation data
  const processApplicationsForMap = async (apps: Application[]): Promise<LocationData[]> => {
    const locationsWithData: LocationData[] = [];
    
    // First check which applications already have location data
    const appsNeedingGeocoding = apps.filter(app => !app.location);
    const appsWithLocation = apps.filter(app => app.location);
    
    // Add the ones that already have location data
    appsWithLocation.forEach(app => {
      if (app.location) {
        locationsWithData.push({
          lat: app.location.lat,
          lng: app.location.lng,
          accuracy: app.location.accuracy,
          id: app.id,
          businessName: app.businessInfo.businessName,
          loanAmount: app.loanInfo.loanAmount,
          status: app.status,
          createdAt: app.createdAt
        });
      }
    });
    
    // For the ones that need geocoding, batch them and send to our geocoding API
    if (appsNeedingGeocoding.length > 0) {
      try {
        const response = await fetch('/api/admin/geocode-applications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ applications: appsNeedingGeocoding })
        });
        
        if (!response.ok) {
          throw new Error('Failed to geocode applications');
        }
        
        const data = await response.json();
        
        // Add the newly geocoded locations
        data.geocodedApplications.forEach((geocodedApp: any) => {
          if (geocodedApp.location) {
            const app = apps.find(a => a.id === geocodedApp.id);
            if (app) {
              locationsWithData.push({
                lat: geocodedApp.location.lat,
                lng: geocodedApp.location.lng,
                accuracy: geocodedApp.location.accuracy,
                id: app.id,
                businessName: app.businessInfo.businessName,
                loanAmount: app.loanInfo.loanAmount,
                status: app.status,
                createdAt: app.createdAt
              });
            }
          }
        });
      } catch (error) {
        console.error('Error geocoding applications:', error);
      }
    }
    
    return locationsWithData;
  };

  // Initialize and load the map
  useEffect(() => {
    if (!isSuperAdmin || locations.length === 0 || !GOOGLE_MAPS_API_KEY) return;
    
    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey: GOOGLE_MAPS_API_KEY,
          version: 'weekly',
          libraries: ['visualization', 'places']
        });
        
        const google = await loader.load();
        
        // Calculate map center based on all locations
        const bounds = new google.maps.LatLngBounds();
        locations.forEach(loc => {
          bounds.extend(new google.maps.LatLng(loc.lat, loc.lng));
        });
        
        // Create the map
        const mapInstance = new google.maps.Map(document.getElementById('map')!, {
          center: bounds.getCenter(),
          zoom: 4,
          mapTypeId: 'roadmap',
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
        });
        
        mapRef.current = mapInstance;
        
        // Add markers for all locations
        const markers = locations.map(location => {
          const marker = new google.maps.Marker({
            position: { lat: location.lat, lng: location.lng },
            map: mapInstance,
            title: location.businessName,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: getStatusColor(location.status),
              fillOpacity: 0.8,
              strokeWeight: 1,
              strokeColor: '#ffffff',
            }
          });
          
          // Create info window for marker
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div class="p-3">
                <h3 class="font-bold">${location.businessName}</h3>
                <p><strong>Application ID:</strong> ${location.id}</p>
                <p><strong>Loan Amount:</strong> $${location.loanAmount.toLocaleString()}</p>
                <p><strong>Status:</strong> ${location.status}</p>
                <p><strong>Date:</strong> ${new Date(location.createdAt).toLocaleDateString()}</p>
              </div>
            `
          });
          
          // Add click event to marker
          marker.addListener('click', () => {
            infoWindow.open(mapInstance, marker);
          });
          
          return marker;
        });
        
        markersRef.current = markers;
        
        // Create heatmap layer
        const heatmapData = locations.map(location => {
          return {
            location: new google.maps.LatLng(location.lat, location.lng),
            weight: Math.log10(location.loanAmount) // Use logarithmic scale for weights
          };
        });
        
        const heatmap = new google.maps.visualization.HeatmapLayer({
          data: heatmapData,
          map: null, // Initially hidden
          radius: 30,
          opacity: 0.8
        });
        
        heatmapRef.current = heatmap;
        
        // Set map bounds to fit all markers
        mapInstance.fitBounds(bounds);
        
        // Use Gemini API to analyze the data once map is loaded
        analyzeApplicationData(locations);
        
      } catch (error) {
        console.error('Error initializing map:', error);
        setError('Failed to initialize map');
      }
    };
    
    initMap();
  }, [isSuperAdmin, locations]);
  
  // Function to get color based on application status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#00C853'; // Green
      case 'denied': return '#D50000'; // Red
      case 'in-review': return '#2962FF'; // Blue
      case 'submitted': return '#FF6D00'; // Orange
      default: return '#9E9E9E'; // Grey
    }
  };
  
  // Toggle heatmap visibility
  const toggleHeatmap = () => {
    if (!heatmapRef.current) return;
    
    const newVisibility = !heatmapVisible;
    heatmapRef.current.setMap(newVisibility ? mapRef.current : null);
    setHeatmapVisible(newVisibility);
  };
  
  // Analyze application data using Gemini API
  const analyzeApplicationData = async (locationData: LocationData[]) => {
    if (locationData.length === 0) return;
    
    try {
      const response = await fetch('/api/admin/analyze-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ locations: locationData }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze application data');
      }
      
      const data = await response.json();
      
      // If clusters were identified, draw them on the map
      if (data.clusters && data.clusters.length > 0) {
        drawClusters(data.clusters);
      }
      
    } catch (error) {
      console.error('Error analyzing application data:', error);
    }
  };
  
  // Draw clusters on the map
  const drawClusters = (clusters: any[]) => {
    if (!mapRef.current) return;
    
    clusters.forEach((cluster, index) => {
      if (!cluster.center || !cluster.points || cluster.points.length < 2) return;
      
      // Create a circle for each cluster
      const circle = new google.maps.Circle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.15,
        map: mapRef.current,
        center: { lat: cluster.center.lat, lng: cluster.center.lng },
        radius: cluster.radius * 1000, // Convert km to meters
        clickable: true
      });
      
      // Add click event to show cluster insights
      circle.addListener('click', () => {
        setSelectedCluster(`Cluster ${index + 1}`);
        setClusterInsights({
          name: `Cluster ${index + 1}`,
          applications: cluster.points.length,
          totalValue: cluster.totalLoanValue,
          avgValue: cluster.averageLoanValue,
          approvalRate: cluster.approvalRate,
          insights: cluster.insights || 'No specific insights available for this cluster.'
        });
      });
    });
  };

  // Return UI
  if (error && !isSuperAdmin) {
    return (
      <DashboardLayout>
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Applications Map</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Applications Map</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-4">
            {/* Map container */}
            <div className="w-full md:w-3/4">
              <div className="bg-gray-100 rounded-lg mb-4">
                <div className="p-2 flex justify-between items-center border-b border-gray-200">
                  <div>
                    <button 
                      onClick={toggleHeatmap}
                      className={`px-3 py-1 rounded text-sm ${heatmapVisible ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                      {heatmapVisible ? 'Hide Heatmap' : 'Show Heatmap'}
                    </button>
                  </div>
                  <div className="text-sm text-gray-600">
                    {locations.length} Applications Mapped
                  </div>
                </div>
                <div id="map" className="h-96 w-full rounded-b-lg"></div>
              </div>
              
              <div className="bg-gray-100 p-3 rounded-lg mb-4">
                <h3 className="font-semibold text-lg mb-2">Map Legend</h3>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-green-600 mr-2"></div>
                    <span className="text-sm">Approved</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-red-600 mr-2"></div>
                    <span className="text-sm">Denied</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-blue-600 mr-2"></div>
                    <span className="text-sm">In Review</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-orange-500 mr-2"></div>
                    <span className="text-sm">Submitted</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-red-500 rounded mr-2"></div>
                    <span className="text-sm">Application Cluster</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Insights panel */}
            <div className="w-full md:w-1/4 bg-gray-100 p-4 rounded-lg">
              <h2 className="font-bold text-lg mb-3">Geographic Insights</h2>
              
              {selectedCluster ? (
                <div>
                  <h3 className="font-semibold text-md mb-2">{clusterInsights?.name}</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Applications:</span> {clusterInsights?.applications}</p>
                    <p><span className="font-medium">Total Value:</span> ${clusterInsights?.totalValue.toLocaleString()}</p>
                    <p><span className="font-medium">Average Value:</span> ${clusterInsights?.avgValue.toLocaleString()}</p>
                    <p><span className="font-medium">Approval Rate:</span> {clusterInsights?.approvalRate}%</p>
                    <div className="mt-3">
                      <h4 className="font-medium">AI Insights:</h4>
                      <p className="text-sm mt-1">{clusterInsights?.insights}</p>
                    </div>
                    <button
                      onClick={() => setSelectedCluster(null)}
                      className="mt-3 px-3 py-1 bg-gray-300 hover:bg-gray-400 rounded text-sm"
                    >
                      Clear Selection
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-gray-600 text-sm">
                  <p>Click on a cluster to view insights about application patterns in that region.</p>
                  <p className="mt-4">The map uses AI analysis to identify geographic clusters of applications and provide business intelligence about each area.</p>
                  <p className="mt-4">Toggle the heatmap to visualize the density of loan amounts across regions.</p>
                </div>
              )}
              
              <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded">
                <h3 className="font-semibold text-md mb-2">Summary Statistics</h3>
                <ul className="space-y-1 text-sm">
                  <li>Total Applications: {applications.length}</li>
                  <li>Mapped Applications: {locations.length}</li>
                  <li>
                    Total Loan Value: ${applications.reduce((sum, app) => sum + (app.loanInfo.loanAmount || 0), 0).toLocaleString()}
                  </li>
                  <li>
                    Average Loan: ${Math.round(applications.reduce((sum, app) => sum + (app.loanInfo.loanAmount || 0), 0) / (applications.length || 1)).toLocaleString()}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
