const TickerTopic = require('../../src/event/live-ticker');
jest.mock('../../src/helper/redis-client');
describe('user ticker', () => {
  it('basic operation', () => {
    const mock = {
      onMessage: jest.fn(),
      off: jest.fn(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
    };
    const topic = new TickerTopic(mock);
    const listener = jest.fn();
    topic.on('usdt', listener);
    expect(mock.subscribe).toHaveBeenCalledTimes(1);
    topic.on('usdt', listener);
    topic.on('usdt', listener);
    topic.on('usdt', listener);
    expect(mock.subscribe).toHaveBeenCalledTimes(1);
    topic.off('usdt', listener);
    expect(mock.unsubscribe).toHaveBeenCalledTimes(0);
    topic.off('usdt', listener);
    expect(mock.unsubscribe).toHaveBeenCalledTimes(0);
    topic.off('usdt', listener);
    expect(mock.unsubscribe).toHaveBeenCalledTimes(0);
    topic.off('usdt', listener);
    expect(mock.unsubscribe).toHaveBeenCalledTimes(1);
    topic.close();
  });
});
