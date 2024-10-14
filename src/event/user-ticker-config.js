const events = require('node:events');

const ADD_ACTION = 'ADD';
const DEL_ACTION = 'DEL';

class UserTickerConfig extends events.EventEmitter {
  constructor() {
    super();
    this.userChannel = {}; // user: channel_1, channel_2
  }

  addChannel(user, channel) {
    if (this.userChannel[user] === undefined) {
      this.userChannel[user] = new Set();
    }
    if (this.userChannel[user].has(channel)) return;
    this.userChannel[user].add(channel);
    this.emit(user, { action: ADD_ACTION, channel });
  }

  delChannel(user, channel) {
    if (this.userChannel[user] === undefined || !this.userChannel[user].has(channel)) return;
    this.userChannel[user].delete(channel);
    if (this.userChannel[user].size === 0) delete this.userChannel[user];
    this.emit(user, { action: DEL_ACTION, channel });
  }

  getChannels(user) {
    return this.userChannel[user] === undefined ? new Set() : this.userChannel[user];
  }
}
module.exports = { UserTickerConfig, ADD_ACTION, DEL_ACTION };
