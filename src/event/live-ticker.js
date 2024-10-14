const events = require('node:events');
const { DateTime } = require('luxon');
const config = require('../config/config');
const logger = require('../helper/logger');
const { client: redisClient } = require('../helper/redis-client');

const KEEP_MIN = config.ohlc.keepMin;
const REPORT_INTERVAL_SEC = config.ohlc.reportIntervalSec;

const OHLC_KEY = 'OHLC:';
const LIVE_TRADE_PREFIX = 'live_trades_';
class LiveTicker extends events.EventEmitter {
  constructor(source) {
    super();
    this.topics = {};
    this.source = source;
    this.reportOHLC = setInterval(this.#reportOHLC.bind(this), REPORT_INTERVAL_SEC);
    source.onMessage(async (message) => {
      try {
        const msg = JSON.parse(message.toString('utf8'));
        if (msg.event === 'trade' && msg.channel) {
          const ch = msg.channel.replace(LIVE_TRADE_PREFIX, '');
          await this.#handleOHLC({ tradeData: msg.data, currencyPair: ch });
          msg.channel = ch;
          this.emit(ch, JSON.stringify(msg));
        } else {
          logger.info(JSON.stringify(msg));
        }
      } catch (error) {
        logger.error(error.stack);
      }
    });
  }

  async #handleOHLC({ tradeData, currencyPair }) {
    const date = DateTime.fromSeconds(parseInt(tradeData.timestamp, 10), { zone: 'utc' });
    const expireAt = date.plus({ minutes: KEEP_MIN }).startOf('minute').startOf('second');
    const timestampTag = date.toFormat('yyyy-MM-dd-hh-mm');
    const key = `${OHLC_KEY}${currencyPair}:${timestampTag}`;
    const ohlc = await redisClient.get(key);
    const price = parseFloat(tradeData.price);
    if (ohlc) {
      const ohlcObj = JSON.parse(ohlc);
      ohlcObj.close = price;
      ohlcObj.high = Math.max(ohlcObj.high, price);
      ohlcObj.low = Math.min(ohlcObj.low, price);
      redisClient.set(key, JSON.stringify(ohlcObj), { EXAT: expireAt.toSeconds() });
    } else {
      const ohlcObj = {
        open: price,
        high: price,
        low: price,
        close: price,
      };
      date.plus({ minutes: KEEP_MIN }).startOf('minute').startOf('second');
      await redisClient.set(key, JSON.stringify(ohlcObj), { EXAT: expireAt.toSeconds() });
    }
  }

  async #reportOHLC() {
    logger.info('Reporting OHLC');
    // report the last minute's ohlc
    const date = DateTime.utc().startOf('minute').minus({ minute: 1 });
    const timestampTag = date.toFormat('yyyy-MM-dd-hh-mm');
    this.eventNames().forEach(async (currencyPair) => {
      const key = `${OHLC_KEY}${currencyPair}:${timestampTag}`;
      const ohlc = await redisClient.get(key);
      if (ohlc) {
        const ohlcObj = Object.assign(JSON.parse(ohlc), { date: date.toFormat('yyyy-mm-dd HH:mm:ss') });
        date.toFormat('yyyy-MM-dd-hh-mm');
        const msg = {
          channel: currencyPair,
          data: ohlcObj,
          events: 'ohlc',
        };
        this.emit(currencyPair, JSON.stringify(msg));
      } else {
        logger.info(`No OHLC data for ${currencyPair}`);
      }
    });
  }

  on(channel, listener) {
    super.on(channel, listener);
    if (this.listenerCount(channel) === 1) {
      this.source.subscribe(channel);
    }
    return this;
  }

  off(channel, listener) {
    super.off(channel, listener);
    if (this.listenerCount(channel) === 0) {
      this.source.unsubscribe(channel);
    }
    return this;
  }

  close() {
    clearInterval(this.reportOHLC);
  }
}
module.exports = LiveTicker;
