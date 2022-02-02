const config = require('config');
const Redis = require('ioredis');

const cfg = {
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    keyPrefix: config.redis.keyPrefix,
    connectTimeout: config.redis.connectTimeout,
    maxRetriesPerRequest: config.redis.maxRetriesPerRequest,
    retryStrategy: (times) => Math.min(times * 30, 1000),
    enableOfflineQueue: config.redis.enableOfflineQueue,
    showFriendlyErrorStack: config.redis.showFriendlyErrorStack
};

const redis = {
    create: () => new Redis(cfg),
}

module.exports = redis;