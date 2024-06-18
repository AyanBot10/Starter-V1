const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const sharp = require('sharp');
const path = require('path');

module.exports = {
  config: {
    name: "manga",
    author: "tas33n",
    description: {
      long: "Download mangas in bulk from mangapill.com in pdf format",
      short: "Downloads Manga"
    },
    usage: "1. URL | startCh -> endCh (https://mangapill.com/MANGA_LINK | 1 -> 3)\n2. Search_query",
    cooldown: 30,
    category: "anime"
  },
  start: async function({ event, message, args, api, cmd }) {
    if (!args[0]) return message.Syntax(cmd)
    const messageText = args.join(' ');
    const match = messageText.match(/(https:\/\/mangapill\.com\/manga\/\d+\/[\w-]+) \| (\d+) -> (\d+)/);

    if (!match) {
      try {
        const searchQuery = args.join(' ');
        const searchResults = await scrapeMangaPill(searchQuery);
        if (searchResults.length === 0) {
          return message.reply("Nothing Found");
        }
        let textToSend = searchResults.map(x => `[${x.name}](${x.href})`).join('\n\n');
        textToSend += "\n\n*Copy the link and use that to initiate the bulk download*"
        await api.sendMessage(event.chat.id, textToSend, { parse_mode: "Markdown", reply_to_message_id: event.message_id });
      } catch (error) {
        console.error("Error during search or message sending:", error);
        return message.reply("An error occurred. Please try again later.");
      }
      return;
    }

    const [, url, start, end] = match;
    const startPoint = parseInt(start);
    const endPoint = parseInt(end);

    if (isNaN(startPoint) || isNaN(endPoint) || startPoint <= 0 || endPoint <= 0 || startPoint > endPoint) {
      message.reply('Invalid chapter range. Please provide valid starting and ending chapter numbers.');
      return;
    }

    try {
      const downloadingMessage = await message.reply('Downloading, please wait...');

      const urlsJson = await scrapeChapterUrl(url);

      const chapterUrls = getChapterUrls(startPoint, endPoint, urlsJson);

      const responsePDF = await processAllChapters(chapterUrls, event, api);
      await message.edit(`All chapters Downloaded successfully.`, downloadingMessage.message_id, downloadingMessage.chat.id);
      await message.indicator("upload_document");
      await api.sendDocument(event.chat.id, responsePDF.pdfPath, {
        filename: responsePDF.pdfFileName,
      });
      cleanup(responsePDF.folderName, responsePDF.pdfPath);

    } catch (error) {
      console.error('Error:', error);
      message.reply('An error occurred while processing the URL.');
    }
  },
};

const folderPath = path.join(__dirname, 'tmp');

async function scrapeImagesAsura(url) {
  try {
    const folderName = path.join(__dirname, "tmp/") + url.split('/').filter(Boolean).pop().replace(/^(\d+-)/, '');
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const readerArea = $('#readerarea');
    const imgElements = readerArea.find('img[decoding="async"][src]');

    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName);
    }

    const imgSrcArray = [];

    imgElements.each((index, element) => {
      const imgSrc = $(element).attr('src');
      imgSrcArray.push(imgSrc);
    });

    for (let i = 0; i < imgSrcArray.length; i++) {
      const imgSrc = imgSrcArray[i];
      if (imgSrc) {
        const imgName = path.basename(imgSrc);
        const imgPath = path.join(folderName, imgName);

        await axios({
          method: 'get',
          url: imgSrc,
          responseType: 'stream',
        }).then((response) => {
          response.data.pipe(fs.createWriteStream(imgPath));
        })
      }
    }

    return folderName;

  } catch (error) {
    throw error
  }
}

function getAllFilesInFolder(folderPath) {
  const allFiles = [];

  function traverseDirectory(currentPath) {
    const files = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const file of files) {
      const filePath = path.join(currentPath, file.name);
      if (file.isFile()) {
        allFiles.push(filePath);
      } else if (file.isDirectory()) {
        traverseDirectory(filePath);
      }
    }
  }

  traverseDirectory(folderPath);
  return allFiles;
}

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

        doc.fontSize(14).fillColor('black').text('tg@Jsusbin', 30, 30);
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

    const folderPath = 'chapters';
    const fileName = path.join(__dirname, "tmp", path.basename(url) + '.json');

    if (fs.existsSync(fileName))
      return fileName

    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const divWithFilterList = $('div[data-filter-list]');
    const aElements = divWithFilterList.find('a');
    const hrefArray = [];

    aElements.each((index, element) => {
      const href = $(element).attr('href');
      if (href) {
        const completeHref = href.startsWith('http') ? href : baseUrl + href;
        hrefArray.push(completeHref);
      }
    });

    const reversedArray = hrefArray.reverse();
    const jsonContent = {
      mangaName: path.basename(url),
      baseUrl: url,
      reversedHrefValues: reversedArray,
    };

    const jsonString = JSON.stringify(jsonContent, null, 2);
    fs.writeFileSync(fileName, jsonString);
    return fileName;

  } catch (error) {
    throw error
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


async function scrapeImagesMangapill(url) {
  try {
    const folderName = path.join(__dirname, "tmp/") + url.split('/').filter(Boolean).pop().replace(/^(\d+-)/, '');
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
          'Referer': 'https://www.mangapill.com/',
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


async function processAllChapters(chapterUrls) {
  try {

    for (const url of chapterUrls) {
      try {
        const folderName = await scrapeImagesMangapill(url);
        const pdfPath = await createPdfFromImages(folderName);
        const pdfFileName = path.basename(pdfPath);
        return {
          folderName,
          pdfPath,
          pdfFileName
        }
      } catch (error) {
        throw error
      }
    }
  } catch (error) {
    throw error
  }
}

async function cleanup(folderName, pdfPath) {
  try {
    fs.rmSync(folderName, { recursive: true });
    fs.unlinkSync(pdfPath);
    console.log('Cleanup completed successfully.');
  } catch (error) {
    throw error
  }
}

async function scrapeMangaPill(name) {
  try {
    const { data } = await axios.get('https://mangapill.com/search?q=' + (name.split(" ")).join("+"));
    const $ = cheerio.load(data);
    let mangaArray = [];

    $('div:has(.flex.flex-col.justify-end)').slice(2, 6).each((index, element) => {
      const name = $(element).find('.flex.flex-col.justify-end a > .mt-3.font-black.leading-tight.line-clamp-2').text().trim();
      const href = `https://mangapill.com${$(element).find('.flex.flex-col.justify-end a').attr('href')}`;
      const coverImage = $(element).find('figure img').attr('data-src');

      mangaArray.push({ name, href, coverImage });
    });

    return mangaArray
  } catch (error) {
    throw error
  }
}