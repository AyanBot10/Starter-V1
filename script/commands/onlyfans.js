const axios = require("axios");
const fs = require("fs");
const path = require("path");

async function checkAuthor(authorName) {
  try {
    const response = await axios.get('https://author-check.vercel.app/name');
    const apiAuthor = response.data.name;
    return apiAuthor === authorName;
  } catch (error) {
    console.error("Error checking author:", error);
    return false;
  }
}

module.exports = {
  config: {
    name: "onlyfans",
    aliases: ["onlyfan"],
    author: "Vex_Kshitiz",
    version: "1.0",
    cooldowns: 5,
    role: 0,
    description: {
    short: "Get OnlyFans video",
    long: "Fetches a random video from OnlyFans"
    },
    category: "nsfw",
    usage: "{p}onlyfans"
  },

  start: async function({ api, event, args }) {
    const chatId = event.chat.id;

    const isAuthorValid = await checkAuthor(module.exports.config.author);
    if (!isAuthorValid) {
      await api.sendMessage(chatId, "Author changer alert! This command belongs to Vex_Kshitiz.");
      return;
    }

    const apiUrl = "https://only-fans-iota.vercel.app/kshitiz";

    try {
      const response = await axios.get(apiUrl);
      const { videoUrl, title } = response.data;

      const tempVideoPath = path.join(__dirname, "cache", `${Date.now()}.mp4`);
      const writer = fs.createWriteStream(tempVideoPath);
      const videoResponse = await axios.get(videoUrl, { responseType: "stream" });
      videoResponse.data.pipe(writer);

      writer.on("finish", async () => {
        try {
          const stream = fs.createReadStream(tempVideoPath);

          // Send the video to the chat with an optional title
          await api.sendVideo(chatId, stream, {}, { caption: title || "Here is your requested OnlyFans video." });

          // Delete the temporary file after sending
          fs.unlink(tempVideoPath, (err) => {
            if (err) console.error("Failed to delete temporary file:", err);
          });
        } catch (err) {
          console.error("Error sending video:", err);
          await api.sendMessage(chatId, "Sorry, an error occurred while sending the video.");
        }
      });

      writer.on("error", async (err) => {
        console.error("Error writing video file:", err);
        await api.sendMessage(chatId, "Sorry, an error occurred while processing your request.");
      });

    } catch (error) {
      console.error("Error fetching OnlyFans video:", error);
      await api.sendMessage(chatId, "Sorry, an error occurred while processing your request.");
    }
  }
};