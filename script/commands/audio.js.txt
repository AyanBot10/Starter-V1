const ytdl = require("@distube/ytdl-core");
const search = require('yt-search');
const fs = require("fs-extra");
const { v4: uuid } = require("uuid");
const path = require("path");

module.exports = {
  config: {
    name: 'audio',
    aliases: ["song", "mp3"],
    description: {
      short: "Search and download Audios from YouTube",
      long: "Search and download Audios from YouTube. Results will include thumbnails along with titles and durations."
    }
  },

  start: async function({ api, event, args }) {
    let query = args.join(" ");
    if (!query) return api.sendMessage(event.chat.id, "Include a search query");

    const processingMessage = await api.sendMessage(event.chat.id, `Searching: ${query}`);

    try {
      const results = await searchYTB(query);
      const inlineData = results.map(item => [{
        text: `${item.duration} : ${item.title}`,
        callback_data: item.video_url
      }]);
      await api.sendMessage(event.chat.id, `Found  ${inlineData.length} results`, {
        reply_markup: { inline_keyboard: inlineData },
        disable_notification: true,
        reply_to_message_id: event.message_id
      });
      await api.deleteMessage(event.chat.id, processingMessage.message_id);
    } catch (err) {
      console.error(err);
      await api.deleteMessage(event.chat.id, processingMessage.message_id);
      await api.sendMessage(event.chat.id, "Exception Occurred");
    }
  },

  callback: async function({ api, event, ctx }) {
    const processingMessage = await api.sendMessage(event.chat.id, "⏳ Downloading...");
    try {
      await api.deleteMessage(ctx.message.chat.id, ctx.message.message_id);
      await api.answerCallbackQuery({ callback_query_id: ctx.id });
      const link = ctx.data;
      const dir = path.join(__dirname, "tmp", `${uuid()}.mp3`);
      await downloadVID(link, dir);
      const stream = fs.createReadStream(dir);
      await api.sendAudio(event.chat.id, stream, { filename: 'audio.mp3', mimetype: 'audio/mpeg' });
      fs.unlinkSync(dir);
    } catch (err) {
      console.error(err);
      await api.sendMessage(event.chat.id, err.message);
    } finally {
      await api.deleteMessage(event.chat.id, processingMessage.message_id);
    }
  }
};

async function searchYTB(query) {
  try {
    let { videos } = await search(query);
    videos = videos
      .slice(0, [3, 4][Math.floor(Math.random() * 2)])
      .map(video => ({
        title: video.title,
        video_url: video.url,
        thumbnail_url: video.thumbnail,
        duration: video.timestamp
      }));
    if (videos.length == 0) {
      throw new Error(`No video found for query: ${query}`)
    }
    return videos;
  } catch (error) {
    throw error;
  }
}

async function downloadVID(videoLink, savePath) {
  try {
    const videoId = ytdl.getURLVideoID(videoLink);
    const info = await ytdl.getInfo(videoId);

    const format = ytdl.chooseFormat(info.formats, {
      quality: 'highestaudio',
      filter: 'audioonly'
    });
    if (!format) {
      throw new Error('No suitable audio format found');
    }

    const readableStream = ytdl(videoLink, { format });
    const writeStream = fs.createWriteStream(savePath);

    await new Promise((resolve, reject) => {
      readableStream.pipe(writeStream);
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
      readableStream.on('error', reject);
    });
  } catch (error) {
    console.error("Error downloading audio:", error.message);
    throw error;
  }
}