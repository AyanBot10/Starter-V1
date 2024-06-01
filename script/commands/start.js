module.exports = {
  config: {
    name: "start",
    description: {
      short: "Initiates The Bot",
      long: this.short
    }
  },

  start: async function({ api, event }) {
    return await api.sendMessage(event.chat.id, "Hello There");
  }
};