const axios = require('axios');
const path = require('path');
const fs = require('fs-extra');

module.exports = {
    config: {
        name: 'cosplay',
        author: 'Ayan Alvi',
        access: 'anyone',
        description: 'Send a random cosplay video.',
        category: '',
        cooldown: 0,
        usage: []
    },

    start: async function({ event, api }) {
        const chatId = event.chat.id;

        try {
            // Send a loading message to the chat
            const loadingMessage = await api.sendMessage(chatId, 'Loading...');

            // Define the GitHub repository details
            const owner = 'ajirodesu';
            const repo = 'cosplay';
            const branch = 'main'; // Adjust if necessary

            // Construct the URL for the repository
            const repoUrl = `https://github.com/${owner}/${repo}/tree/${branch}/`;

            // Fetch the HTML from the repository page
            const response = await axios.get(repoUrl);
            const html = response.data;

            // Use regex to extract .mp4 video file names from the HTML
            const videoFileRegex = /href="\/ajirodesu\/cosplay\/blob\/main\/([^"]+\.mp4)"/g;
            const videoFiles = [];
            let match;

            while ((match = videoFileRegex.exec(html)) !== null) {
                videoFiles.push(match[1]);
            }

            if (videoFiles.length === 0) {
                await api.editMessageText('No videos found in the repository.', {
                    chat_id: chatId,
                    message_id: loadingMessage.message_id
                });
                return;
            }

            // Select a random video
            const randomVideo = videoFiles[Math.floor(Math.random() * videoFiles.length)];

            // Construct the raw URL for the selected video
            const videoUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${randomVideo}`;

            // Download the video to the cache folder
            const videoPath = path.join(process.cwd(), 'script', 'commands', 'tmp', `${path.basename(randomVideo)}`);

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

            // Send the video with a generic caption
            await api.sendVideo(chatId, videoPath, { caption: 'Here’s a random cosplay video!' });

            // Delete the loading/sending message
            await api.deleteMessage(chatId, loadingMessage.message_id);

            // Clean up the cache
            fs.removeSync(videoPath);

        } catch (error) {
            console.error("Error executing cosplay command:", error);
            await api.sendMessage(chatId, `An error occurred: ${error.message}`);
        }
    }
};