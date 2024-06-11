const axios = require("axios");

function checkLink(url) {
  const regex = /^https:\/\//;
  if (!regex.test(url)) {
    throw new Error("Invalid Link Provided");
  }
}

async function downloader(url) {
  const link = global.config.BOT.DOWNLOADER;
  if (!link) {
    throw new Error("Include the API URI in config. 'DOWNLOADER'");
  }
  try {
    const response = await axios.get(`${link}/media/parse?address=${url}`, {
      headers: {
        accept: "application/json",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        "content-type": "application/json",
        "sec-ch-ua": '"Not-A.Brand";v="99", "Chromium";v="124"',
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-platform": '"Android"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        Referer: `${link}/pornhub-video-downloader.html`,
        "Referrer-Policy": "strict-origin-when-cross-origin"
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

function chooseFormat(formats) {
  if (!Array.isArray(formats)) {
    throw new Error("Formats are not an array");
  }

  const hasSound = formats.filter(format => format.acodec !== "none");
  const sortedFormats = (hasSound.length > 0 ? hasSound : formats).sort(
    (a, b) => {
      if (a.height !== null && b.height !== null) {
        return b.height - a.height;
      } else if (a.height === null && b.height === null) {
        return formats.indexOf(b) - formats.indexOf(a);
      } else if (a.height === null) {
        return 1;
      } else {
        return -1;
      }
    }
  );
  return sortedFormats[0];
}

module.exports = {
  config: {
    name: "download",
    aliases: ["fetch", "dl", "media"],
    description: "Fetches media from different sources",
    usage: "{pn} <post_link>",
    author: "Tanvir",
    cooldown: 15
  },
  start: async function({ event, args, api, message, cmd }) {
    if (!args[0]) return message.Syntax(cmd);
    try {
      checkLink(args[0]);
      const response = await downloader(args[0]);
      if (!response || !response.data || !response.data.formats) {
        throw new Error("Invalid Response");
      }

      const chosenFormat = chooseFormat(response.data.formats);
      const durationMinutes = String(Math.floor(response.data.duration / 60)).padStart(2, "0");
      const durationSeconds = String(Math.floor(response.data.duration % 60)).padStart(2, "0");
      const form = {
        body: ` ${response.data.title || "Video Downloaded"}`
      };

      const inline_keyboard = response.data.formats
        .filter(format => format.acodec !== "none")
        .map((format, i) => [{ text: `${format?.height || `CDN ${i + 1}`}`, url: format.url }]);

      const reply_markup = { inline_keyboard };
      api.sendChatAction(event.chat.id, "upload_video");
      api.sendVideo(event.chat.id, chosenFormat.url, {
        reply_to_message_id: event.message_id,
        caption: form.body,
        reply_markup
      });
    } catch (err) {
      message.reply(err.message);
    }
  }
};