const Response = require('./response');
const logger = require('./logger');

module.exports = (fn) => async (res, req, next) => {
  try {
    await fn(res, req, next);
  } catch (err) {
    logger.error(err.message, err.stack || err);
    new Response(res).sendErr('error');
  }
};
