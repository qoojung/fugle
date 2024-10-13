const Response = require('./response');
const logger = require('./logger');

module.exports = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (err) {
    logger.error(err.stack || err);
    new Response(res).sendErr('error');
  }
};
