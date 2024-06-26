const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const sharp = require('sharp');
const path = require('path');
const { v4: uuid } = require("uuid");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const MangaNato = 'https://manganato.com';
const maxNato = 3;

module.exports = {
  config: {
    name: "manga",
    description: {
      long: "Download mangas in bulk",
      short: "Downloads Manga"
    },
    usage: "{pn} settings - Extension Settings\n{pn} <query or empty> (MangaNato)\n{pn} <query> (MangaPill)\nMangaPill: {pn} <manga_name> . It will look for mangas and then prompt you with similar titles and when a prompt (button) is selected, it will fetch the chapter details of the manga and will ask you to reply with the chapter index (reply with '20 22' for downloading chapters from 20 to 22) or to download a single chapter, reply with let's say '33'\nManganato: {pn} by default will get either the latest update or the most popular mangas or if a query is provided then it will look for that. The instructions will be given when manganato is initiated in texts.",
    cooldown: 10,
    category: "magazine"
  },
  start: async function({ event, message, args, api, cmd, usersData }) {
    if (!global.tmp.manga) global.tmp.manga = new Set();
    if (!global.tmp.mangaID) global.tmp.mangaID = new Map();
    let natoQuery;
    let sentNato;
    const typeSite = (await usersData.retrieve(event.from.id))?.mangaPrefered;
    if (args[0] === "settings") {
      const inline_data = [{
        text: typeSite === "nato" ? '⚬ MangaNato ⚬' : "MangaNato",
        callback_data: "nato"
          }, {
        text: typeSite === "pill" ? '⚬ MangaPill ⚬' : "MangaPill",
        callback_data: "pill"
          }]
      const buttons = await message.reply(`Active Extension: ${typeSite === "pill" ? "MangaPill" : typeSite === "nato" ? "Manganato" : "N/A"}\nWould you like to change?`, {
        reply_markup: {
          inline_keyboard: [inline_data]
        }
      })
      return global.bot.callback_query.set(buttons.message_id, {
        cmd,
        author: event.from.id,
        type: "changeButton",
        mid: buttons.message_id
      })
    }
    if (typeSite === "pill") {
      if (!args[0]) return message.Syntax(cmd, "Include Action/Query");
      const messageText = args.join(' ');
      const match = messageText.match(/(https:\/\/mangapill\.com\/manga\/\d+\/[\w-]+) \| (\d+) -> (\d+)/);

      if (!match) {
        try {
          const searchQuery = args.join(' ');
          await message.indicator()
          const searchResults = await scrapeMangaPill(searchQuery);
          if (searchResults.length === 0) {
            return message.reply("Nothing Found");
          }

          const inline_data = searchResults.map((item) => {
            const random = uuid();
            global.tmp.mangaID.set(random, item.href);
            return [{
              text: item.name,
              callback_data: random
          }]
          });

          const sendButtons = await message.reply('Select Manga', {
            reply_markup: {
              inline_keyboard: inline_data
            },
            disable_notification: true
          });
          global.bot.callback_query.set(sendButtons.message_id, {
            cmd,
            author: event.from.id,
            typeSite
          })
        } catch (error) {
          console.error("Error during search or message sending:", error);
          return message.reply(error.message);
        }
        return;
      }
      const [, url, start, end] = match;
      const startPoint = parseInt(start);
      const endPoint = parseInt(end);

      if (
        isNaN(startPoint) ||
        isNaN(endPoint) ||
        startPoint <= 0 ||
        endPoint <= 0 ||
        startPoint > endPoint ||
        endPoint > (startPoint + 5)
      ) {
        message.reply('Invalid chapter range. Please provide valid starting and ending chapter numbers where the ending chapter is within 5 chapters of the starting chapter.');
        return;
      }

      try {
        if (global.tmp.manga.has(event.from.id)) return await message.reply("You Already have manga actively downloading")
        const downloadingMessage = await message.reply('Downloading, please wait...');
        global.tmp.manga.add(event.from.id)
        const { fileName, folderName } = await scrapeChapterUrl(url);
        const chapterUrls = getChapterUrls(startPoint, endPoint, fileName);

        await processAllChapters({ chapterUrls, url, event, api, message, downloadingMessage, endPoint, folderName });
      } catch (error) {
        console.error('Error:', error);
        message.reply(error.message);
      } finally {
        if (global.tmp.manga.has(event.from.id)) {
          global.tmp.manga.delete(event.from.id);
        }
      }
    } else if (typeSite === "nato") {
      let natoQuery = args[0] ? args.join(' ') : ["latestNato", "hottestNato"][Math.floor(Math.random() * 2)];

      switch (natoQuery) {
        case 'latestNato': {
          const response = await fetchLatestUpdates();
          if (response.length === 0) return message.reply("No Manga Found");

          const inline_data = response.slice(0, maxNato).map(c => ({
            text: c.name,
            callback_data: c.link
          }));
          const covers = response.slice(0, maxNato).map(item => ({
            type: "photo",
            media: item.cover,
            caption: item.name
          }));

          await api.sendMediaGroup(event.chat.id, covers, {
            disable_notification: true,
            reply_to_message_id: event.message_id
          });
          sentNato = await message.reply(`Found ${covers.length} results. Choose what you'd like to view`, {
            allow_sending_without_reply: true,
            disable_notification: false,
            reply_markup: { inline_keyboard: [inline_data] }
          });
          break;
        }
        case 'hottestNato': {
          const response = await fetchHottestMangas();
          if (response.length === 0) return message.reply("No Manga Found");

          const inline_data = response.slice(0, maxNato).map(c => ({
            text: c.name,
            callback_data: c.link
          }));
          const covers = response.slice(0, maxNato).map(item => ({
            type: "photo",
            media: item.cover,
            caption: item.name
          }));

          await api.sendMediaGroup(event.chat.id, covers, {
            disable_notification: true,
            reply_to_message_id: event.message_id
          });
          sentNato = await message.reply(`Found ${covers.length} results. Choose what you'd like to view`, {
            allow_sending_without_reply: true,
            disable_notification: false,
            reply_markup: { inline_keyboard: [inline_data] }
          });
          break;
        }
        default: {
          const response = await searchNato(natoQuery);
          if (response.length === 0) return message.reply("No Manga Found");

          const inline_data = response.slice(0, maxNato).map(c => ({
            text: c.name,
            callback_data: c.link
          }));
          const covers = response.slice(0, maxNato).map(item => ({
            type: "photo",
            media: item.cover,
            caption: item.name
          }));

          await api.sendMediaGroup(event.chat.id, covers, {
            disable_notification: true,
            reply_to_message_id: event.message_id
          });
          sentNato = await message.reply(`Found ${covers.length} results. Choose what you'd like to view`, {
            allow_sending_without_reply: true,
            disable_notification: false,
            reply_markup: { inline_keyboard: [inline_data] }
          });
          break;
        }
      };
      if (sentNato?.message_id) {
        return global.bot.callback_query.set(sentNato.message_id, {
          cmd,
          author: event.from.id,
          typeSite: "nato",
          messageID: sentNato.message_id
        });
      }
    } else return message.Syntax(cmd, "Invalid Extension")
  },
  callback_query: async function({ event, ctx, api, message, Context }) {
    const isAuthor = Context.author == ctx.from.id;
    try {
      if (Context.type === "changeButton") {
        if (!isAuthor) return await api.answerCallbackQuery(ctx.id, { text: "Unauthorized" })
        global.usersData.update(ctx.from.id, {
          mangaPrefered: ctx.data
        })
        delete global.bot.callback_query[Context.mid]
        return await message.edit(`Active Extension: ${ctx.data === "pill" ? "MangaPill" : ctx.data === "nato" ? "MangaNato" : "N/A"}`, ctx.message.message_id, ctx.message.chat.id, {
          reply_markup: {
            inline_keyboard: [[{
              text: ctx.data === "pill" ? "⚬ MangaPill ⚬" : "MangaPill",
              callback_data: "pill"
        }], [{
              text: ctx.data === "nato" ? "⚬ MangaNato ⚬" : "MangaNato",
              callback_data: "nato"
        }]]
          }
        })
      }

      if (Context.typeSite === "pill") {
        const xxx = await message.edit("Confirmed...", ctx.message.message_id, ctx.message.chat.id, {
          reply_markup: { inline_keyboard: [] }
        })
        api.answerCallbackQuery(ctx.id, { text: isAuthor ? "Wait while we fetch the chapters" : "Unauthorized" })
        if (!isAuthor) return
        try {
          await message.indicator("typing", ctx.message.chat.id)
          let response = await getMangaDetails(global.tmp.mangaID.get(ctx.data));
          if (response.chapters.length === 0)
            return await message.edit("No Manga Chapters found", ctx.message.message_id, ctx.message.chat.id);
          await message.unsend(xxx.message_id, ctx.message.chat.id)
          const mangaChapter = await api.sendMessage(ctx.message.chat.id, `Found ${response.chapters.length} Chapters. Reply with the chapters numbers you want to download (eg. '10 12' or just '10')`, { force_reply: true })
          global.bot.reply.set(mangaChapter.message_id, {
            cmd: Context.cmd,
            author: ctx.from.id,
            messageID: mangaChapter.message_id,
            mangaUri: global.tmp.mangaID.get(ctx.data),
            mangaLength: response.chapters.length,
            typeSite: Context.typeSite
          })
        } catch (error) {
          // Honestly I have no idea how to fix the page navigation part
          await message.edit(error.message, ctx.message.message_id, ctx.message.chat.id)
        }
      }
      else if (Context.typeSite === "nato") {
        if (Context.type === "download") {
          const { chapters, chapterSlice = { start: 0, end: 8 } } = Context;

          let startIndex = chapterSlice.start;
          if (["previous", "next"].includes(ctx.data)) {
            if (ctx.data === "previous") {
              startIndex = Math.max(0, chapterSlice.start - 8);
            } else if (ctx.data === "next") {
              startIndex = Math.min(chapters.length - 8, chapterSlice.start + 8);
            }

            const endIndex = Math.min(startIndex + 8, chapters.length);
            const slicedChapters = chapters.slice(startIndex, endIndex);

            if (slicedChapters.length > 0) {
              const inline_data = [
      ...slicedChapters.map(item => ([{
                  text: item.chapterName,
                  callback_data: item.chapterLink
      }])),
      [
                  { text: '←', callback_data: 'previous' },
                  { text: '→', callback_data: 'next' }
      ]
    ];

              await message.edit("Choose a Chapter", ctx.message.message_id, ctx.message.chat.id, {
                reply_markup: { inline_keyboard: inline_data }
              });
            } else {
              await message.edit("No more chapters available", ctx.message.message_id, ctx.message.chat.id);
            }
            return global.bot.callback_query.set(ctx.message.message_id, {
              cmd: this.config.name,
              author: ctx.from.id,
              typeSite: "nato",
              type: "download",
              ...Context,
              chapterSlice: { start: startIndex, end: endIndex }
            });
          } else {
            const xxx = await message.edit("Downloading", ctx.message.message_id, ctx.message.chat.id, {
              reply_markup: { inline_keyboard: [] }
            });
            const reply = await downloadChapterImages(ctx.data, path.join(__dirname, "tmp", Context.mangaName))
            const pdf = await createPdfFromImages(reply);
            const pdfFileName = path.basename(pdf);
            await message.unsend(xxx.message_id, ctx.message.chat.id);
            await message.indicator("upload_document", ctx.message.chat.id)
            await api.sendDocument(ctx.message.chat.id, pdf, {
              filename: pdfFileName,
              allow_sending_without_reply: true,
              caption: Context.mangaName
            })
            if (pdf)
              fs.unlinkSync(pdf)
            if (reply) {
              fs.rmSync(reply, { recursive: true, force: true });
            }
          }
        } else {
          const xxx = await message.edit("Confirmed...", ctx.message.message_id, ctx.message.chat.id, {
            reply_markup: { inline_keyboard: [] }
          });
          api.answerCallbackQuery(ctx.id, { text: isAuthor ? "Wait while we fetch the chapters" : "Unauthorized" });
          if (!isAuthor) return;

          await message.indicator("typing", ctx.message.chat.id);
          let response = await getMangaDetailsNATO(ctx.data);
          const inline_data = [
      ...response.chapters.slice(0, 8).map(item => ([{
              text: item.chapterName,
              callback_data: item.chapterLink
      }])),
      [
              { text: '←', callback_data: 'previous' },
              { text: '→', callback_data: 'next' }
      ]
    ];

          const choose = await message.edit("Choose a Chapter", ctx.message.message_id, ctx.message.chat.id, {
            reply_markup: { inline_keyboard: inline_data }
          });

          global.bot.callback_query.set(choose.message_id, {
            cmd: this.config.name,
            author: ctx.from.id,
            typeSite: "nato",
            type: "download",
            mangaName: response.mangaName,
            chapters: response.chapters,
            chapterSlice: { start: 0, end: 8 },
            length: response.chaptersLength,
          });
        }
      }
    } catch (error) {
      console.log(error);
      api.answerCallbackQuery(ctx.id, { text: "Ahem, Invalid Action" })
    }
  },
  reply: async function({ message, event, args, Context, api }) {
    let { author, cmd, messageID, mangaUri, mangaLength, typeSite } = Context;
    if (author != event.from.id) return;
    if (!event.text) return;
    if (typeSite === "pill") {
      const buzz = "Invalid chapter range. Please provide valid starting and ending chapter numbers where the ending chapter is within 5 chapters of the starting chapter.\n\nExample: replying with '20 21' 20 being the starting point and 21 being the ending point. Type " + Context.cmd + " for detailed explanation";

      const match = event.text.match(/(\d+)\s+(\d+)/);
      const singleNumberMatch = event.text.match(/^(\d+)$/);

      let startPoint, endPoint;

      if (match) {
        const [, start, end] = match;
        startPoint = parseInt(start);
        endPoint = parseInt(end);
      } else if (singleNumberMatch) {
        const [number] = singleNumberMatch;
        startPoint = endPoint = parseInt(number);
      } else {
        return await message.reply(buzz);
      }

      if (
        isNaN(startPoint) ||
        isNaN(endPoint) ||
        startPoint <= 0 ||
        endPoint <= 0 ||
        startPoint > endPoint ||
        endPoint > (startPoint + 5) ||
        endPoint > mangaLength
      ) {
        return await message.reply(buzz);
      }

      try {
        await message.indicator()
        let argsToSend = `${Context.mangaUri} | ${startPoint} -> ${endPoint}`;
        argsToSend = argsToSend.split(" ");
        await message.unsend(Context.messageID);
        await this.start({
          event,
          message,
          args: argsToSend,
          api,
          cmd: Context.cmd
        });
      } catch (error) {
        console.log(error);
        message.reply(error.message);
      }
    }
  }
};

async function createPdfFromImages(folderName) {
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

        if (imageExtension === '.png' || imageExtension === '.jpeg' || imageExtension === '.jpg') {
          doc.image(imagePath, 0, 0, { width: imageWidth, height: imageHeight });
        }

        doc.fontSize(10).fillColor('black').text('tg@Jsusbin', 30, 30);
      } catch (imageError) {
        continue;
      }
    }

    doc.end();
    return pdfPath;
  } catch (error) {
    throw error;
  }
}

async function scrapeChapterUrl(url) {
  try {
    const baseUrl = new URL(url).origin;
    const folderPath = path.join(__dirname, 'tmp', path.basename(url));
    const fileName = path.join(folderPath, `${path.basename(url)}.json`);

    if (fs.existsSync(fileName)) {
      return { fileName, folderName: folderPath };
    }

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const hrefArray = $('div[data-filter-list] a')
      .map((_, element) => $(element).attr('href'))
      .get()
      .filter(href => href)
      .map(href => href.startsWith('http') ? href : baseUrl + href)
      .reverse();

    const jsonContent = {
      mangaName: path.basename(url),
      baseUrl: url,
      reversedHrefValues: hrefArray,
    };

    fs.writeFileSync(fileName, JSON.stringify(jsonContent, null, 2));

    return { fileName, folderName: folderPath };
  } catch (error) {
    throw error;
  }
}

function getChapterUrls(startPoint, endPoint, urlsJson) {
  try {
    const jsonData = fs.readFileSync(urlsJson, 'utf-8');
    const mangaUrls = JSON.parse(jsonData);
    const matchingUrls = mangaUrls.reversedHrefValues.filter((url) => {
      const match = url.match(/-([0-9]+)$/);
      if (match) {
        const chapterNumber = parseInt(match[1]);
        return chapterNumber >= startPoint && chapterNumber <= endPoint;
      }
      return false;
    });

    return matchingUrls;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}


async function scrapeImagesMangapill(url, mainLink) {
  try {
    const regex = /[^/]+$/;
    let main2Link = mainLink.match(regex);;
    main2Link = main2Link ? main2Link[0] : mainLink;
    const folderName = path.join(__dirname, "tmp", main2Link + "/") + url.split('/').filter(Boolean).pop().replace(/^(\d+-)/, '');
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const readerArea = $('.relative.bg-card.flex.justify-center.items-center');
    const imgElements = readerArea.find('img[data-src]');

    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName);
    }
    const imgSrcArray = [];
    imgElements.each((index, element) => {
      const imgSrc = $(element).attr('data-src');
      imgSrcArray.push(imgSrc);
    });

    for (let i = 0; i < imgSrcArray.length; i++) {
      const imgSrc = imgSrcArray[i];

      if (imgSrc) {
        let imgName = path.basename(imgSrc);
        imgName = imgName.split("?")[0]
        const imgPath = path.join(folderName, imgName);
        const headers = {
          'sec-ch-ua': '"Google Chrome";v="117", "Not;A=Brand";v="8", "Chromium";v="117"',
          'Referer': 'https://' + "mangapill.com",
          'DNT': '1',
          'sec-ch-ua-mobile': '?0',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
          'sec-ch-ua-platform': '"Windows"',
        };
        await axios({
          method: 'get',
          url: imgSrc,
          responseType: 'stream',
          headers: headers,
        }).then((response) => {
          response.data.pipe(fs.createWriteStream(imgPath));
        }).catch((error) => {});
      }
    }

    return folderName;

  } catch (error) {
    throw error
  }
}


async function processAllChapters({ chapterUrls, event, api, message, downloadingMessage, endPoint, url, flname }) {
  let downloaded = 0
  let folderName;
  let pdfPath;

  try {
    for (const urx of chapterUrls) {
      try {
        folderName = await scrapeImagesMangapill(urx, url);
        downloaded++
        pdfPath = await createPdfFromImages(folderName);
        const pdfFileName = path.basename(pdfPath);
        await message.edit(`Downloaded ${downloaded} chapters`, downloadingMessage.message_id, downloadingMessage.chat.id);
        await message.indicator("upload_document");
        await api.sendDocument(event.chat.id, pdfPath, {
          filename: pdfFileName,
        });
      } catch (error) {
        throw error
      } finally {
        if (pdfPath)
          fs.unlinkSync(pdfPath)
        if (folderName) {
          fs.rmSync(folderName, { recursive: true, force: true });
        }
        // use rmdirSync if you're on node < v14
      }
    }
    await global.utils.sleep(400)
    await message.edit(`Downloaded all chapters`, downloadingMessage.message_id, downloadingMessage.chat.id);
  } catch (error) {
    await message.edit(`Error Occured`, downloadingMessage.message_id, downloadingMessage.chat.id);
    throw error
  }
}

async function scrapeMangaPill(name) {
  try {
    const { data } = await axios.get('https://' + "mangapill.com" + '/search?q=' + (name.split(" ")).join("+"));
    const $ = cheerio.load(data);
    let mangaArray = [];

    $('div:has(.flex.flex-col.justify-end)').slice(2, 6).each((index, element) => {
      const name = $(element).find('.flex.flex-col.justify-end a > .mt-3.font-black.leading-tight.line-clamp-2').text().trim();
      const href = `https://${"mangapill.com"}${$(element).find('.flex.flex-col.justify-end a').attr('href')}`;
      const coverImage = $(element).find('figure img').attr('data-src');

      mangaArray.push({ name, href, coverImage });
    });

    return mangaArray
  } catch (error) {
    throw error
  }
}

async function getMangaDetails(url) {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const chapters = [];
    $('#chapters .grid a').each((index, element) => {
      const chapterName = $(element).text().trim();
      const chapterLink = 'https://' + "mangapill.com" + $(element).attr('href');
      chapters.push({ chapterName, chapterLink });
    });
    return { chapters: chapters.length > 0 ? chapters.reverse() : [] };
  } catch (error) {
    console.error('Error fetching the page:', error);
    return { chapters: [] };
  }
}


// Manganato ↓

async function fetchLatestUpdates() {
  const response = await fetch(`${MangaNato}/genre-all?type=latest`);
  const data = await response.text();
  const $ = cheerio.load(data);
  const mangas = [];
  $('.content-genres-item').each((_, element) => {
    const name = $(element).find('.genres-item-name').text().trim();
    const link = $(element).find('.genres-item-name').attr('href');
    const cover = $(element).find('.img-loading').attr('src');
    mangas.push({ name, link, cover });
  });
  return mangas;
};

async function fetchHottestMangas() {
  const response = await fetch(`${MangaNato}/genre-all?type=topview`);
  const data = await response.text();
  const $ = cheerio.load(data);
  const mangas = [];
  $('.content-genres-item').each((_, element) => {
    const name = $(element).find('.genres-item-name').text().trim();
    const link = $(element).find('.genres-item-name').attr('href');
    const cover = $(element).find('.img-loading').attr('src');
    mangas.push({ name, link, cover });
  });
  return mangas;
};

async function searchNato(query) {
  const response = await fetch(`${MangaNato}/search/story/${encodeURIComponent((query.split(' ')).join('_'))}`);
  const data = await response.text();
  const $ = cheerio.load(data);
  const mangas = [];
  $('.search-story-item').each((_, element) => {
    const name = $(element).find('.item-title').text().trim();
    const link = $(element).find('.item-title').attr('href');
    const cover = $(element).find('.img-loading').attr('src');
    mangas.push({ name, link, cover });
  });
  return mangas;
};

async function getMangaDetailsNATO(mangaLink) {
  const response = await fetch(mangaLink);
  const data = await response.text();
  const $ = cheerio.load(data);
  const mangaName = $('h1').text().trim();

  const chapters = [];
  $('.row-content-chapter li').each((_, element) => {
    const chapterName = $(element).find('a').text().trim();
    const chapterLink = $(element).find('a').attr('href');
    chapters.push({ chapterName, chapterLink });
  });

  return {
    mangaName,
    chapters: chapters.reverse(),
    chaptersLength: chapters.length
  };
}

async function downloadChapterImages(chapterLink, downloadDir) {
  const response = await fetch(chapterLink, { headers: { Referer: MangaNato } });
  const data = await response.text();
  const $ = cheerio.load(data);
  const images = [];
  $('.container-chapter-reader img').each((_, element) => {
    images.push($(element).attr('src'));
  });
  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
  }
  for (const [index, imageUrl] of images.entries()) {
    const imageResponse = await fetch(imageUrl, { headers: { Referer: MangaNato } });
    const buffer = await imageResponse.arrayBuffer();
    const filePath = path.join(downloadDir, `page-${index + 1}.jpg`);
    fs.writeFileSync(filePath, Buffer.from(buffer));
  }
  return downloadDir;
};