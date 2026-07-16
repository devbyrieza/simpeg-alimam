
import Redis from 'ioredis';

async function testRedis() {
  console.log('Testing Redis connection...');
  const redis = new Redis({
    host: '127.0.0.1',
    port: 6379,
    connectTimeout: 2000,
    maxRetriesPerRequest: 1
  });

  try {
    const start = Date.now();
    await redis.ping();
    console.log(`Redis PING successful in ${Date.now() - start}ms`);
  } catch (err: any) {
    console.error('Redis connection failed:', err.message);
  } finally {
    redis.disconnect();
  }
}

testRedis();
