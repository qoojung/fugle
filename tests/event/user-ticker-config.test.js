const { UserTickerConfig, ADD_ACTION, DEL_ACTION } = require('../../src/event/user-ticker-config');

describe('user ticker', () => {
  it('basic operation', () => {
    const userConfig = new UserTickerConfig();
    userConfig.addChannel('u', 'btcusd');
    userConfig.addChannel('u', 'btcusd');
    userConfig.addChannel('u', 'btcero');
    userConfig.addChannel('u', 'btcero');
    const userK = userConfig.getChannels('k');
    let userU = userConfig.getChannels('u');
    expect(userU).toContain('btcero');
    expect(userU).toContain('btcusd');
    expect(userK.size).toEqual(0);
    userConfig.delChannel('u', 'btcero');
    userConfig.delChannel('u', 'btcusd');
    userU = userConfig.getChannels('u');
    expect(userU.size).toEqual(0);
  });
  it('event test', () => {
    const userConfig = new UserTickerConfig();
    const mockHandler = jest.fn();
    userConfig.on('u2', mockHandler);
    userConfig.addChannel('u2', 'btcero');
    expect(mockHandler).toHaveBeenLastCalledWith({ action: ADD_ACTION, channel: 'btcero' });
    // duplicate add
    mockHandler.mockReset();
    userConfig.addChannel('u2', 'btcero');
    expect(mockHandler).toHaveBeenCalledTimes(0);

    userConfig.delChannel('u2', 'btcero');
    expect(mockHandler).toHaveBeenLastCalledWith({ action: DEL_ACTION, channel: 'btcero' });
    // duplicate delete
    mockHandler.mockReset();
    userConfig.delChannel('u2', 'btcero');
    expect(mockHandler).toHaveBeenCalledTimes(0);
  });
});
