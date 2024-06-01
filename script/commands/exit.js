module.exports = {
  config: {
    name: "exit",
    aliases: ["kill"],
    description: "Kills Instance gracefully",
    role: 1
  },
  start: async function({ event, api }) {
    const admin = process.env['ADMIN']
    if (admin == event.from.id) {
      await api.sendMessage(event.chat.id, "Exiting");
      api.stopPolling()
        .then(() => {
          global.log("Exited Process", "red", true)
          process.exit(3);
        })
    } else {
      await api.sendMessage(event.chat.id, "Unauthorized")
    }
  }
}