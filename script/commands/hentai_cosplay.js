const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const uuid = require("uuid");
const PDFDocument = require('pdfkit');
const sharp = require('sharp');

const baseUrl = process.env["HCOSPLAY"]

const headers = {
  Referer: baseUrl,
};

async function fetchMangas(url) {
  try {
    const response = await axios.get(url, { headers });
    const $ = cheerio.load(response.data);
    let mangas = [];

    $('div.image-list-item').each((i, element) => {
      const manga = {
        title: $(element).find('.image-list-item-title').text().trim(),
        url: $(element).find('a').attr('href'),
        thumbnail_url: $(element).find('img').attr('src').replace('http://', 'https://'),
      };
      mangas.push(manga);
    });
    const hasNextPage = $('div.wp-pagenavi > a[rel=next]').length > 0;
    return { mangas, hasNextPage };
  } catch (error) {
    throw error
  }
}

async function searchMangas(query, page = 1) {
  const searchUrl = `${baseUrl}/search/keyword/${encodeURIComponent(query)}/page/${page}/`;
  return await fetchMangas(searchUrl);
}

async function downloadChapter(chapterUrl, downloadPath) {
  try {
    const response = await axios.get(chapterUrl, { headers });
    const $ = cheerio.load(response.data);
    const imageUrls = [];

    $('#display_image_detail img, #detail_list img').each((i, element) => {
      const imageUrl = $(element).attr('src').replace('http://', 'https://');
      imageUrls.push(imageUrl);
    });

    if (!fs.existsSync(downloadPath)) {
      fs.mkdirSync(downloadPath, { recursive: true });
    }

    for (const [index, imageUrl] of imageUrls.entries()) {
      const imageResponse = await axios.get(imageUrl, { responseType: 'stream' });
      const imageFileName = path.join(downloadPath, `tg@Jsusbin_${index + 1}.jpg`);
      imageResponse.data.pipe(fs.createWriteStream(imageFileName));
    }
    return downloadPath;
  } catch (error) {
    throw error;
  }
}

async function fetchPopularMangas(page = 1) {
  const popularUrl = `${baseUrl}/ranking/page/${page}/`;
  return await fetchMangas(popularUrl);
}

async function fetchLatestUpdates(page = 1) {
  const latestUrl = `${baseUrl}/recently/page/${page}/`;
  return await fetchMangas(latestUrl);
}

module.exports = {
  config: {
    name: "hcosplay",
    description: "Download Porn Cosplay Magazines",
    usage: "{pn} <query> or {pn}",
    cooldown: 10,
    category: "magazine"
  },
  start: async function({ event, message, args, api, cmd }) {
    if (!global.tmp.hcosplay) {
      global.tmp.hcosplay = new Map();
    }
    if (!baseUrl) return message.reply("No URI SET")
    let query;
    if (!args[0]) {
      query = ["viral", "new"][Math.floor(Math.random() * 2)];
    } else {
      query = args.join(' ');
    }

    let response;
    switch (query) {
      case 'viral': {
        response = await fetchPopularMangas();
        break;
      }
      case 'new': {
        response = await fetchLatestUpdates();
        break;
      }
      default: {
        if (!query) return message.Syntax(cmd);
        response = await searchMangas(query);
        break;
      }
    }

    const media = response.mangas.slice(0, 8).map((item) => ({
      type: "photo",
      media: item.thumbnail_url,
      caption: item.title
    }));

    const inline_data = response.mangas.slice(0, 8).map((item) => {
      const random = uuid.v4();
      global.tmp.hcosplay.set(random, {
        name: item.title,
        link: baseUrl + item.url
      });
      return [{
        text: item.title,
        callback_data: random
      }];
    });

    await message.indicator("upload_photo");
    await api.sendMediaGroup(event.chat.id, media, {
      disable_notification: true,
      reply_to_message_id: event.message_id
    });

    const sentButtons = await message.reply("Choose Your Gem", {
      allow_sending_without_reply: true,
      disable_notification: false,
      reply_markup: { inline_keyboard: inline_data }
    });

    global.bot.callback_query.set(sentButtons.message_id, {
      cmd,
      author: event.from.id
    });
  },
  callback_query: async function({ event, message, api, Context, ctx }) {
    if (Context.author !== ctx.from.id) {
      return await api.answerCallbackQuery(ctx.id, { text: "Unauthorized" });
    }

    const xxx = await message.edit("Confirmed...", ctx.message.message_id, ctx.message.chat.id, {
      reply_markup: { inline_keyboard: [] }
    });

    await api.answerCallbackQuery(ctx.id, { text: "Downloading Gem" });

    const item = global.tmp.hcosplay.get(ctx.data);
    global.tmp.hcosplay.delete(ctx.data);

    const downloadDir = path.join(__dirname, "tmp", item.name);
    const returnedDir = await downloadChapter(item.link, downloadDir);
    const createPDF = await makePDF(returnedDir);

    const pdfFileName = path.basename(createPDF);

    await message.unsend(xxx.message_id, ctx.message.chat.id);
    await message.indicator("upload_document");
    await api.sendDocument(ctx.message.chat.id, createPDF, {
      filename: pdfFileName,
      allow_sending_without_reply: true,
      caption: item.name
    });
  }
};

async function makePDF(folderName) {
  try {
    const pdfPath = folderName + '.pdf';
    const imageFiles = fs.readdirSync(folderName);

    const doc = new PDFDocument({ autoFirstPage: false });
    doc.pipe(fs.createWriteStream(pdfPath));

    for (const imageFile of imageFiles) {
      const cleanedImageFile = imageFile.split('?')[0];
      const imagePath = path.join(folderName, cleanedImageFile);
      const imageExtension = path.extname(cleanedImageFile).toLowerCase();

      try {
        const { width: imageWidth, height: imageHeight } = await sharp(imagePath).metadata();
        doc.addPage({ size: [imageWidth, imageHeight] });

        if (['.png', '.jpeg', '.jpg', '.gif'].includes(imageExtension)) {
          doc.image(imagePath, 0, 0, { width: imageWidth, height: imageHeight });
        }

        doc.fontSize(10).fillColor('black').text('tg@Jsusbin', 30, 30);
      } catch (imageError) {
        continue;
      } finally {
        fs.unlinkSync(path.join(folderName, imageFile));
      }
    }
    doc.end();
    return pdfPath;
  } catch (error) {
    throw error;
  }
}