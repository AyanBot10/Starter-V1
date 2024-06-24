const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require("path");

async function process_url(url) {
  try {
    if (url.startsWith('fb.watch/')) {
      url = 'https://' + url;
    } else if (url.includes('facebook.com/watch/') || url.includes('facebook.com/reel/') || url.includes('facebook.com/groups/')) {
      const idMatch = url.match(/(\d+)/);
      if (idMatch) {
        url = `https://facebook.com/${idMatch[0]}`;
      }
    } else if (url.includes('www.facebook.com/')) {
      url = url.replace('www.facebook.com', 'm.facebook.com');
    }
    const response = await axios.head(url, { maxRedirects: 0 });
    if (response.headers.location) {
      return response.headers.location.replace('www.facebook.com', 'm.facebook.com');
    } else {
      return url;
    }
  } catch (error) {
    if (error.response?.status >= 300 && error.response?.status < 400 && error.response.headers.location) {
      return error.response.headers.location.replace('www.facebook.com', 'm.facebook.com');
    } else {
      throw error;
    }
  }
}

async function scrape_info(url) {
  try {
    if (!fs.existsSync(path.resolve("facebook_cookies.json")))
      throw new Error("facebook_cookies.json doesn't exist");
    const cookies = JSON.parse(fs.readFileSync('facebook_cookies.json', 'utf8'));
    const formattedCookies = Object.fromEntries(cookies.map(cookie => [cookie.key, cookie.value]));
    const final_url = await process_url(url);
    const response = await axios.get(final_url, {
      headers: {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        "cache-control": "max-age=0",
        "dpr": "2.625",
        "sec-ch-prefers-color-scheme": "dark",
        "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\"",
        "sec-ch-ua-full-version-list": "\"Not_A Brand\";v=\"8.0.0.0\", \"Chromium\";v=\"120.0.6099.116\"",
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-model": "\"SM-S918B/DS\"",
        "sec-ch-ua-platform": "\"Android\"",
        "sec-ch-ua-platform-version": "\"13.0.0\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "none",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "viewport-width": "980",
        "cookie": Object.entries(formattedCookies).map(([key, value]) => `${key}=${value}`).join('; ')
      }
    });
    const $ = cheerio.load(response.data);
    let fb_title = '';
    let media_url = '';
    $('p').each(function() {
      fb_title = $(this).text().trim();
      if (fb_title) {
        return false;
      }
    });
    $('a').each(function() {
      const href = $(this).attr('href');
      if (href && href.includes('video')) {
        media_url = decodeURIComponent(href.replace('/video_redirect/?src=', ''));
        return false;
      }
    });
    return { fb_title, media_url };
  } catch (error) {
    throw error;
  }
}

module.exports = {
  config: {
    name: "facebook",
    aliases: ["videofb"],
    author: "Tanvir",
    cooldown: 10,
    description: {
      short: "Facebook video scrapper",
      long: "Facebook Video Scrapper. It uses Facebook account cookies to access Facebook and extract the video"
    },
    category: "downloader",
    usage: "{pn} [ Facebook URL ]"
  },

  start: async function({ message, args, event, api, cmd }) {
    const fbUrl = args[0];
    if (!fbUrl) return message.Syntax(cmd);
    let processing;
    try {
      processing = await message.reply("Downloading Video");
      const { fb_title, media_url } = await scrape_info(fbUrl);
      if (!media_url) {
        message.unsend(processing.message_id);
        return message.reply("Failed to Extract Video CDN");
      }
      const inlineKeyboard = {
        inline_keyboard: [[{ text: 'DOWNLOAD', url: media_url }]]
      };
      await message.indicator("upload_video");
      await api.sendVideo(event.chat.id, media_url, {
        reply_to_message_id: event.message_id,
        allow_sending_without_reply: true,
        caption: fb_title || "tg@Jsusbin",
      //  reply_markup: inlineKeyboard
      });
      await message.react("👍", event.message_id);
      await message.unsend(processing.message_id);
    } catch (error) {
      console.error(error);
      message.unsend(processing.message_id);
      message.reply(error.message);
    }
  }
};