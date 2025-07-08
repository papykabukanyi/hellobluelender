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

// Dynamically import Leaflet components with no SSR to prevent hydration issues
const LeafletMapInner = dynamic(() => import('./LeafletMapInner'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-100 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  )
});
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
  return <LeafletMapInner locations={locations} />;
};

export default LeafletMap;
