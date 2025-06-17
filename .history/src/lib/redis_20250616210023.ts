import { Redis } from 'ioredis';

// Redis client setup
const redisUrl = process.env.REDIS_URL || 'redis://default:unlAQVqSudCdVZmmGIWsunXgsWlQKyuw@switchback.proxy.rlwy.net:15423';

const redis: Redis = (global as any).redis || new Redis(redisUrl);

if (!(global as any).redis) {
  (global as any).redis = redis;
}

export default redis;
