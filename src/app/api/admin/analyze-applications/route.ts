import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/permissions';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI SDK with API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// API route to analyze application data using Gemini AI
export async function POST(request: NextRequest) {
  try {
    // Check if user is a super admin
    const currentAdmin = await requirePermission(request, 'viewApplications');
    
    // If requirePermission returns a NextResponse, it means unauthorized
    if ('status' in currentAdmin && currentAdmin.status === 403) {
      return currentAdmin;
    }
    
    // Check if user is a super admin (SMTP User from env)
    const smtpUser = process.env.SMTP_USER || '';
    if (currentAdmin.email !== smtpUser) {
      return NextResponse.json(
        { success: false, error: 'Only the super admin can access this endpoint' },
        { status: 403 }
      );
    }
    
    const { locations } = await request.json();
    
    if (!locations || !Array.isArray(locations) || locations.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Valid locations array is required' },
        { status: 400 }
      );
    }
    
    // Use DBSCAN algorithm to identify clusters
    const clusters = identifyClusters(locations);
      // Use Gemini to analyze the clusters
    const insights = await analyzeLocationsWithGemini(locations);
    
    return NextResponse.json({ 
      success: true, 
      insights
    });
  } catch (error) {
    console.error('Error analyzing application data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to analyze application data' },
      { status: 500 }
    );
  }
}

// Implementation of a simplified DBSCAN clustering algorithm
function identifyClusters(locations) {
  // Define parameters
  const epsilon = 100; // Distance in km
  const minPoints = 3; // Minimum points to form a cluster
  
  const clusters = [];
  const visited = new Set();
  
  // Helper function to calculate distance between two points
  const calculateDistance = (point1, point2) => {
    const R = 6371; // Earth radius in km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };
  
  // Find neighbors within epsilon distance
  const findNeighbors = (point, allPoints) => {
    return allPoints.filter(p => {
      const distance = calculateDistance(point, p);
      return distance <= epsilon;
    });
  };
  
  // Expand cluster
  const expandCluster = (point, neighbors, allPoints) => {
    const cluster = {
      points: [point],
      center: {
        lat: point.lat,
        lng: point.lng
      },
      radius: 0,
      totalLoanValue: point.loanAmount,
      approvedCount: point.status === 'approved' ? 1 : 0
    };
    
    // Add all neighbors to cluster
    neighbors.forEach(neighbor => {
      if (!visited.has(neighbor.id)) {
        visited.add(neighbor.id);
        cluster.points.push(neighbor);
        cluster.totalLoanValue += neighbor.loanAmount;
        
        if (neighbor.status === 'approved') {
          cluster.approvedCount += 1;
        }
        
        // Find recursive neighbors
        const recursiveNeighbors = findNeighbors(neighbor, allPoints);
        if (recursiveNeighbors.length >= minPoints) {
          recursiveNeighbors.forEach(rNeighbor => {
            if (!visited.has(rNeighbor.id) && !cluster.points.find(p => p.id === rNeighbor.id)) {
              cluster.points.push(rNeighbor);
              cluster.totalLoanValue += rNeighbor.loanAmount;
              
              if (rNeighbor.status === 'approved') {
                cluster.approvedCount += 1;
              }
              
              visited.add(rNeighbor.id);
            }
          });
        }
      }
    });
    
    // Calculate cluster properties
    if (cluster.points.length > 0) {
      // Calculate center (centroid)
      const sumLat = cluster.points.reduce((sum, p) => sum + p.lat, 0);
      const sumLng = cluster.points.reduce((sum, p) => sum + p.lng, 0);
      
      cluster.center = {
        lat: sumLat / cluster.points.length,
        lng: sumLng / cluster.points.length
      };
      
      // Calculate radius (maximum distance from center to any point)
      cluster.radius = Math.max(...cluster.points.map(p => 
        calculateDistance(cluster.center, p)
      ));
      
      // Calculate average loan value
      cluster.averageLoanValue = cluster.totalLoanValue / cluster.points.length;
      
      // Calculate approval rate
      cluster.approvalRate = Math.round((cluster.approvedCount / cluster.points.length) * 100);
    }
    
    return cluster;
  };
  
  // Main DBSCAN algorithm
  for (const point of locations) {
    if (visited.has(point.id)) continue;
    
    visited.add(point.id);
    const neighbors = findNeighbors(point, locations);
    
    if (neighbors.length >= minPoints) {
      const cluster = expandCluster(point, neighbors, locations);
      clusters.push(cluster);
    }
  }
  
  return clusters;
}

// Use Gemini to analyze the clusters
async function analyzeClusterWithGemini(clusters) {
  if (!clusters || clusters.length === 0) return [];
  
  try {    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const enrichedClusters = await Promise.all(
      clusters.map(async (cluster) => {
        // Skip if too few points
        if (cluster.points.length < 3) return cluster;
        
        // Create a prompt for Gemini
        const prompt = `
        I have identified a geographic cluster of business loan applications with the following characteristics:
        
        - Number of applications: ${cluster.points.length}
        - Total loan value: $${cluster.totalLoanValue.toLocaleString()}
        - Average loan value: $${cluster.averageLoanValue.toLocaleString()}
        - Approval rate: ${cluster.approvalRate}%
        
        Based on this data, provide 2-3 short insightful observations about this geographic concentration of loan applications. 
        Focus on business implications, potential market opportunities, or risk factors.
        Keep your response brief and to the point, maximum 3 sentences.
        `;
        
        // Generate response
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const insights = response.text().trim();
        
        return {
          ...cluster,
          insights
        };
      })
    );
    
    return enrichedClusters;
  } catch (error) {
    console.error('Error analyzing clusters with Gemini:', error);
    return clusters; // Return original clusters without insights
  }
}
