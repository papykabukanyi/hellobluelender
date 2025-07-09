'use client';

import { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer as LeafletMapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

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

// Fix for default markers in Leaflet
const DefaultIcon = L.icon({
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

export function MapContainerSimple({ locations }: MapProps) {
  useEffect(() => {
    // Additional Leaflet setup if needed
  }, []);

  // Default center (US center)
  const defaultCenter: [number, number] = [39.8283, -98.5795];
  
  // Calculate center from locations if available
  const center: [number, number] = locations.length > 0 
    ? [
        locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length,
        locations.reduce((sum, loc) => sum + loc.lng, 0) / locations.length
      ]
    : defaultCenter;

  return (
    <div className="h-full w-full">
      <LeafletMapContainer
        {...({
          center,
          zoom: locations.length > 0 ? 6 : 4,
          style: { height: '100%', width: '100%' },
          className: "rounded-lg"
        } as any)}
      >
        <TileLayer
          {...({
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          } as any)}
        />
        
        {/* Regular markers without clustering */}
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={[location.lat, location.lng]}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-gray-800">
                  {location.businessName || 'Business Application'}
                </h3>
                <p className="text-sm text-gray-600">
                  Loan Amount: ${location.loanAmount?.toLocaleString() || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                  Status: {location.status || 'Pending'}
                </p>
                {location.createdAt && (
                  <p className="text-xs text-gray-500">
                    Applied: {new Date(location.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </LeafletMapContainer>
    </div>
  );
}

export { MapContainerSimple as MapContainer };
