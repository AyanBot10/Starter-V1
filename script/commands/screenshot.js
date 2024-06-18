const axios = require('axios');

module.exports = {
  config: {
    name: "screenshot",
    aliases: ["ss"],
    description: "Take a screenshot of a webpage or Google search results",
    usage: "{pn} query || link",
    cooldown: 15,
    category: "utility"
  },

  start: async function({ args, cmd, event, api: bot }) {
    if (!args[0]) return message.Syntax(cmd)
    const query = args.join(' ');
    const url = query.startsWith('http') ? query : `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    const apiURL = `https://image.thum.io/get/width/1920/crop/400/fullpage/noanimate/${url}`;
    const chatId = event.chat.id;

    try {
      const response = await axios.get(apiURL, { responseType: 'arraybuffer' });

      if (response.status !== 200) {
        return bot.sendMessage(chatId, `API not responding. Please try again later.`);
      }

      const imageBuffer = Buffer.from(response.data, 'binary');
      await bot.sendPhoto(chatId, imageBuffer, { caption: `Screenshot: ${query}`, reply_to_message_id: event.message_id });
    } catch (error) {
      console.error('[ERROR]', error);
      bot.sendMessage(chatId, 'An error occurred while processing the command.');
    }
  }
};