'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

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

interface LeafletMapProps {
  locations: LocationData[];
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

// Fallback to simple markers instead of clusters due to type issues
// const MarkerClusterGroup = dynamic(
//   () => import('react-leaflet-cluster'),
//   { ssr: false }
// );

function getStatusColor(status: string): string {
  switch (status) {
    case 'approved': return '#00C853'; // Green
    case 'denied': return '#D50000'; // Red
    case 'in-review': return '#2962FF'; // Blue
    case 'submitted': return '#FF6D00'; // Orange
    default: return '#9E9E9E'; // Grey
  }
}

const LeafletMap = ({ locations }: LeafletMapProps) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Fix for hydration issues
    setIsClient(true);
    
    // Fix Leaflet icon issues in client-side
    if (typeof window !== 'undefined') {
      const L = require('leaflet');
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'
      });
    }
  }, []);

  if (!isClient) {
    return <div className="w-full h-96 bg-gray-100 flex items-center justify-center">Loading map...</div>;
  }

  if (!locations || locations.length === 0) {
    return <div className="w-full h-96 bg-gray-100 flex items-center justify-center">No location data available</div>;
  }

  // Calculate the center of the map
  const centerLat = locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length;
  const centerLng = locations.reduce((sum, loc) => sum + loc.lng, 0) / locations.length;

  return (
    <div className="rounded-lg shadow-md" style={{ height: '500px', width: '100%' }}>
      {isClient && (
        <MapContainer 
          center={[centerLat, centerLng]} 
          zoom={5} 
          scrollWheelZoom={true} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {locations.map((location) => (
            <Marker 
              key={location.id} 
              position={[location.lat, location.lng]}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-lg">{location.businessName}</h3>
                  <p className="text-sm"><strong>Application ID:</strong> {location.id}</p>
                  <p className="text-sm"><strong>Loan Amount:</strong> ${location.loanAmount.toLocaleString()}</p>
                  <p className="text-sm"><strong>Status:</strong> 
                    <span style={{ color: getStatusColor(location.status) }}> {location.status}</span>
                  </p>
                  <p className="text-sm"><strong>Date:</strong> {new Date(location.createdAt).toLocaleDateString()}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
};

export default LeafletMap;
