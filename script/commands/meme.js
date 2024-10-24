const axios = require('axios');

module.exports = {
    config: {
        name: 'meme',
        description: 'Get a random meme.',
        author: 'Ayan Alvi',
        version: '1.0',
        cooldowns: 5,
        category: 'fun',
        guide: '{p}meme',
    },

    start: async function({ api, event, args }) {
        const chatId = event.chat.id;

        try {
            // Fetch a random meme from the meme API
            const response = await axios.get("https://meme-api.com/gimme");
            const { url: image, title } = response.data;

            // Send the meme image with the title as a caption
            await api.sendPhoto(chatId, image, { caption: title });

        } catch (error) {
            console.error('Error fetching meme:', error.message);

            // Notify the user if an error occurs
            await api.sendMessage(chatId, 'Sorry, I couldn\'t fetch a meme at the moment. Please try again later.');
        }
    }
};