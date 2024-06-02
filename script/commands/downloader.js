const axios = require('axios');
const { shortLink } = require('qiao-short-link');

function checkLink(url) {
  const regex = /^https:\/\//;
  if (regex.test(url)) {
    return true;
  } else {
    throw new Error("Invalid Link Provided");
  }
}

async function downloader(url) {
  const link = process.env.DOWNLOADER;
  if (!link) throw new Error("Include the API URI in .env file of the key 'DOWNLOADER'");
  try {
    const response = await axios.get(`${link}/media/parse?address=${url}`, {
      headers: {
        "accept": "application/x-www-form-urlencoded",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        "content-type": "application/x-www-form-urlencoded;charset=utf-8",
        "sec-ch-ua": "\"Not-A.Brand\";v=\"99\", \"Chromium\";v=\"124\"",
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-platform": "\"Android\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "Referer": `${link}/pornhub-video-downloader.html`,
        "Referrer-Policy": "strict-origin-when-cross-origin"
      }
    });
    return response;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  config: {
    name: "download",
    aliases: ["fetch", "dl", "media"],
    description: "Fetches media from different sources",
    usage: "{pn} <post_link>",
    author: "Tanvir"
  },
  start: async function({ event, args, api, message }) {
    if (!args[0]) return message.Syntax();
    try {
      checkLink(args[0])
      message.react([{ type: 'emoji', emoji: '👌' }], event.message_id);
      const response = await downloader(args[0]);
      if (!response.data || !response.data.data || !response.data.data.formats) {
        throw new Error("Invalid Response");
      }

      const form = {
        body: `🎦 ${response.data.data.title || 'N/A'}\n\n`
      };

      const chosenFormat = chooseFormat(response.data.data.formats);
      if (chosenFormat.height) {
        form.body += `• Quality: ${chosenFormat.height}p\n`;
      }
      const durationMinutes = String(Math.floor(response.data.data.duration / 60)).padStart(2, '0');
      const durationSeconds = String(Math.floor(response.data.data.duration % 60)).padStart(2, '0');
      form.body += `• Duration: ${durationMinutes}:${durationSeconds}\n`;
      form.body += `• Download URL(s):\n`;

      const formatsWithAudio = response.data.data.formats.filter(format => format.acodec !== 'none');
      for (const format of formatsWithAudio) {
        const shortUrl = await shorten(format.url);
        form.body += `${format.height || "--"}: ${shortUrl || "--"}\n`;
      }

      message.react([{ type: 'emoji', emoji: "💯" }], event.message_id);
      api.sendChatAction(event.chat.id, 'upload_video');
      api.sendVideo(event.chat.id, chosenFormat.url, { reply_to_message_id: event.message_id, caption: form.body });
    } catch (err) {
      message.reply(err.message);
      message.react([{ type: 'emoji', emoji: '🤡' }], event.message_id);
    }
  }
};

async function shorten(url) {
  try {
    const result = await shortLink(url, 3000);
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

function chooseFormat(formats) {
  if (!Array.isArray(formats)) {
    throw new Error("Formats are not an array");
  }

  const hasSound = formats.filter(format => format.acodec !== 'none');
  const sortedFormats = (hasSound.length > 0 ? hasSound : formats).sort((a, b) => {
    if (a.height !== null && b.height !== null) {
      return b.height - a.height;
    } else if (a.height === null && b.height === null) {
      return formats.indexOf(b) - formats.indexOf(a);
    } else if (a.height === null) {
      return 1;
    } else {
      return -1;
    }
  });
  return sortedFormats[0];
}