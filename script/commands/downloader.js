const axios = require('axios');
const { shortLink } = require('qiao-short-link');

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
      message.react([{ type: 'emoji', emoji: '⏳' }], event.message_id);
      let form = {}
      const response = await downloader(args[0]);
      if (!response.data || !response.data.data || !response.data.data.formats) {
        throw new Error("Invalid response structure");
      }
      form.body = `🎦 ${response.data.data.title || 'N/A'}\n\n`
      let chosen_format = chooseFormat(response.data.data.formats);
      if (chosen_format.height) {
        form.body += `• Quality: ${chosen_format.height}p\n`;
      }
      let dis_mins = String(Math.floor(response.data.data.duration / 60)).padStart(2, '0');
      let dis_secs = String(Math.floor(response.data.data.duration % 60)).padStart(2, '0');
      form.body += `• Duration: ${dis_mins}:${dis_secs}\n`;
      form.body += `• Download URL(s):\n`;
      const pani_Formats = response.data.data.formats.filter(format => format.acodec !== 'none');
      for (const format of pani_Formats) {
        const shortUrl = await shorten(format.url);
        form.body += `${format.height || "--"}: ${shortUrl || "--"}\n`;
      }
      message.react([{ type: 'emoji', emoji: "✅" }], event.message_id);
      api.sendChatAction(event.chat.id, 'upload_video')
      api.sendVideo(event.chat.id, chosen_format.url, { reply_to_message_id: event.message_id })
    } catch (err) {
      message.reply(err.message)
    }
  }
}

async function downloader(url) {
  const link = process.env('DOWNLOADER');
  if (!link) throw new Error("Include the API URI in .env file of the key 'DOWNLOADER'")
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
  const coolFormats = hasSound.length > 0 ? hasSound : formats;
  coolFormats.sort((a, b) => {
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
  return coolFormats[0];
}