const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
    config: {
        name: 'image',
        description: 'Search for images using Unsplash',
        author: 'Ayan Alvi',
        access: 'anyone',
        usage: '[query]',
        category: 'miscellaneous',
    },

    start: async function ({ api, event, args }) { const chatId = event.chat.id;
        try {
            const searchQuery = args.join(' ');

            if (!searchQuery) {
                await api.sendMessage(chatId, 'Please send your search query to proceed.');
            } else {
                await searchAndSendImages(api, chatId, searchQuery);
            }
        } catch (error) {
            console.error('Error initializing image command:', error);
            await api.sendMessage(chatId, "🚫 An error occurred while initializing the search.");
        }
    },

    reply: async function ({ api, chatId, replyMsg }) {
        try {
            const searchQuery = replyMsg.text.trim();
            if (searchQuery.toLowerCase() === 'cancel') {
                await api.sendMessage(chatId, '❌ Search canceled.');
            } else if (searchQuery) {
                await searchAndSendImages(bot, chatId, searchQuery);
            } else {
                await api.sendMessage(chatId, '🚫 Invalid search query. Please provide a valid search query.');
            }
        } catch (error) {
            console.error("Error handling reply:", error);
            await api.sendMessage(chatId, "🚫 An error occurred while handling your reply. Please try again later.");
        }
    },
};

async function searchAndSendImages(api, chatId, searchQuery) {
    const cacheDir = path.join(__dirname, 'cache');
    await fs.ensureDir(cacheDir); // Ensure cache directory exists

    let loadingMessage;
    try {
        loadingMessage = await api.sendMessage(chatId, '🕟 Searching for images on Unsplash, please wait...');

        const response = await axios.get('https://api.unsplash.com/search/photos', {
            params: {
                page: 1,
                per_page: 10,
                query: searchQuery,
                client_id: 'oWmBq0kLICkR_5Sp7m5xcLTAdkNtEcRG7zrd55ZX6oQ'
            }
        });

        const results = response.data.results;
        if (results.length === 0) {
            await api.editMessageText('🚫 No images found for the query.', { chat_id: chatId, message_id: loadingMessage.message_id });
            return;
        }

        const media = [];
        for (let i = 0; i < results.length; i++) {
            const imagePath = path.join(cacheDir, `unsplash_${i + 1}.jpg`);
            const imageResponse = await axios.get(results[i].urls.regular, { responseType: 'arraybuffer' });
            await fs.writeFile(imagePath, imageResponse.data); // Use async write method
            media.push({ type: 'photo', media: fs.createReadStream(imagePath) });
        }

        await api.editMessageText('✔️ Images found. Sending now...', { chat_id: chatId, message_id: loadingMessage.message_id });
        await api.sendMediaGroup(chatId, media);

        // Delete the loading message after success
        await api.deleteMessage(chatId, loadingMessage.message_id);
    } catch (error) {
        console.error('Error fetching images:', error);
        if (loadingMessage) {
            await api.editMessageText('🚫 An error occurred while fetching images.', { chat_id: chatId, message_id: loadingMessage.message_id });
        } else {
            await api.sendMessage(chatId, '🚫 An error occurred while fetching images.');
        }
    }
}