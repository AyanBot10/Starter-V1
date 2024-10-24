const axios = require('axios');
const { v4: uuid } = require("uuid");
const fs = require("fs");
const path = require("path");
const ytdl = require('@distube/ytdl-core');
const ytSearch = require('yt-search');

// Helper function to search for YouTube tracks
async function searchTrack(query, limit) {
  try {
    const searchResult = await ytSearch(query);
    const videos = searchResult.videos.slice(0, limit); // Get up to 'limit' videos

    const simplifiedResponse = videos.map((video) => {
      const duration_minutes = String(Math.floor(video.duration.seconds / 60)).padStart(2, '0');
      const duration_seconds = String(video.duration.seconds % 60).padStart(2, '0');
      return {
        track_url: video.url,
        track_name: video.title,
        artist_names: video.author.name,
        duration: `${duration_minutes}:${duration_seconds}`,
        thumbnail: video.thumbnail,
      };
    });

    return simplifiedResponse;
  } catch (error) {
    throw new Error("An error occurred while searching for the track.");
  }
}

// Helper function to download YouTube videos with audio while ensuring it's under 50 MB
async function downloadVideo(url) {
  try {
    const info = await ytdl.getInfo(url);

    // Filter formats to get only those that have both video and audio
    const formats = info.formats.filter(format => format.hasVideo && format.hasAudio);

    // Choose the highest quality format with both video and audio
    let selectedFormat = ytdl.chooseFormat(formats, { quality: 'highest' });

    // Calculate the file size in MB
    let fileSizeMB = (selectedFormat.contentLength / (1024 * 1024)) || 0;

    // If the selected format is larger than 50 MB, choose a lower quality format
    if (fileSizeMB > 50) {
      selectedFormat = ytdl.chooseFormat(formats, { quality: 'lowest' });
      fileSizeMB = (selectedFormat.contentLength / (1024 * 1024)) || 0;
      if (fileSizeMB > 50) {
        throw new Error("Unable to find a suitable format under 50 MB.");
      }
    }

    const dir = path.join(__dirname, "tmp", `${uuid()}.mp4`);

    const videoStream = ytdl.downloadFromInfo(info, { format: selectedFormat });
    const fileWriteStream = fs.createWriteStream(dir);

    videoStream.pipe(fileWriteStream);

    await new Promise((resolve, reject) => {
      fileWriteStream.on('finish', resolve);
      fileWriteStream.on('error', reject);
    });

    const response = {
      status: "success",
      title: info.videoDetails.title,
      artist: info.videoDetails.author.name,
      duration: info.videoDetails.lengthSeconds,
      trackurl: info.videoDetails.video_url,
      thumbnail: info.videoDetails.thumbnails[0].url,
      dir
    };

    return response;
  } catch (error) {
    console.error(error);
    throw new Error("An error occurred while downloading the video.");
  }
}

module.exports = {
  config: {
    name: "video",
    aliases: ["ytplay"],
    description: "Search and Play videos from YouTube",
    usage: "{pn} <song_name>",
    author: "Ayan Alvi",
    cooldown: 20,
    category: "media"
  },
  start: async function({ event, api, args, message }) {
    if (!global.tmp.youtube) global.tmp.youtube = new Set();
    const query = args.join(" ");
    let downloadResponse;

    if (!query) {
      return message.reply("⚠ | Please provide a track name or a track link.");
    }

    // Download by YouTube URL
    if (query.match(/^(https:\/\/www\.youtube\.com\/watch\?v=|https:\/\/youtu\.be\/)/i)) {
      try {
        const prmsg = await api.sendMessage(event.chat.id, "✅ | Downloading video...");
        downloadResponse = await downloadVideo(query);
        api.sendChatAction(event.chat.id, 'upload_video');
        api.deleteMessage(event.chat.id, prmsg.message_id);
        await api.sendVideo(event.chat.id, downloadResponse.dir, {
          caption: `• Title: ${downloadResponse.title}\n• Artist: ${downloadResponse.artist}\n• Duration: ${downloadResponse.duration}`,
          title: downloadResponse.title,
          performer: downloadResponse.artist,
          thumb: await axios.get(downloadResponse.thumbnail, { responseType: "arraybuffer" })
        });
      } catch (error) {
        console.error(error);
        message.reply(`Error: ${error?.message || "Occurred"}`);
      }
    } else {
      // Search and show YouTube results
      try {
        api.sendChatAction(event.chat.id, 'upload_document');
        const tracks = await searchTrack(query, 4);
        if (tracks.length === 0) {
          return message.reply("⚠ | No tracks found for the given query.");
        }
        const inline_data = tracks.map(track => [
          {
            text: `${track.artist_names} - ${track.track_name}`,
            callback_data: track.track_url
          }
        ]);
        const media = tracks.map(item => ({
          type: "photo",
          media: item.thumbnail,
          performer: item.artist_names,
          title: item.track_name,
          caption: item.track_name
        }));

        // Send media group and capture message IDs
        const x = await api.sendMediaGroup(event.chat.id, media, {
          disable_notification: true,
          reply_to_message_id: event.message_id
        });

        const mediaMessageIds = x.map(m => m.message_id);

        // Send the message with search results
        const sent = await api.sendMessage(
          event.chat.id,
          "Here are your results",
          {
            reply_markup: { inline_keyboard: inline_data },
            disable_notification: true
          }
        );

        // Store message IDs for deletion later
        global.bot.callback_query.set(sent.message_id, {
          event,
          ctx: sent,
          cmd: this.config.name,
          initials: {
            mediaGroupMessageIds: mediaMessageIds,
            textMessageId: sent.message_id
          },
          authorMan: event.from.id
        });
      } catch (error) {
        console.error(error);
        message.reply(error.message);
      }
    }
  },
  callback_query: async function({ event, api, ctx, Context, message }) {
    let dir;
    try {
      await api.answerCallbackQuery(ctx.id, { text: Context.authorMan == ctx.from.id ? "Downloading Your Video" : "Authorized" });
      if (Context.authorMan != ctx.from.id) return;

      // Delete the search result message (text)
      await api.deleteMessage(event.chat.id, Context.initials.textMessageId);

      // Delete the media group messages one by one
      for (const messageId of Context.initials.mediaGroupMessageIds) {
        await api.deleteMessage(event.chat.id, messageId);
      }

      const prmsg = await api.sendMessage(event.chat.id, "✅ | Downloading video...");
      downloadResponse = await downloadVideo(ctx.data);
      api.sendChatAction(event.chat.id, 'upload_video');
      await api.sendVideo(event.chat.id, downloadResponse.dir, {
        caption: `• Title: ${downloadResponse.title}\n• Artist: ${downloadResponse.artist}\n• Duration: ${downloadResponse.duration}`,
        thumb: downloadResponse.thumbnail,
        title: downloadResponse.title,
        performer: downloadResponse.artist
      });
      dir = downloadResponse.dir;
      api.deleteMessage(event.chat.id, prmsg.message_id);

    } catch (error) {
      console.error(error);
      api.sendMessage(event.chat.id, `${error?.message || "Exception Occurred"}`);
    } finally {
      if (dir) fs.unlinkSync(dir);
    }
  }
};