'use client';

import { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer as LeafletMapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

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
    delete (L.Icon.Default.prototype as any)._getIconUrl;
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

export function MapDisplay({ locations }: MapProps) {
  useEffect(() => {
    fixLeafletIcons();
    console.log('MapContainer mounted with', locations.length, 'locations');
  }, [locations.length]);

  // Default center (US center)
  const defaultCenter: [number, number] = [39.8283, -98.5795];
  
  // Calculate center from locations if available
  const center: [number, number] = locations.length > 0 
    ? [
        locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length,
        locations.reduce((sum, loc) => sum + loc.lng, 0) / locations.length
      ]
    : defaultCenter;

  // Determine zoom level based on number of locations
  const getZoomLevel = () => {
    if (locations.length === 0) return 4;
    if (locations.length === 1) return 10;
    
    // Calculate the span of locations to determine appropriate zoom
    const lats = locations.map(loc => loc.lat);
    const lngs = locations.map(loc => loc.lng);
    const latSpan = Math.max(...lats) - Math.min(...lats);
    const lngSpan = Math.max(...lngs) - Math.min(...lngs);
    const maxSpan = Math.max(latSpan, lngSpan);
    
    if (maxSpan > 50) return 3;
    if (maxSpan > 20) return 4;
    if (maxSpan > 10) return 5;
    if (maxSpan > 5) return 6;
    if (maxSpan > 2) return 7;
    return 8;
  };

  return (
    <div className="map-container h-full w-full" style={{ minHeight: '500px', maxHeight: '600px' }}>
      <LeafletMapContainer
        center={center}
        zoom={getZoomLevel()}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Render markers for each location */}
        {locations.map(loc => {
          const position: [number, number] = [loc.lat, loc.lng];
          return (
            <Marker key={loc.id} position={position}>
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
      </LeafletMapContainer>
    </div>
  );
}

// Backward compatibility export
export { MapDisplay as MapContainer };
