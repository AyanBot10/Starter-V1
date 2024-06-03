const ytdl = require("@distube/ytdl-core");
const ytsr = require("ytsr");
const fs = require("fs-extra");
const { v4: uuid } = require("uuid");
const path = require("path");
const axios = require("axios");

const safe_mode = true;

module.exports = {
  config: {
    name: "youtube",
    aliases: ["ytb"],
    description: {
      short: "Search and download Videos from YouTube",
      long: "Search and download videos from YouTube. Results will include thumbnails along with titles and durations."
    },
    usage: "{pn} <search_query>"
  },

  start: async function({ api, event, args, message, cmd }) {
    let query = args.join(" ");
    if (!query)
      return message.Syntax(cmd);
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)([\w-]{11})(\S*)?$/;
    if (youtubeRegex.test(args[0])) {
      const processingMessage = await api.sendMessage(
        event.chat.id,
        "⏳ Downloading..."
      );
      let dir;
      try {
        function checkSize(filePath) {
          if (fs.statSync(filePath).size > 49.5 * 1024 * 1024) {
            throw new Error('Media Size exceeds 50MB size limit');
          }
        }
        const link = args[0]

        function checkTime(duration_ms) {
          const ms10M = 10 * 60 * 1000
          return duration_ms > ms10M;
        }
        const valueTime = checkTime(Number(ms))
        if (valueTime) {
          return await message.reply("Video is over 10 Mins")
        }
        dir = path.join(__dirname, "tmp", `${uuid()}.mp4`);
        api.sendChatAction(event.chat.id, 'upload_video')
        await downloadVID(link, dir)
        checkSize(dir)
        const stream = fs.createReadStream(dir);
        await api.sendVideo(event.chat.id, stream);
        if (fs.existsSync(dir)) {
          fs.unlinkSync(dir);
        }
      } catch (err) {
        console.error(err);
        await api.sendMessage(event.chat.id, err.message);
        if (fs.existsSync(dir)) {
          fs.unlinkSync(dir);
        }
      } finally {
        if (fs.existsSync(dir)) {
          fs.unlinkSync(dir);
        }
        if (processingMessage.message_id) {
          await api.deleteMessage(
            event.chat.id,
            processingMessage.message_id
          );
        }
      }
      return
    }

    const processingMessage = await api.sendMessage(
      event.chat.id,
      `Searching: ${query}`
    );

    try {
      const results = await searchYTB(query);
      const media = results.map(item => ({
        type: "photo",
        media: item.thumbnail_url
      }));

      const inline_data = results.map(item => [
        {
          text: `${item.duration} : ${item.title}`,
          callback_data: `${item.duration_ms}^${item.video_url}`
                }
            ]);

      const links = results.map(item => item.video_url);
      if (!safe_mode) {
        await api.sendMediaGroup(event.chat.id, media, {
          disable_notification: true,
          reply_to_message_id: event.message_id
        });
      }
      const sent = await api.sendMessage(
        event.chat.id,
        `Found ${inline_data.length} results`,
        {
          reply_markup: { inline_keyboard: inline_data },
          disable_notification: true
        }
      );
      global.bot.callback_query.set(sent.message_id, {
        event,
        ctx: sent,
        cmd: this.config.name
      });
      await api.deleteMessage(
        event.chat.id,
        processingMessage.message_id
      );
    } catch (err) {
      console.error(err);
      await api.deleteMessage(
        event.chat.id,
        processingMessage.message_id
      );
      await api.sendMessage(event.chat.id, "Exception Occurred");
    }
        process.on('unhandledRejection', (reason) => {
      message.reply(`<pre><b>Unhandled Rejection: ${reason.message || String(reason)}</b></pre>`, { parse_mode: "HTML" });
    });
  },

  callback_query: async function({ api, event, ctx, message }) {
    const processingMessage = await api.sendMessage(
      event.chat.id,
      "⏳ Downloading..."
    );
    let dir;
    try {
      function checkSize(filePath) {
        if (fs.statSync(filePath).size > 49.5 * 1024 * 1024) {
          throw new Error('Media Size exceeds 50MB size limit');
        }
      }
      await api.deleteMessage(
        ctx.message.chat.id,
        ctx.message.message_id
      );
      await api.answerCallbackQuery({ callback_query_id: ctx.id });
      let ms = (ctx.data.split('^'))[0]
      const link = (ctx.data.split('^'))[1]

      function checkTime(duration_ms) {
        const ms10M = 10 * 60 * 1000
        return duration_ms > ms10M;
      }
      const valueTime = checkTime(Number(ms))
      if (valueTime) {
        return await message.reply("Video is over 10 Mins")
      }
      dir = path.join(__dirname, "tmp", `${uuid()}.mp4`);
      api.sendChatAction(event.chat.id, 'upload_video')
      await downloadVID(link, dir)
      checkSize(dir)
      const stream = fs.createReadStream(dir);
      await api.sendVideo(event.chat.id, stream);
      if (fs.existsSync(dir)) {
        fs.unlinkSync(dir);
      }
    } catch (err) {
      console.error(err);
      await api.sendMessage(event.chat.id, err.message);
      if (fs.existsSync(dir)) {
        fs.unlinkSync(dir);
      }
    } finally {
      if (fs.existsSync(dir)) {
        fs.unlinkSync(dir);
      }
      if (processingMessage.message_id) {
        await api.deleteMessage(
          event.chat.id,
          processingMessage.message_id
        );
      }
    }
        process.on('unhandledRejection', (reason) => {
      message.reply(`<pre><b>Unhandled Rejection: ${reason.message || String(reason)}</b></pre>`, { parse_mode: "HTML" });
    });
  }
};


async function searchYTB(query) {
  try {
    const searchResults = await ytsr(query, { limit: 10 });
    const videos = searchResults.items.filter(
      item => item.type === "video"
    );

    let numVideos = 8;

    const validVideos = [];
    for (let video of videos.slice(0, numVideos)) {
      validVideos.push({
        title: video.title,
        video_url: video.url,
        thumbnail_url: video.bestThumbnail.url,
        duration_ms: parseDuration(video.duration),
        duration: video.duration
      });
      if (validVideos.length >= numVideos) break;
    }

    if (validVideos.length === 0) {
      throw new Error(`No video found for query: ${query}`);
    }

    return validVideos;
  } catch (error) {
    throw error;
  }
}

function parseDuration(durationString) {
  const parts = durationString.split(':').map(parseFloat);
  return parts.reduce((acc, time, index) => acc + time * Math.pow(60, parts.length - index - 1), 0) * 1000;
}

async function downloadVID(videoLink, savePath) {
  try {
    const videoId = ytdl.getURLVideoID(videoLink);
    const info = await ytdl.getInfo(videoId);

    const format = ytdl.chooseFormat(info.formats, {
      quality: "18",
      filter: format =>
        format.container === "mp4" &&
        format.height <= 1080 &&
        format.hasAudio &&
        format.hasVideo
    });
    if (!format) {
      throw new Error("No suitable format found");
    }

    const readableStream = ytdl(videoLink, { format });
    const writeStream = fs.createWriteStream(savePath);

    await new Promise((resolve, reject) => {
      readableStream.pipe(writeStream);
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
      readableStream.on("error", reject);
    });
  } catch (error) {
    console.error("Error downloading video:", error.message);
    throw error;
  }
}
