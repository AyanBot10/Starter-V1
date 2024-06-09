module.exports = {
  config: {
    name: "profile",
    aliases: ["pfp"],
    description: "Fetches profile image",
    usage: "pfp [username|user_id] (optional, or reply to a user message)",
    credits: "Samir"
  },
  start: async function({ event: msg, args, message, api: bot, cmd }) {
    let targetUserId = msg.from.id;
    let chatId = msg.chat.id

    if (msg.reply_to_message) {
      targetUserId = msg.reply_to_message.from.id;
    } else if (args.length > 0) {
      targetUserId = args[0];
    }
    const username = await api.getChat(targetUserId)

    try {
      const photos = await bot.getUserProfilePhotos(targetUserId);
      if (photos.total_count === 0) {
        return bot.sendMessage(chatId, "No Profile Image Found");
      }

      const fileId = photos.photos[0][0].file_id;
      await bot.sendPhoto(chatId, fileId, { caption: `Profile image of ${username}` });
    } catch (error) {
      const photos = await bot.getUserProfilePhotos(msg.from.id);
      const fileId = photos.photos[0][0].file_id;
      await bot.sendPhoto(chatId, fileId, { caption: "Your Profile Image" })
    }
  }
};