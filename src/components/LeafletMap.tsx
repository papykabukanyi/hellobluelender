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

// Create a client-side-only version of the map component
const ClientSideMap = dynamic(
  () => {
    // Use simple map without clustering for Docker builds or when clustering fails
    if (process.env.NODE_ENV === 'production' && process.env.DOCKER_BUILD) {
      return import('./MapContainerSimple').then(mod => mod.MapContainer);
    }
    // Try full-featured map first, fallback to simple if it fails
    return import('./MapContainer').then(mod => mod.MapContainer).catch(() => 
      import('./MapContainerSimple').then(mod => mod.MapContainer)
    );
  },
  { 
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }
);

// Main LeafletMap component
const LeafletMap = ({ locations }: MapProps) => {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle empty locations
  if (locations.length === 0) {
    return (
      <div className="h-full w-full bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">No location data available</p>
      </div>
    );
  }

  // Only render the map on the client side
  if (!isClient) {
    return (
      <div className="h-full w-full bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <ClientSideMap locations={locations} />;
};

export default LeafletMap;
