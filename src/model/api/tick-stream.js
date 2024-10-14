const WebSocket = require('ws');
const logger = require('../../helper/logger');

const LIVE_TRADE_PREFIX = 'live_trades_';
class TickStream {
  constructor() {
    this.client = null;
  }

  async init() {
    if (this.client) {
      return;
    }
    this.client = new WebSocket('wss://ws.bitstamp.net');
    await this.wait();
  }

  onMessage(callback) {
    this.client.on('message', (data) => {
      callback(data);
    });
  }

  subscribe(currencyPair) {
    const data = {
      event: 'bts:subscribe',
      data: {
        channel: `${LIVE_TRADE_PREFIX}${currencyPair}`,
      },
    };
    this.client.send(JSON.stringify(data));
    logger.info(`upstream subscribe ${currencyPair}`);
  }

  unsubscribe(currencyPair) {
    const data = {
      event: 'bts:unsubscribe',
      data: {
        channel: `${LIVE_TRADE_PREFIX}${currencyPair}`,
      },
    };
    this.client.send(JSON.stringify(data));
    logger.info(`upstream unsubscribe ${currencyPair}`);
  }

  async wait() {
    return new Promise((resolve, reject) => {
      const errCb = (error) => reject(error);
      this.client.on('error', errCb);
      this.client.once('open', () => {
        this.client.removeEventListener('error', errCb);
        logger.info('LiveTicker upstream start');
        resolve();
      });
    });
  }
}
module.exports = TickStream;
