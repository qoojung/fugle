const url = require('url');
const WebSocket = require('ws');
const UserLiveConfig = require('./event/user-ticker-config');
const logger = require('./helper/logger');
const LiveTickerEvent = require('./event/live-ticker');
const { UserTickerConfig } = require('./event/user-ticker-config');
const LiveTickSource = require('./model/api/tick-stream');

class WebSocketServer {
  constructor({ eventBus, userConfig }) {
    this.wss = null;
    this.eventBus = eventBus;
    this.userConfig = userConfig;
  }

  handleConnection(ws, req) {
    const self = this;
    const { user } = url.parse(req.url, true).query;
    const connChannels = new Set(self.userConfig.getChannels(user));
    const listener = (data) => {
      ws.send(data);
    };
    logger.info(`user login ID=${user} ${JSON.stringify([...connChannels])}`);
    connChannels.forEach((channel) => self.eventBus.on(channel, listener));
    self.userConfig.on(user, (data) => {
      logger.info('user receive config change ', data.channel, data.action);

      if (data.action === UserLiveConfig.ADD_ACTION) {
        if (connChannels.has(data.channel)) return;
        self.eventBus.on(data.channel, listener);
        connChannels.add(data.channel);
      } else if (data.action === UserLiveConfig.DEL_ACTION) {
        if (!connChannels.has(data.channel)) return;
        this.eventBus.off(data.channel, listener);
        connChannels.delete(data.channel);
      }
    });

    ws.on('close', () => {
      logger.info(`user logout ID=${user}`);
      connChannels.forEach((channel) => self.eventBus.off(channel, listener));
    });
    ws.on('error', (err) => {
      logger.error(`user error logout ID=${user}`, err.stack);
      connChannels.forEach((channel) => self.eventBus.off(channel, listener));
    });
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        let output = {};
        if (data.action === 'subscribe' && data.channel) {
          output = self.#handleSubscribe({ user, data, connChannels });
        } else if (data.action === 'unsubscribe' && data.channel) {
          output = self.#handleUnSubscribe({ user, data, connChannels });
        } else {
          output = { msg: 'command not exist', code: 1 };
        }
        ws.send(JSON.stringify(output));
      } catch (error) {
        logger.error(error.stack);
        const output = { error: 'JSON parse Error', code: 1 };
        ws.send(JSON.stringify(output));
      }
    });
  }

  #handleSubscribe({ user, data, connChannels }) {
    if (connChannels.has(data.channel)) return { msg: 'success', code: 0 };
    this.userConfig.addChannel(user, data.channel);
    logger.info(`user issue subscribe ${data.channel}`);
    return { msg: 'success', code: 0 };
  }

  #handleUnSubscribe({ user, data, connChannels }) {
    if (!connChannels.has(data.channel)) return { msg: 'success', code: 0 };
    this.userConfig.delChannel(user, data.channel);
    logger.info(`user issue unsubscribe ${data.channel}`);
    return { msg: 'success', code: 0 };
  }

  async start({ server }) {
    const me = this;
    this.wss = new WebSocket.Server({ noServer: true });
    this.wss.on('connection', (ws, req) => {
      this.handleConnection(ws, req);
    });
    server.on('upgrade', (request, socket, head) => {
      const { pathname } = url.parse(request.url, true);
      if (pathname === '/streaming') {
        me.wss.handleUpgrade(request, socket, head, (ws) => {
          me.wss.emit('connection', ws, request);
        });
      } else {
        socket.destroy();
      }
    });
  }

  stop() {
    this.wss.close();
  }
}

async function startWsServer(server) {
  const source = new LiveTickSource();
  await source.init();
  const eventBus = new LiveTickerEvent(source);
  const userConfig = new UserTickerConfig();
  const webserver = new WebSocketServer({ eventBus, userConfig });
  webserver.start(server);
  return webserver;
}

module.exports.startWsServer = startWsServer;
