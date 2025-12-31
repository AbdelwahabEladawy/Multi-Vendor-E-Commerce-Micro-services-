import 'dotenv/config';
import Redis from "ioredis";

// Support for Upstash Redis
let redis: Redis;
if (process.env.UPSTASH_REDIS_REST_URL) {
    // Parse Upstash Redis URL (format: redis://default:password@host:port)
    // Or use REST URL to get connection details
    const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
    // Extract host from Upstash URL (format: https://known-tomcat-16362.upstash.io)
    const host = upstashUrl.replace('https://', '').replace('http://', '').split('/')[0];
    
    redis = new Redis({
        host: host,
        port: 6379,
        password: process.env.REDIS_PASSWORD || process.env.UPSTASH_REDIS_REST_TOKEN,
        tls: {
            // Upstash requires TLS
            rejectUnauthorized: false
        },
        retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
        },
    });
} else {
    // Local Redis connection
    redis = new Redis({
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
    });
}

redis.on('error', (err) => {
    console.error('Redis connection error:', err.message);
});

redis.on('connect', () => {
    console.log('Redis connected successfully');
});

export default redis;

