'use client';

import { useState, useEffect } from 'react';

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

/**
 * Simple Map component using OpenStreetMap iframe
 * This is a fallback solution that doesn't require Leaflet to work
 */
const LeafletMap = ({ locations }: LeafletMapProps) => {
  if (!locations || locations.length === 0) {
    return <div className="w-full h-96 bg-gray-100 flex items-center justify-center">No location data available</div>;
  }

  // Calculate the center of the map
  const centerLat = locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length;
  const centerLng = locations.reduce((sum, loc) => sum + loc.lng, 0) / locations.length;
  
  // Create marker parameters for OpenStreetMap
  const markerParams = locations.map(loc => 
    `marker=${loc.lat},${loc.lng}`
  ).join('&');
  
  // Create OpenStreetMap URL with center and markers
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${centerLng-10}%2C${centerLat-10}%2C${centerLng+10}%2C${centerLat+10}&layer=mapnik&${markerParams}`;

  return (
    <div className="rounded-lg shadow-md" style={{ height: '500px', width: '100%' }}>
      <iframe 
        width="100%" 
        height="100%" 
        frameBorder="0" 
        scrolling="no" 
        marginHeight={0} 
        marginWidth={0} 
        src={mapUrl}
        style={{ borderRadius: '0.5rem' }}
        title="OpenStreetMap"
      />
      
      {/* Display location details below the map */}
      <div className="mt-4 bg-white rounded-lg shadow p-4">
        <h3 className="font-bold text-lg mb-2">Application Locations ({locations.length})</h3>
        <div className="max-h-64 overflow-y-auto">
          {locations.map(location => (
            <div key={location.id} className="mb-3 border-b pb-2">
              <p className="font-semibold">{location.businessName}</p>
              <p className="text-sm">Application ID: {location.id}</p>
              <p className="text-sm">Loan Amount: ${location.loanAmount.toLocaleString()}</p>
              <p className="text-sm">Status: {location.status}</p>
              <p className="text-sm">Date: {new Date(location.createdAt).toLocaleDateString()}</p>
              <p className="text-sm text-gray-500">Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeafletMap;

export default LeafletMap;
