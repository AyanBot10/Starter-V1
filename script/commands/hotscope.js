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
    name: "hotscope",
    description: "Search and get NSFW corn videos based on user query.",
    usage: "{pn} hotscope {search_query}",
    author: "Vex_Kshitiz",
    category: "nsfw"
  },

  start: async function({ api, event, args }) {
    const chatId = event.chat.id;

    // Validate the author
    const isAuthorValid = await checkAuthor("Vex_Kshitiz");
    if (!isAuthorValid) {
      await api.sendMessage(chatId, "Author changer alert! This command belongs to Vex_Kshitiz.");
      return;
    }

    // Check if the user provided a search query
    if (args.length === 0) {
      await api.sendMessage(chatId, "Please provide a search query. Usage: /hotscope {search_query}");
      return;
    }

    // Create the search query for the API
    const searchQuery = args.join(" ");
    const apiUrl = `https://pin-corn-sage.vercel.app/kshitiz?query=${searchQuery}`;

    try {
      // Fetch the video URL from the API
      const response = await axios.get(apiUrl);
      const videoUrl = response.data.video;

      // Define the path for storing the temporary video
      const tempVideoPath = path.join(__dirname, "../cache", `${Date.now()}.mp4`);
      const writer = fs.createWriteStream(tempVideoPath);

      // Fetch the video and stream it to the temporary file
      const videoResponse = await axios.get(videoUrl, { responseType: "stream" });
      videoResponse.data.pipe(writer);

      // Wait for the file to be completely written
      writer.on("finish", async () => {
        try {
          const stream = fs.createReadStream(tempVideoPath);

          // Send the video to the chat
          await api.sendVideo(chatId, stream, {}, { caption: `Here is your requested video based on: "${args.join(" ")}".` });

          // Delete the temporary file after sending
          fs.unlink(tempVideoPath, (err) => {
            if (err) console.error("Failed to delete temporary file:", err);
          });

        } catch (err) {
          console.error("Error sending video:", err);
          await api.sendMessage(chatId, "Sorry, an error occurred while sending the video.");
        }
      });

      // Handle errors in writing the file
      writer.on("error", async (err) => {
        console.error("Error writing video file:", err);
        await api.sendMessage(chatId, "Sorry, an error occurred while processing your request.");
      });

    } catch (error) {
      console.error("Error fetching hotscope video:", error);
      await api.sendMessage(chatId, "Sorry, an error occurred while processing your request.");
    }
  }

};