module.exports = {
  redis: {
    host: '127.0.0.1',
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
