import { Redis } from 'ioredis';

// Redis client setup
const redisUrl = process.env.REDIS_URL || 'redis://default:unlAQVqSudCdVZmmGIWsunXgsWlQKyuw@switchback.proxy.rlwy.net:15423';

// Define types for the global object with redis client
declare global {
  var redis: Redis | undefined;
}

// Create or reuse the Redis instance
const redis = global.redis || new Redis(redisUrl);

// Store the client in the global object for connection reuse
if (!global.redis) {
  global.redis = redis;
}

export default redis;
