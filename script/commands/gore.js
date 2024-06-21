const axios = require("axios");
const cheerio = require("cheerio");
const { v4: uuid } = require("uuid");

async function stream(link) {
  if (!link) return null;
  const { data: html } = await axios.get(link);
  const $ = cheerio.load(html);
  const videoSrc = $('video.wp-video-shortcode source').attr('src');
  return videoSrc;
}

async function process(search, items = 6) {
  try {
    const link = search[0] === "latest" ? 'https://seegore.com/gore/' : search[0] ? `https://seegore.com/?s=${search.join("+")}` : `https://seegore.com/gore/page/${Math.floor(Math.random() * 185) + 1}`;
    const response = await axios.get(link);
    const $ = cheerio.load(response.data);
    let links = [];

    $('div.bb-media-placeholder').each((index, element) => {
      const parent = $(element).closest('.post-item');
      const postLink = parent.find('a[rel="bookmark"]').attr('href');
      if (postLink && postLink !== "https://seegore.com/random-video/") {
        links.push(postLink);
      }
    });

    links = links.slice(0, items);

    const batchSize = 4;
    let postDetails = [];

    for (let i = 0; i < links.length; i += batchSize) {
      const batch = links.slice(i, i + batchSize);
      const batchPromises = batch.map(async (postLink) => {
        const postResponse = await axios.get(postLink);
        const $$ = cheerio.load(postResponse.data);
        const title = $$('meta[property="og:title"]').attr('content');
        const image = $$('meta[property="og:image"]').attr('content');
        const streamLink = await stream(postLink);
        return { title, link: postLink, image, streamLink };
      });

      const batchResults = await Promise.all(batchPromises);
      postDetails = postDetails.concat(batchResults);
    }

    return postDetails;
    /**
     * @return
     * [{
       title, link, image, streamLink
     }]
     */
  } catch (err) {
    throw err;
  }
}

module.exports = {
  config: {
    name: "seegore",
    aliases: ["gore"],
    usage: "{pn} <query>",
    description: "A simple seegore.com scrapper command",
    cooldown: 10,
    category: "miscellaneous"
  },
  start: async function({ event, api, message, cmd, args }) {
    try {
      if (!global.tmp.gore) global.tmp.gore = new Map()
      message.indicator();
      let response = await process(args);
      if (response.length === 0) return message.reply(`No results found`)
      const media = response.map((item) => ({
        type: "photo",
        media: item.image,
        performer: "seegore.com",
        caption: item.title
      }));
      const inline_data = response.map((item) => {
        const random = uuid();
        global.tmp.gore.set(random, item.streamLink);
        return [{
          text: item.title.substring(0, 50),
          callback_data: random
        }];
      });
      const sendAlbum = await api.sendMediaGroup(event.chat.id, media, {
        disable_notification: true,
        reply_to_message_id: event.message_id
      });
      const sendButtons = await api.sendMessage(event.chat.id, 'Select Video', {
        reply_markup: { inline_keyboard: inline_data },
        disable_notification: true
      })
      global.bot.callback_query.set(sendButtons.message_id, {
        cmd,
        author: event.from.id,
        messageID: sendButtons.message_id
      })
    } catch (err) {
      message.reply("Exception Occurred")
      console.error(err)
    }
  },
  callback_query: async function({ event, api, ctx, Context, message }) {
    try {
      await api.answerCallbackQuery({ callback_query_id: ctx.id });
      if (Context.author != ctx.from.id) return message.reply("Unauthorized");
      await message.edit("Scrapping the selected video...", ctx.message.message_id, event.chat.id, { reply_markup: { inline_keyboard: [] } })
      await api.sendChatAction(event.chat?.id, "upload_video")
      await api.deleteMessage(event.chat.id, ctx.message.message_id);
      await api.sendVideo(event.chat.id, global.tmp.gore.get(ctx.data))
    } catch (err) {
      api.sendMessage(event.chat.id, `${err.message}\nAPI only allows MP4 links ;(`)
    }
  }
}