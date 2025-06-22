'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Define the props for the map component
interface MapProps {
  locations: Array<{
    id: string;
    lat: number;
    lng: number;
    businessName?: string;
    loanAmount?: number;
    status?: string;
    createdAt?: string;
  }>;
}

// Use dynamic imports to avoid SSR issues with Leaflet
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
const MarkerClusterGroup = dynamic(
  () => import('@changey/react-leaflet-markercluster').then(mod => mod.default || mod),
  { ssr: false }
);

// Main Map component
const LeafletMap = ({ locations }: MapProps) => {
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    // Load CSS files and initialize map only on client-side
    const loadLeaflet = async () => {
      // Load CSS
      const leafletCSS = document.createElement('link');
      leafletCSS.rel = 'stylesheet';
      leafletCSS.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
      document.head.appendChild(leafletCSS);
      
      // Load cluster CSS
      const clusterCSS = document.createElement('link');
      clusterCSS.rel = 'stylesheet';
      clusterCSS.href = 'https://unpkg.com/react-leaflet-markercluster/dist/styles.min.css';
      document.head.appendChild(clusterCSS);
      
      setMapReady(true);
    };
    
    loadLeaflet();
  }, []);

  // Calculate center position (average of all locations)
  const center = locations.length > 0
    ? {
        lat: locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length,
        lng: locations.reduce((sum, loc) => sum + loc.lng, 0) / locations.length
      }
    : { lat: 39.8283, lng: -98.5795 }; // Center of US as default

  // Handle empty locations
  if (locations.length === 0) {
    return (
      <div className="h-full w-full bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">No location data available</p>
      </div>
    );
  }

  // If not ready yet, show loading
  if (!mapReady) {
    return (
      <div className="h-full w-full bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={4}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {/* Use MarkerClusterGroup for better visualization with many markers */}
      {mapReady && (
        <MarkerClusterGroup>
          {locations.map(loc => (
            <Marker key={loc.id} position={[loc.lat, loc.lng]}>
              <Popup>
                <div className="text-sm">
                  <p className="font-bold">{loc.businessName || 'Business'}</p>
                  <p>ID: {loc.id}</p>
                  {loc.loanAmount && <p>Amount: ${loc.loanAmount.toLocaleString()}</p>}
                  {loc.status && <p>Status: {loc.status}</p>}
                  {loc.createdAt && (
                    <p>Date: {new Date(loc.createdAt).toLocaleDateString()}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      )}
    </MapContainer>
  );
};

export default LeafletMap;
