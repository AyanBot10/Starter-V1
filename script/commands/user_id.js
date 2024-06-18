module.exports = {
  config: {
    name: "userid",
    aliases: ["uid"],
    credits: "Samir Œ",
    description: "Retrieve user ID and username",
    usage: "{pn}",
    category: "utility"
  },
  start: async function({ api, event, message }) {
    let targetUserId, targetUsername;
    if (event.reply_to_message) {
      targetUserId = event.reply_to_message.from.id;
      targetUsername = event.reply_to_message.from?.username || (await api.getChat(targetUserId)).username || event.reply_to_message.from?.first_name
    } else {
      targetUserId = event.from.id;
      targetUsername = (await api.getChat(event.from.id)).username
    }

    const userInfo = `User ID: ${targetUserId}\nUsername: @${targetUsername}`;
    message.reply(userInfo);
  }
};