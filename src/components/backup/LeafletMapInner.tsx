'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

// Inner map component that handles all Leaflet-specific logic
const LeafletMapInner = ({ locations }: MapProps) => {
  // Fix Leaflet icon issue on client side
  useEffect(() => {
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

export default LeafletMapInner;
