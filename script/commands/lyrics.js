const axios = require("axios");

module.exports = {
  config: {
    name: "lyrics",
    description: "Get lyrics for a song",
    usage: "{pn}lyrics <song name>",
    author: "Ayan ",
      category: "media"
  },

  start: async function ({ message, args }) {
    try {
      const songName = args.join(" ");

      if (!songName) {
        return message.reply("Please provide a song name.");
      }

      const apiUrl = `https://lyrist.vercel.app/api/${encodeURIComponent(songName)}`;
      const response = await axios.get(apiUrl);

      if (response.data.error) {
        return message.reply(`Lyrics not found for "${songName}".`);
      }

      const { lyrics, title, artist } = response.data;
      if (!lyrics) {
        return message.reply(`Lyrics not found for "${title}" by ${artist}.`);
      }

      const formattedLyrics = `✨ Title: ${title}\n🎀 Artist: ${artist}\n\n${lyrics}`;
      message.reply(formattedLyrics);

    } catch (error) {
      console.error("Error fetching lyrics: ", error.message);
      message.reply(`Sorry, there was an error getting the lyrics for "${args.join(" ")}".`);
    }
  }
};