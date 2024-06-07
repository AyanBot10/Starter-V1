const ytdl = require("@distube/ytdl-core");
const ytsr = require("ytsr");
const fs = require("fs-extra");
const { v4: uuid } = require("uuid");
const path = require("path");
const axios = require("axios");

const safe_mode = false;
// Change this to true if you keep getting error woth thumbnails

module.exports = {
  config: {
    name: "youtube",
    aliases: ["ytb"],
    description: {
      short: "Search and download Videos from YouTube",
      long: "Search and download videos from YouTube. Results will include thumbnails along with titles and durations."
    },
    usage: "{pn} <search_query>",
    cooldown: 15
  },

  start: async function({ api, event, args, message, cmd }) {
    if (!args[0])
      return message.Syntax(cmd);
    let typeDL;
    let linkYtb;
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)([\w-]{11})(\S*)?$/;
    switch (args[0]) {
      case '-v':
      case 'video':
        typeDL = "video"
        linkYtb = args.slice(1).join(' ');
        break
      case '-a':
      case 'audio':
        typeDL = "audio";
        linkYtb = args.slice(1).join(' ');
        break
      default: {
        typeDL = "video"
        linkYtb = args[0]
      }
    }
    if (youtubeRegex.test(linkYtb)) {
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
        const link = linkYtb;
        dir = path.join(__dirname, "tmp", `${uuid()}.mp4`);
        var author, thumbnail, title
        if (typeDL === "video") {
          const info = await downloadVID(link, dir);
          var { author, thumbnail, title } = info
        } else if (typeDL === "audio") {
          const info = await downloadMP3(link, dir);
          var { author, thumbnail, title } = info
        }
        checkSize(dir)
        if (typeDL === "video") {
          api.sendChatAction(event.chat.id, 'upload_video')
          const stream = fs.createReadStream(dir);
          await api.sendVideo(event.chat.id, stream, {
            caption: title,
            performer: author,
            reply_to_message_id: event.message_id
          });
        } else {
          api.sendChatAction(event.chat.id, 'upload_audio')
          const stream = fs.createReadStream(dir);
          await api.sendAudio(event.chat.id, stream, {
            title,
            thumb: thumbnail,
            performer: author,
            reply_to_message_id: event.message_id
          });
        }
        if (fs.existsSync(dir)) {
          fs.unlinkSync(dir);
        }
      } catch (err) {
        console.error(err);
        await message.reply(err.message)
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
    let query;
    let type;
    switch (args[0]) {
      case 'video':
      case '-v': {
        query = args.slice(1).join(' ')
        type = "video"
        break
      }
      case 'audio':
      case '-a': {
        query = args.slice(1).join(' ')
        type = "audio"
        break
      }
      default:
        query = args.join(" ");
        type = "video"
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
        cmd: this.config.name,
        me: event.message_id,
        type
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
      await api.sendMessage(event.chat.id, err.message || "Exception Occured");
    }
  },

  callback_query: async function({ api, event, ctx, message, Context }) {
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
      let info;
      if (Context.type === "video") {
        dir = path.join(__dirname, "tmp", `${uuid()}.mp4`);
        info = await downloadVID(link, dir);
      } else if (Context.type === "audio") {
        dir = path.join(__dirname, "tmp", `${uuid()}.mp3`);
        info = await downloadMP3(link, dir)
      }
      checkSize(dir)
      Context.type === "video" ? api.sendChatAction(event.chat.id, 'upload_video') : api.sendChatAction(event.chat.id, 'upload_audio')
      const stream = fs.createReadStream(dir);
      if (Context.type === "video") {
        await api.sendVideo(event.chat.id, stream, {
          caption: info.title,
          performer: info.author,
          reply_to_message_id: Context?.me
        });
      } else {
        await api.sendAudio(event.chat.id, stream, {
          title: info.title,
          thumb: info.thumbnail,
          performer: info.author,
          reply_to_message_id: Context?.me
        });
      }
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
    const thumbnail = info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url;
    return { title: info.videoDetails.title, author: info.videoDetails.author.name, thumbnail }
  } catch (error) {
    console.error("Error downloading video:", error.message);
    throw error;
  }
}

async function downloadMP3(videoLink, savePath) {
  try {
    const videoId = ytdl.getURLVideoID(videoLink);
    const info = await ytdl.getInfo(videoId);
    const format = ytdl.chooseFormat(info.formats, {
      quality: "highestaudio",
      filter: format =>
        format.container === "webm" &&
        format.audioBitrate
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
    const thumbnail = info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url;
    return { title: info.videoDetails.title, author: info.videoDetails.author.name, thumbnail }
    // I have no idea why the thumbnail isn't working with audio files
  } catch (error) {
    console.error("Error downloading audio:", error.message);
    throw error;
  }
}