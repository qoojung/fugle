const express = require('express');
const http = require('http');
const logger = require('./src/helper/logger');
const Response = require('./src/helper/response');
const rateControl = require('./src/helper/rate-control');
const wsServer = require('./src/ws-server');
const redisClient = require('./src/helper/redis-client');

const route = require('./src/route');

const startSever = async () => {
  const app = express();
  const port = process.env.PORT || 3000;
  await redisClient.client.connect();
  logger.info('REDIS connected');
  app.set('trust proxy', true);
  app.use(express.json());
  app.use((err, req, res, next) => {
    new Response(res).sendErr(err.message || err);
  });
  app.use('/', rateControl.middleware, route);
  // start server
  const server = http.createServer(app);
  await wsServer.startWsServer({ server, port });
  server.listen(port, '0.0.0.0', () => {
    logger.info(`Service is started at PORT ${port}`);
  });
};

(() => {
  startSever();
})();
