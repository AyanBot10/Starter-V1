const axios = require('axios');

module.exports = {
  config: {
    name: "waifu",
    aliases: ["wife"],
    version: "1.0",
    author: "Ayan Alvi",
    countdown: 6,
    role: 0,
      description: {
    short: "Get a random waifu image",
    long: "Get waifu images from the waifu API. Available categories: waifu, neko, shinobu, megumin, bully, cuddle, cry, kiss, lick, hug, awoo, pat, smug, bonk, yeet, blush, smile, wave, highfive, handhold, nom, bite, glomp, slap, kill, kick, happy, wink, poke, dance, cringe."
},
    category: "fun",
    guide: "/waifu [category] - Get a random waifu image. Default is 'waifu'."
  },

  start: async function ({ message, args }) {
    // Get category from user input or default to 'waifu'
    const category = args.length > 0 ? args.join(" ").toLowerCase() : "waifu";

    // Valid categories from the API
    const validCategories = ["waifu", "neko", "shinobu", "megumin", "bully", "cuddle", "cry", "kiss", "lick", "hug", "awoo", "pat", "smug", "bonk", "yeet", "blush", "smile", "wave", "highfive", "handhold", "nom", "bite", "glomp", "slap", "kill", "kick", "happy", "wink", "poke", "dance", "cringe"];

    // Check if the provided category is valid
    if (!validCategories.includes(category)) {
      return message.reply(`Invalid category! Available categories are: ${validCategories.join(", ")}.`);
    }

    try {
      // Fetch waifu image from the API
      const response = await axios.get(`https://api.waifu.pics/sfw/${category}`);
      const imageUrl = response.data.url;

      // Send the image URL as a message
      message.reply(`Here's your ${category} waifu! ${imageUrl}`);
    } catch (error) {
      console.error("Error fetching waifu image:", error);
      message.reply("Sorry, there was an error fetching the waifu image. Please try again later.");
    }
  }
};