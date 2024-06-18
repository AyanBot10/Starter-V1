module.exports = {
  config: {
    name: "left_chat_member"
  },
  start: async function({ api, message, event }) {
    const uid = (await api.getMe()).id
    if (uid == event.from?.id) return
    message.send(`Bye Bye ${event.from.username ? "@"+event.from.username : event.from.first_name || event.from?.last_name || "User" }`)
  }
}