module.exports = {
  redis: {
    host: 'redis',
    port: 6379,
    password: '',
  },
  ohlc: {
    keepMin: 15,
    reportIntervalSec: 60 * 1000,
  },
  rateControl: {
    ipAddr: {
      count: 10,
      interval: 60,
    },
    user: {
      count: 5,
      interval: 60,
    },
  },
};
