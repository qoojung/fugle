const redisClient = require('redis');
const logger = require('./logger');
const config = require('../config/config');

const client = redisClient.createClient({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
});
client.on('error', (err) => {
  logger.error('Redis Client Error', err);
}).connect();

module.exports = { client };
