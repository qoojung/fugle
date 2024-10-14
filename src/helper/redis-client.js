const redisClient = require('redis');
const logger = require('./logger');
const config = require('../config/config');

const client = redisClient.createClient({
  url: `redis://${config.redis.host}:${config.redis.port}`,
});
console.log(config.redis.host, config.redis.port, config.redis.password);
client.on('error', (err) => {
  logger.error('Redis Client Error', err);
});

module.exports = { client };
