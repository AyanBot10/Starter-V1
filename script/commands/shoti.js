const axios = require('axios');
const path = require('path');
const fs = require('fs-extra');

module.exports = {
    config: {
        name: 'shoti',
        author: 'Ayan Alvi',
        access: 'anyone',
        description: 'Send a random TikTok video with the username as a caption.',
        cooldown: 0,
        category: 'media',
        usage: []
    },

    start: async function({ event,api }) {
        const chatId = event.chat.id;

        try {
            // Send a loading message to the chat
            const loadingMessage = await api.sendMessage(chatId, 'Loading...');

            // Fetch random TikTok video data from the Shoti API
            const apiUrl = `https://shoti-srv2.onlitegix.com/api/v1/request-f`;
            const response = await axios.get(apiUrl);

            if (response.data.code !== 200) {
                await api.editMessageText('Failed to retrieve video. Please try again later.', {
                    chat_id: chatId,
                    message_id: loadingMessage.message_id
                });
                return;
            }

            const { url: videoUrl, user: { username } } = response.data.data;

            // Download the video to the cache folder
            const videoPath = path.join(process.cwd(), 'script', 'commands','tmp', `${username}.mp4`);

            const videoResponse = await axios({
                url: videoUrl,
                method: 'GET',
                responseType: 'stream'
            });
            const videoStream = videoResponse.data.pipe(fs.createWriteStream(videoPath));
            await new Promise(resolve => videoStream.on('finish', resolve));

            // Edit the loading message to indicate sending
            await api.editMessageText('Sending...', {
                chat_id: chatId,
                message_id: loadingMessage.message_id
            });

            // Send the video with the username as the caption
            await api.sendVideo(chatId, videoPath, { caption: `@${username}` });

            // Delete the loading/sending message with a "Thanos snap" effect
            await api.deleteMessage(chatId, loadingMessage.message_id);

            // Clean up the cache
            fs.removeSync(videoPath);

        } catch (error) {
            console.error("Error executing shoti command:", error);
            await api.sendMessage(chatId, `An error occurred: ${error.message}`);
        }
    }
};