const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Function to check if the author matches
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
    name: "onlytik",
    description: "Get 18+ TikTok video.",
    usage: "{pn} onlytik",
    author: "Vex_Kshitiz",
      category: "nsfw"
  },

  start: async function({ api, event, args }) {
    const chatId = event.chat.id;

    // Check if the author is valid
    const isAuthorValid = await checkAuthor("Vex_Kshitiz");
    if (!isAuthorValid) {
      await api.sendMessage(chatId, "Author changer alert! This command belongs to Vex_Kshitiz.");
      return;
    }

    const apiUrl = "https://only-tik.vercel.app/kshitiz"; // API URL

    try {
      // Fetch video data from the OnlyTik API
      const response = await axios.get(apiUrl);
      const { videoUrl, likes } = response.data;

      // Define the temporary video path
      const tempVideoPath = path.join(__dirname, "../cache", `${Date.now()}.mp4`);
      const writer = fs.createWriteStream(tempVideoPath);

      // Fetch the video stream
      const videoResponse = await axios.get(videoUrl, { responseType: "stream" });
      videoResponse.data.pipe(writer);

      // Wait for the video to be fully written
      writer.on("finish", async () => {
        try {
          const stream = fs.createReadStream(tempVideoPath);

          // Send the video to the user with likes information
          await api.sendVideo(chatId, stream, {}, { caption: `Here is your requested video with ${likes} likes:` });

          // Delete the temporary file after sending
          fs.unlink(tempVideoPath, (err) => {
            if (err) console.error("Failed to delete temporary file:", err);
          });

        } catch (err) {
          console.error("Error sending video:", err);
          await bot.sendMessage(chatId, "Sorry, an error occurred while sending the video.");
        }
      });

      writer.on("error", (err) => {
        console.error("Error writing video file:", err);
        api.sendMessage(chatId, "Sorry, an error occurred while processing your request.");
      });

    } catch (error) {
      console.error("Error fetching OnlyTik video:", error);
      await api.sendMessage(chatId, "Sorry, an error occurred while processing your request.");
    }
  }

};