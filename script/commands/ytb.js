const ytdl = require("@distube/ytdl-core");
const search = require('yt-search');
const fs = require("fs-extra");
const { v4: uuid } = require("uuid");
const path = require("path");

module.exports = {
  config: {
    name: 'youtube',
    aliases: ["ytb"],
    description: {
      short: "Search and download Videos from YouTube",
      long: "Search and download videos from YouTube. Results will include thumbnails along with titles and durations."
    }
  },

  start: async function({ api, event, args }) {
    const query = args.join(" ");
    if (!query) return api.sendMessage(event.chat.id, "Include a search query");

    const processingMessage = await api.sendMessage(event.chat.id, `Searching: ${query}`);

    try {
      const results = await searchYTB(query);
      const media = results.map(item => ({
        type: 'photo',
        media: item.thumbnail_url
      }));

      const inline_data = results.map(item => [{
        text: `${item.duration} : ${item.title}`,
        callback_data: item.video_url
      }]);
      await api.sendMediaGroup(event.chat.id, media, { disable_notification: true, reply_to_message_id: event.message_id });
      await api.sendMessage(event.chat.id, `Found ${inline_data.length} results`, {
        reply_markup: { inline_keyboard: inline_data },
        disable_notification: true
      });
      await api.deleteMessage(event.chat.id, processingMessage.message_id);
    } catch (err) {
      console.error(err);
      await api.deleteMessage(event.chat.id, processingMessage.message_id);
      await api.sendMessage(event.chat.id, "Exception Occurred");
    }
  },

  callback: async function({ api, event, ctx }) {
    console.log(ctx)
    try {
      const processingMessage = await api.sendMessage(event.chat.id, "⏳ Downloading...");
      await api.deleteMessage(ctx.message.chat.id, ctx.message.message_id);
      await api.answerCallbackQuery({ callback_query_id: ctx.id });
      const link = ctx.data;
      const dir = path.join(__dirname, "tmp", `${uuid()}.mp4`);
      await downloadVID(link, dir);
      await api.deleteMessage(event.chat.id, processingMessage.message_id);
      const stream = fs.createReadStream(dir);
      await api.sendVideo(event.chat.id, stream);
      fs.unlinkSync(dir);
    } catch (err) {
      console.error(err);
      await api.deleteMessage(event.chat.id, processingMessage.message_id);
      await api.sendMessage(event.chat.id, err.message);
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
    console.log(videos)
    if (videos.length == 0) {
      throw new Error(`No video found for query: ${query}`)
    }
    return videos
  } catch (error) {
    throw error;
  }
}

async function downloadVID(videoLink, savePath) {
  try {
    const videoId = ytdl.getURLVideoID(videoLink);
    const info = await ytdl.getInfo(videoId);

    const format = ytdl.chooseFormat(info.formats, {
      quality: '18',
      filter: format => format.container === 'mp4' && format.height <= 720 && format.hasAudio && format.hasVideo
    });
    if (!format) {
      throw new Error('No suitable format found');
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
    console.error("Error downloading video:", error.message);
    throw error;
  }
}