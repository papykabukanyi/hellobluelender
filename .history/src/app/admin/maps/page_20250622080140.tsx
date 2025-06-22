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

// Dynamic import for the marker cluster group
const MarkerClusterGroup = dynamic(
  () => import('react-leaflet-markercluster'),
  { ssr: false }
);

// Import Leaflet CSS
const MapWithNoSSR = (props: any) => {
  useEffect(() => {
    // Import Leaflet CSS
    import('leaflet/dist/leaflet.css');
    // Fix icon issue
    import('leaflet').then(L => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      });
    });
  }, []);

  if (!props.locations || props.locations.length === 0) {
    return <div className="h-96 w-full bg-gray-100 flex items-center justify-center">No location data available</div>;
  }

  const center = {
    lat: props.locations[0].lat,
    lng: props.locations[0].lng
  };

  return (
    <MapContainer 
      center={[center.lat, center.lng]} 
      zoom={4} 
      scrollWheelZoom={true} 
      style={{ height: '500px', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {props.locations.map((location: LocationData) => (
        <Marker key={location.id} position={[location.lat, location.lng]}>
          <Popup>
            <div>
              <h3 className="font-bold">{location.businessName}</h3>
              <p>Application ID: {location.id}</p>
              <p>Loan Amount: ${location.loanAmount.toLocaleString()}</p>
              <p>Status: {location.status}</p>
              <p>Created: {new Date(location.createdAt).toLocaleDateString()}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default function ApplicationsMap() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [locations, setLocations] = useState<LocationData[]>([]);  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [heatmapVisible, setHeatmapVisible] = useState<boolean>(false);
  const [clusterInsights, setClusterInsights] = useState<{
    name: string;
    applications: number;
    totalValue: number;
    avgValue: number;
    approvalRate: number;
    insights: string;
  } | null>(null);
  const [smtpUser, setSmtpUser] = useState<string | null>(null);
  
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
  // Initialize map and analyze application data once locations are loaded
  useEffect(() => {
    if (!isSuperAdmin || locations.length === 0) return;
    
    // Use Gemini API to analyze the data
    analyzeApplicationData(locations);
    
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
    // Toggle heatmap visibility (simplified for Leaflet implementation)
  const toggleHeatmap = () => {
    const newVisibility = !heatmapVisible;
    setHeatmapVisible(newVisibility);
    // In a full implementation, we would toggle the visibility of the heatmap layer in Leaflet
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
    // Handle clusters identified by the AI analysis
  const drawClusters = (clusters: any[]) => {
    // With Leaflet implementation, we don't directly draw the clusters on the map
    // Instead, we'll store the cluster data and display insights when a cluster is selected
    
    // Store cluster insights for display in the sidebar
    if (clusters.length > 0) {
      const firstCluster = clusters[0];
      if (firstCluster && firstCluster.points && firstCluster.points.length >= 2) {
        setSelectedCluster(`Cluster 1`);
        setClusterInsights({
          name: `Cluster 1`,
          applications: firstCluster.points.length,
          totalValue: firstCluster.totalLoanValue,
          avgValue: firstCluster.averageLoanValue,
          approvalRate: firstCluster.approvalRate,
          insights: firstCluster.insights || 'No specific insights available for this cluster.'
        });
      }
    }
  };

  // Return UI
  if (error && !isSuperAdmin) {
    return (
      <AdminLayout>
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Applications Map</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
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
    </AdminLayout>
  );
}
