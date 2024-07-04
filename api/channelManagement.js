class StateManager {
  constructor() {
    this.clientChannels = new Map();
  }

  addClient(clientId, channel) {
    this.clientChannels.set(clientId, channel);
  }

  removeClient(clientId) {
    this.clientChannels.delete(clientId);
  }

  getChannel(clientId) {
    return this.clientChannels.get(clientId);
  }
}

const stateManager = new StateManager();
module.exports = stateManager;