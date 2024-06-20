const axios = require('axios');
const cheerio = require('cheerio');
const fs = require("fs");
const path = require("path");

global.tmp = { xnxx: new Map() };

async function scrapeXnxx(query) {
  try {
    const response = await axios.get(`https://www.xnxx.com/?k=${encodeURIComponent(query)}`);
    const html = response.data;
    const $ = cheerio.load(html);
    const results = [];

    $('.thumb-block').each((index, element) => {
      const link = `https://www.xnxx.com${$(element).find('a').attr('href')}`;
      const idMatch = link.match(/video-\w+/);
      const id = idMatch ? idMatch[0] : '';
      const linkId = link.split('/').slice(-2, -1)[0];
      const title = $(element).find('p > a').attr('title') || $(element).find('p > a').text().trim();
      const image = $(element).find('.thumb-inside img').attr('data-src') || $(element).find('.thumb-inside img').attr('src');
      const linkURI = link.split('.com')[1];
      const video = `https://www.xnxx.com/embedframe/${id}`;

      results.push({
        link,
        id,
        title,
        image,
        linkId,
        frame: video,
        linkURI
      });
    });
    return results;
  } catch (error) {
    throw error;
  }
}

async function downloadXnxx(link) {
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36'
  };
  const postData = "query=" + link;

  const response = await axios.post('https://www.xnxx-downloader.net', postData, { headers });
  const html = response.data;
  const $ = cheerio.load(html);
  const element = $('.alert.alert-success').first();
  const indexLink = element.find('a.btn-primary');
  const rawLink = indexLink.attr('href');
  const body = element.find('p b').text();
  return { cdn: rawLink, title: body };
}

module.exports = {
  config: {
    name: "xnxx",
    aliases: ["porn", "xxx"],
    usage: "{pn} query",
    description: "Xnxx site scrapper. Get porn from xnxx.com",
    cooldown: 15,
    category: "miscellaneous"
  },
  start: async function({ event, args, api, message, cmd }) {
    const query = args.join(" ");
    if (!query || query.length < 3) return message.Syntax(cmd);
    try {
      message.indicator('upload_document')
      let search = await scrapeXnxx(query);
      search = search.slice(0, 6);

      const thumbnail = search.map(item => ({
        type: "photo",
        media: item.image
      }));
      const inline_data = search.map(item => [
        {
          text: item.title.substring(0, 55),
          callback_data: item.linkId
        }
      ]);

      search.forEach(item => global.tmp.xnxx.set(item.linkId, { link: item.link, title: item.title, cover: item.image }));

      await api.sendMediaGroup(event.chat.id, thumbnail, {
        disable_notification: true,
        reply_to_message_id: event.message_id
      });
      const sent = await message.send("The bot can't currently stream videos due to api restrictions. but it can send the videos in a different format which is downloadable and playable", {
        reply_markup: { inline_keyboard: inline_data },
        disable_notification: false
      });
      global.bot.callback_query.set(sent.message_id, {
        event,
        ctx: sent,
        cmd: this.config.name,
        chat: event.chat.id,
        msG: sent.message_id
      });
    } catch (err) {
      console.log(err);
      message.reply("Exception Occurred");
    }
  },
  callback_query: async function({ event, api, message, ctx, Context }) {
    let directory;
    try {
      await api.answerCallbackQuery({ callback_query_id: ctx.id });
      await message.edit("Downloading...", Context.msG, Context.chat, {
        reply_markup: { inline_keyboard: [] }
      });
      const linkId = ctx.data;
      if (global.tmp.xnxx.has(linkId)) {
        const full_link = global.tmp.xnxx.get(linkId);
        global.tmp.xnxx.delete(linkId);
        const response = await downloadXnxx(full_link.link);
        message.indicator('upload_document');
        directory = path.join(__dirname, "tmp", `${global.utils.uuid()}.mp4`)
        const buffer = await download(response.cdn, directory)
        await api.sendVideo(Context.chat, buffer, {
          thumb: full_link.image,
          caption: full_link.title
        });
      }
    } catch (err) {
      console.log(err.message);
      message.reply("Exception Occurred");
    } finally {
      if (directory && fs.existsSync(directory)) {
        fs.unlinkSync(directory);
      }
    }
  }
};

async function download(url, filePath) {
  try {
    const response = await axios({
      method: 'get',
      url,
      responseType: 'stream'
    });

    const file = fs.createWriteStream(filePath);
    response.data.pipe(file);

    await new Promise((resolve, reject) => {
      file.on('finish', resolve);
      file.on('error', reject);
    });

    return fs.readFileSync(filePath)
  } catch (error) {
    throw error;
  }
}