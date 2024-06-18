module.exports = {
  config: {
    name: "start",
    description: {
      short: "Initiates The Bot",
      long: "Just a greetings"
    },
    category: "system"
  },

  start: async function({ api, event }) {
    return await api.sendMessage(event.chat.id, "Hello There");
  }
};