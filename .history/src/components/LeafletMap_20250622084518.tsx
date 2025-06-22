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

// Create a component that will only render on the client side
const Map = ({ locations }: MapProps) => {
  // Dynamic imports for Leaflet components
  const { MapContainer, TileLayer, Marker, Popup } = require('react-leaflet');
  const MarkerClusterGroup = require('react-leaflet-cluster').default;
  require('leaflet/dist/leaflet.css');
  
  // Fix Leaflet icon issue
  useEffect(() => {
    const L = require('leaflet');
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  // Calculate center position (average of all locations)
  const center = locations.length > 0
    ? {
        lat: locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length,
        lng: locations.reduce((sum, loc) => sum + loc.lng, 0) / locations.length
      }
    : { lat: 39.8283, lng: -98.5795 }; // Center of US as default

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={4}
      style={{ height: '100%', width: '100%', minHeight: '400px' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
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
    </MapContainer>
  );
};

// Main Map component with client-side only rendering
const LeafletMap = ({ locations }: MapProps) => {
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    setMapReady(true);
  }, []);

  // Handle empty locations
  if (locations.length === 0) {
    return (
      <div className="h-full w-full bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">No location data available</p>
      </div>
    );
  }

  // Show loading until client-side rendering is ready
  if (!mapReady) {
    return (
      <div className="h-full w-full bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Only render the map on the client side
  return <Map locations={locations} />;
};

export default LeafletMap;

export default LeafletMap;
