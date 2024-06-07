const fs = require("fs");

function restart_log(event) {
  fs.writeFileSync("./handler/restart.json", JSON.stringify({
    legit: true,
    event: {
      chat_id: event.chat.id,
      time_ms: Date.now(),
      author_message: event.message_id
    }
  }, null, 2))
}

module.exports = {
  config: {
    name: "restart",
    description: "Restarts the bot",
    role: 1,
    usage: "{pn}"
  },
  start: async function({ event, api, message }) {
    await api.clearTextListeners()
    message.react("👍");
    restart_log(event);
    await global.utils.sleep(500)
    global.log("Exiting Process", "red", true)
    process.exit(4);
  }
}