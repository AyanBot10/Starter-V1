module.exports = {
  config: {
    name: "exit",
    aliases: ["kill"],
    description: "Kills Instance gracefully",
    role: 1
  },
  start: async function({ event, api }) {
    api.sendMessage(event.chat.id, "Exiting");
    await message.unsend(event.message_id)
    api.stopPolling()
      .then(() => {
        global.log("Exited Process", "red", true)
        process.exit(3);
      })
  }
}