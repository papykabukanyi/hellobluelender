'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

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

const CircleMarker = dynamic(
  () => import('react-leaflet').then(mod => mod.CircleMarker),
  { ssr: false }
);

const MarkerClusterGroup = dynamic(
  () => import('react-leaflet-cluster').then(mod => mod.MarkerClusterGroup),
  { ssr: false }
);

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

    // Import Leaflet CSS
    import('leaflet/dist/leaflet.css');
    
    // Fix Leaflet icon issues
    const L = require('leaflet');
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'
    });
  }, []);

  if (!isClient) {
    return <div className="w-full h-96 bg-gray-100 flex items-center justify-center">Loading map...</div>;
  }

  if (!locations || locations.length === 0) {
    return <div className="w-full h-96 bg-gray-100 flex items-center justify-center">No location data available</div>;
  }

  // Calculate the center of the map
  const center = {
    lat: locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length,
    lng: locations.reduce((sum, loc) => sum + loc.lng, 0) / locations.length
  };

  return (
    <MapContainer 
      center={[center.lat, center.lng]} 
      zoom={5} 
      scrollWheelZoom={true} 
      style={{ height: '500px', width: '100%' }}
      className="rounded-lg shadow-md"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MarkerClusterGroup>
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
      </MarkerClusterGroup>
    </MapContainer>
  );
};

export default LeafletMap;
