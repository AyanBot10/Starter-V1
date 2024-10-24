const axios = require('axios');
const fs = require('fs-extra');
const { join } = require('path');

module.exports = {
    config: {
        name: 'facts',
        description: 'Generate an image with the provided text.',
        author: 'Ayan Alvi',
        version: '1.0',
        cooldowns: 5,
        category: 'fun',
        usage: '{p}facts <text>', // Usage guide
    },

    start: async function({ api, event, args }) {
        const chatId = event.chat.id;
        const text = args.join(' ');

        // Check if text is provided
        if (!text) {
            return await api.sendMessage(chatId, `Please provide text to generate an image. Usage: ${module.exports.config.usage}`);
        }

        // Define API URL with text parameter
        const apiUrl = `https://api.popcat.xyz/facts?text=${encodeURIComponent(text)}`;

        // Define cache folder path
        const cacheFolder = join(__dirname, 'cache');
        await fs.ensureDir(cacheFolder); // Ensure cache directory exists

        // Define image file path
        const imagePath = join(cacheFolder, `${Date.now()}_facts.png`);

        try {
            // Download the image from the API
            const response = await axios.get(apiUrl, { responseType: 'stream' });

            // Save the image to cache
            const writer = fs.createWriteStream(imagePath);
            response.data.pipe(writer);

            // Wait for the image to be fully written
            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            // Send the image to the chat
            await api.sendPhoto(chatId, fs.createReadStream(imagePath), { caption: 'Here is your fact!' });

            // Delete the cached image after sending
            await fs.unlink(imagePath);
        } catch (error) {
            console.error('Error processing facts command:', error);
            await api.sendMessage(chatId, 'An error occurred while generating the image. Please try again later.');
        }
    }
};