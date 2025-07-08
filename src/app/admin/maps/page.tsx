'use client';

import { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';
import dynamic from 'next/dynamic';

// Dynamically import LeafletMap to avoid SSR and build issues
const LeafletMap = dynamic(() => import('@/components/LeafletMap'), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-96">
    <div className="text-lg">Loading map...</div>
  </div>
});

interface Application {
  id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  businessInfo: {
    businessName: string;
    businessAddress?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    businessType?: string;
  };
  loanInfo: {
    loanAmount: number;
    loanType?: string;
  };
  status: string;
  createdAt: string;
  location?: {
    lat: number;
    lng: number;
    accuracy?: number;
  };
}

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

export default function ApplicationsMap() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [heatmapVisible, setHeatmapVisible] = useState<boolean>(false);
  const [clusterInsights, setClusterInsights] = useState<{
    name: string;
    applications: number;
    totalValue: number;
    avgValue: number;
    approvalRate: number;
    insights: string;
  } | null>(null);
  const [smtpUser, setSmtpUser] = useState<string | null>(null);
    // Check if current user is super admin
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        // Get the current user data
        const res = await fetch('/api/admin/me');
        if (!res.ok) throw new Error('Failed to fetch admin data');
        
        const data = await res.json();
        
        // Get the SMTP user from env (who is the super admin)
        const smtpUserRes = await fetch('/api/admin/smtp-user');
        if (!smtpUserRes.ok) throw new Error('Failed to fetch SMTP user');
        
        const { smtpUser } = await smtpUserRes.json();
        console.log('Current admin:', data.admin.email, 'SMTP user:', smtpUser);
        
        // Set super admin status
        const isSuperAdminUser = data.admin.email === smtpUser;
        setIsSuperAdmin(isSuperAdminUser);
        console.log('Is super admin:', isSuperAdminUser);
        
        if (!isSuperAdminUser) {
          setError('Only the super admin can access the applications map');
        }
      } catch (err) {
        setError('Failed to check admin permissions');
        console.error(err);
      }
    };
    
    checkAdmin();
  }, []);
  // Fetch applications when component loads
  useEffect(() => {
    console.log('Fetch applications effect running, isSuperAdmin:', isSuperAdmin);
    // Allow fetching even if not yet confirmed as super admin
    // We'll still have access checks in the API
    
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/admin/applications');
        if (!response.ok) {
          throw new Error('Failed to fetch applications');
        }
        
        const data = await response.json();
        setApplications(data.applications);
        
        // Process applications to extract locations
        const locationData = await processApplicationsForMap(data.applications);
        setLocations(locationData);
      } catch (error) {
        console.error('Error fetching applications:', error);
        setError('Failed to load applications data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, [isSuperAdmin]);

  // Process applications to get geolocation data
  const processApplicationsForMap = async (apps: Application[]): Promise<LocationData[]> => {
    const locationsWithData: LocationData[] = [];
    
    // First check which applications already have location data
    const appsNeedingGeocoding = apps.filter(app => !app.location);
    const appsWithLocation = apps.filter(app => app.location);
    
    // Add the ones that already have location data
    appsWithLocation.forEach(app => {
      if (app.location) {
        locationsWithData.push({
          lat: app.location.lat,
          lng: app.location.lng,
          accuracy: app.location.accuracy,
          id: app.id,
          businessName: app.businessInfo.businessName,
          loanAmount: app.loanInfo.loanAmount,
          status: app.status,
          createdAt: app.createdAt
        });
      }
    });
    
    // For the ones that need geocoding, batch them and send to our geocoding API
    if (appsNeedingGeocoding.length > 0) {
      try {
        const response = await fetch('/api/admin/geocode-applications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ applications: appsNeedingGeocoding })
        });
        
        if (!response.ok) {
          throw new Error('Failed to geocode applications');
        }
        
        const data = await response.json();
        
        // Add the newly geocoded locations
        data.geocodedApplications.forEach((geocodedApp: any) => {
          if (geocodedApp.location) {
            const app = apps.find(a => a.id === geocodedApp.id);
            if (app) {
              locationsWithData.push({
                lat: geocodedApp.location.lat,
                lng: geocodedApp.location.lng,
                accuracy: geocodedApp.location.accuracy,
                id: app.id,
                businessName: app.businessInfo.businessName,
                loanAmount: app.loanInfo.loanAmount,
                status: app.status,
                createdAt: app.createdAt
              });
            }
          }
        });
      } catch (error) {
        console.error('Error geocoding applications:', error);
      }
    }
    
    return locationsWithData;
  };

  // Filter locations by application status
  const getFilteredLocations = () => {
    if (filterStatus === 'all') return locations;
    return locations.filter(loc => {
      const app = applications.find(a => a.id === loc.id);
      return app && app.status === filterStatus;
    });
  };
  
  // Get the filtered apps count for each status
  const getStatusCount = (status: string) => {
    return applications.filter(app => app.status === status).length;
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Applications Map</h1>
        
        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white shadow rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold mb-3">Filter Applications</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending ({getStatusCount('pending')})</option>
                    <option value="approved">Approved ({getStatusCount('approved')})</option>
                    <option value="denied">Denied ({getStatusCount('denied')})</option>
                    <option value="under_review">Under Review ({getStatusCount('under_review')})</option>
                  </select>
                </div>
              </div>
              
              <div className="bg-white shadow rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">Map Legend</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <span className="w-4 h-4 bg-blue-500 rounded-full mr-2"></span>
                    <span>Pending</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
                    <span>Approved</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-4 h-4 bg-red-500 rounded-full mr-2"></span>
                    <span>Denied</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></span>
                    <span>Under Review</span>
                  </li>
                  <li className="flex items-center mt-4">
                    <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold mr-2">
                      #
                    </span>
                    <span>Cluster (contains multiple applications)</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="lg:col-span-3">
              <div className="bg-white shadow rounded-lg p-4" style={{ height: '600px' }}>
                {locations.length > 0 ? (
                  <LeafletMap locations={getFilteredLocations()} />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500">No application location data available</p>
                  </div>
                )}
              </div>
              
              {clusterInsights && (
                <div className="bg-white shadow rounded-lg p-4 mt-6">
                  <h3 className="text-lg font-semibold mb-3">Cluster Insights: {clusterInsights.name}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Applications</p>
                      <p className="text-xl font-semibold">{clusterInsights.applications}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Value</p>
                      <p className="text-xl font-semibold">${clusterInsights.totalValue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Avg. Loan</p>
                      <p className="text-xl font-semibold">${clusterInsights.avgValue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Approval Rate</p>
                      <p className="text-xl font-semibold">{clusterInsights.approvalRate}%</p>
                    </div>
                  </div>
                  <p className="text-gray-700">{clusterInsights.insights}</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {!loading && !error && (
          <div className="mt-8 bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Map Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Geographic Distribution</h3>
                <ul className="text-sm text-gray-600">
                  <li>Total applications mapped: {locations.length}</li>
                  <li>Applications pending geocoding: {applications.length - locations.length}</li>
                  <li>States represented: {Array.from(new Set(applications.map(app => app.businessInfo.state).filter(Boolean))).length}</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Application Status</h3>
                <ul className="text-sm text-gray-600">
                  <li>Pending: {getStatusCount('pending')}</li>
                  <li>Approved: {getStatusCount('approved')}</li>
                  <li>Denied: {getStatusCount('denied')}</li>
                  <li>Under Review: {getStatusCount('under_review')}</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Financial Overview</h3>
                <ul className="text-sm text-gray-600">
                  <li>
                    Total Requested: ${applications.reduce((sum, app) => {
                      const amount = app.loanInfo?.loanAmount || 0;
                      return sum + (typeof amount === 'number' ? amount : parseInt(amount) || 0);
                    }, 0).toLocaleString()}
                  </li>
                  <li>
                    Total Approved: ${applications.filter(app => app.status === 'approved').reduce((sum, app) => {
                      const amount = app.loanInfo?.loanAmount || 0;
                      return sum + (typeof amount === 'number' ? amount : parseInt(amount) || 0);
                    }, 0).toLocaleString()}
                  </li>
                  <li>
                    Average Loan: ${applications.length > 0 ? Math.round(
                      applications.reduce((sum, app) => {
                        const amount = app.loanInfo?.loanAmount || 0;
                        return sum + (typeof amount === 'number' ? amount : parseInt(amount) || 0);
                      }, 0) / applications.length
                    ).toLocaleString() : '0'}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
