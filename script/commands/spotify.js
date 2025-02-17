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

// Helper function to download YouTube songs using ytdl-core
async function downloadSong(url) {
  try {
    const info = await ytdl.getInfo(url);
    const audioFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
    const dir = path.join(__dirname, "tmp", `${uuid()}.mp3`);

    const audioStream = ytdl.downloadFromInfo(info, { format: audioFormat });
    const fileWriteStream = fs.createWriteStream(dir);

    audioStream.pipe(fileWriteStream);

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
    throw new Error("An error occurred while downloading the track.");
  }
}

module.exports = {
  config: {
    name: "spotify",
    aliases: ["music", "play", "sing"," song"],
    description: "Search and download songs from YouTube",
    usage: "{pn} <song_name or song_link>",
    author: "Tanvir",
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
        const prmsg = await api.sendMessage(event.chat.id, "✅ | Downloading track...");
        downloadResponse = await downloadSong(query);
        api.sendChatAction(event.chat.id, 'upload_audio');
        api.deleteMessage(event.chat.id, prmsg.message_id);
        await api.sendAudio(event.chat.id, downloadResponse.dir, {
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
        const x = await api.sendMediaGroup(event.chat.id, media, {
          disable_notification: true,
          reply_to_message_id: event.message_id
        });

        const sent = await api.sendMessage(
          event.chat.id,
          "Here are your results",
          {
            reply_markup: { inline_keyboard: inline_data },
            disable_notification: true
          }
        );
        global.bot.callback_query.set(sent.message_id, {
          event,
          ctx: sent,
          cmd: this.config.name,
          initials: {
            first: x.message_id,
            second: sent.message_id
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
      await api.answerCallbackQuery(ctx.id, { text: Context.authorMan == ctx.from.id ? "Downloading Your Song" : "Authorized" });
      if (Context.authorMan != ctx.from.id) return;
      await api.deleteMessage(event.chat.id, Context.initials.second);
      const prmsg = await api.sendMessage(event.chat.id, "✅ | Downloading track...");
      downloadResponse = await downloadSong(ctx.data);
      api.sendChatAction(event.chat.id, 'upload_audio');
      await api.sendAudio(event.chat.id, downloadResponse.dir, {
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