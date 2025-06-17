import { Redis } from 'ioredis';

// Redis client setup
const redisUrl = process.env.REDIS_URL || 'redis://default:unlAQVqSudCdVZmmGIWsunXgsWlQKyuw@switchback.proxy.rlwy.net:15423';

let redis: Redis;

if (!global.redis) {
  global.redis = new Redis(redisUrl);
}

redis = global.redis;

export default redis;
