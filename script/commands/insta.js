const axios = require("axios");
const { INSTA_DOWNLOADER: DLuri } = global.config.BOT;

function checkLink(url) {
  const regex = /^https:\/\//;
  if (!regex.test(url)) {
    throw new Error("Invalid Link Provided");
  }
}

async function fetchInsta(url) {
  const headers = {
    'Accept': 'application/json, text/plain, */*',
    'Content-Type': 'application/json'
  };
  try {
    const response = await axios.post(DLuri, { url }, { headers });
    return response.data;
  } catch (error) {
    throw error?.response?.data?.message || error.message;
  }
}

module.exports = {
  config: {
    name: "insta",
    description: "Download Insta Vids",
    usage: "{pn} <insta_link>",
    author: "Tanvir",
    category: "downloader"
  },
  start: async function({ event, args, api, message, cmd }) {
    if (!DLuri) return message.reply("Set Insta URI in config")
    if (!args[0]) return message.Syntax(cmd);
    try {
      message.react("👍", event.message_id)
      checkLink(args[0]);
      const videoData = await fetchInsta(args[0]);
      if (!videoData?.url?.[0]?.url) {
        return message.reply("Failed to fetch video info.");
      }
      api.sendChatAction(event.chat.id, "upload_video");
      api.sendVideo(event.chat.id, videoData.url[0].url, {
        reply_to_message_id: event.message_id,
        caption: videoData.meta.title
      });
    } catch (err) {
      message.reply(err.message);
    }
  }
};