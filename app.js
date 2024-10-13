const express = require('express');
const logger = require('./src/helper/logger');
const Response = require('./src/helper/response');
const rateControl = require('./src/helper/rate-control');
const route = require('./src/route');

const startSever = () => {
  const app = express();
  const port = process.env.PORT || 3000;
  app.set('trust proxy', true);
  app.use(express.json());
  app.use((err, req, res, next) => {
    new Response(res).sendErr(err.message || err);
  });
  app.use('/', rateControl.middleware, route);
  app.listen(port, () => {
    logger.info(`Service is started at PORT ${port}`);
  });
};

(() => {
  startSever();
})();
