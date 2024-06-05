const fs = require("fs");
const restart = require("./tmp/restart.json");

module.exports = {
  config: {
    name: "restart",
    description: "Restarts bot and clears cache",
    usage: "{pn}",
    role: 1
  },
  start: async function({ api, message, event }) {
    try {
      message.reply("Restarting...")
      await api.stopPolling()
      fs.writeFileSync("tmp/restart.json", JSON.stringify({
        restart: {
          legit: true,
          time: Date.now(),
          message_id: event.message_id,
          chat_id: event.chat.id
        }
      }, null, 2));
      global.log("Exiting Process for restart", "red")
      process.exit(4)
    } catch (error) {
      console.error(error);
      message.reply(error.message);
    }
  },
};