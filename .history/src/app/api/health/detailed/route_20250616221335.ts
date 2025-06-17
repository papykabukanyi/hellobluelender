import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export const dynamic = 'force-dynamic'; // Never cache this route
export const revalidate = 0;

export async function GET() {
  const startTime = Date.now();
  const healthStatus: {
    status: string;
    timestamp: string;
    environment: string;
    uptime: number;
    services: {
      redis: {
        status: string;
        message: string;
        latency: number;
      }
    };
    responseTime?: number;
  } = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    services: {
      redis: {
        status: 'unknown',
        message: '',
        latency: 0
      }
    }
  };

  // Test Redis connection if it's available
  try {
    const redisStartTime = Date.now();
    
    // Try a simple Redis operation
    await redis.set('health_check_test', 'ok');
    const result = await redis.get('health_check_test');
    
    const redisLatency = Date.now() - redisStartTime;
    
    // Update Redis status
    healthStatus.services.redis = {
      status: result === 'ok' ? 'healthy' : 'degraded',
      message: result === 'ok' ? 'Redis connection successful' : 'Redis responded but with unexpected result',
      latency: redisLatency
    };
  } catch (error) {
    // Redis connection failed
    healthStatus.services.redis = {
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Unknown Redis error',
      latency: 0
    };
    
    // Only mark the entire service unhealthy if Redis is critical
    // For now, we keep the overall status as healthy since the app can still function
    // If Redis is absolutely required, you could set overall status to unhealthy here
  }

  // Calculate total response time
  const responseTime = Date.now() - startTime;
  healthStatus.responseTime = responseTime;
  
  // Return detailed health check response
  return NextResponse.json(healthStatus, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}
