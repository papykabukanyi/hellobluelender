'use client';

import { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer as LeafletMapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import '../styles/cluster-stub.css'; // Using local stub CSS instead of react-leaflet-cluster CSS

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

// Fix the icon issues in Leaflet when used with webpack
const fixLeafletIcons = () => {
  // Ensure L is defined (it should be since this is client-side only)
  if (typeof L !== 'undefined') {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', 
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
    console.log('Leaflet icons fixed');
  } else {
    console.error('Leaflet is not defined');
  }
};

export function MapContainer({ locations }: MapProps) {
  useEffect(() => {
    fixLeafletIcons();
    console.log('MapContainer mounted with', locations.length, 'locations');
  }, [locations.length]);

  // Calculate center position (average of all locations)
  const center = locations.length > 0
    ? {
        lat: locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length,
        lng: locations.reduce((sum, loc) => sum + loc.lng, 0) / locations.length
      }
    : { lat: 39.8283, lng: -98.5795 }; // Center of US as default

  // Cast to proper tuple type
  const position: [number, number] = [center.lat, center.lng];

  return (
    <div className="h-full w-full" style={{ minHeight: '500px' }}>
      <LeafletMapContainer 
        center={position} 
        zoom={4} 
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <MarkerClusterGroup chunkedLoading>
          {locations.map(loc => {
            const markerPosition: [number, number] = [loc.lat, loc.lng];
            return (
              <Marker 
                key={loc.id} 
                position={markerPosition}
              >
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
            );
          })}
        </MarkerClusterGroup>
      </LeafletMapContainer>
    </div>
  );
}
