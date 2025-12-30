import Redis from "ioredis";

const redis = new Redis({
    host: process.env.UPSTASH_REDIS_REST_URL || "127.0.0.1",
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.UPSTASH_REDIS_REST_TOKEN || undefined,
})
export default redis;

