const axios = require('axios');
const cheerio = require('cheerio');

const ANIME_FILLER_LIST_URL = 'https://www.animefillerlist.com/shows';
const FILLER_IDS = {};

async function searchFiller(query) {
  try {
    const response = await axios.get(ANIME_FILLER_LIST_URL);
    const $ = cheerio.load(response.data);
    const animeIndex = {};

    $('.Group li a').each((i, element) => {
      const href = $(element).attr('href').split('/').pop();
      const title = $(element).text().trim();
      animeIndex[title] = href;
    });

    const matchingResults = Object.keys(animeIndex).reduce((acc, title) => {
      if (title.toLowerCase().includes(query.toLowerCase())) {
        acc[title] = animeIndex[title];
      }
      return acc;
    }, {});

    return matchingResults;
  } catch (error) {
    console.error("Error fetching the anime filler list:", error);
    return {};
  }
}

async function parseFiller(fillerId) {
  const fillerUrl = `https://www.animefillerlist.com/shows/${fillerId}`;

  try {
    const response = await axios.get(fillerUrl);
    const $ = cheerio.load(response.data);
    const fillerDetails = {
      filler_id: fillerId,
      manga_canon: "",
      mixed_canon_filler: "",
      filler: "",
      anime_canon: ""
    };

    const episodeSections = $('#Condensed .Episodes');

    if (episodeSections.length > 0) {
      fillerDetails.manga_canon = $(episodeSections[0]).find('a').map((i, el) => $(el).text()).get().join(", ");
    }
    if (episodeSections.length > 1) {
      fillerDetails.mixed_canon_filler = $(episodeSections[1]).find('a').map((i, el) => $(el).text()).get().join(", ");
    }
    if (episodeSections.length > 2) {
      fillerDetails.filler = $(episodeSections[2]).find('a').map((i, el) => $(el).text()).get().join(", ");
    }
    if (episodeSections.length > 3) {
      fillerDetails.anime_canon = $(episodeSections[3]).find('a').map((i, el) => $(el).text()).get().join(", ");
    }

    return fillerDetails;
  } catch (error) {
    console.error("Error parsing filler details:", error);
    return null;
  }
}

function generateKeyboard(results, userId) {
  return {
    inline_keyboard: Object.keys(results).map((title) => {
      const fillerKey = `${title}_${userId}`;
      FILLER_IDS[fillerKey] = results[title];
      return [{ text: title, callback_data: `fill_${fillerKey}` }];
    })
  };
}

module.exports = {
  config: {
    name: "filler",
    aliases: ["fillers"],
    description: "Search and display filler episodes for an anime",
    category: "anime",
    credits: "David",
    usage: "{pn} anime_name"
  },
  start: async function({ api, event, args, message, cmd }) {
    const chatId = event.chat.id;
    const query = args.join(' ');

    if (!query) return message.Syntax(cmd);

    try {
      const results = await searchFiller(query);

      if (Object.keys(results).length === 0) {
        return message.reply("No fillers found for the given anime");
      }

      const opts = {
        reply_markup: generateKeyboard(results, event.from.id)
      };
      await message.indicator();
      const firstMessage = await api.sendMessage(chatId, "Pick the anime you want to see fillers list for:", opts);
      global.bot.callback_query.set(firstMessage.message_id, { cmd });
    } catch (error) {
      console.error("Error handling filler search:", error);
      message.reply("An error occurred while searching for fillers.");
    }
  },
  callback_query: async function({ event, message, api, ctx }) {
    const fillerKey = ctx.data.replace('fill_', '');
    const fillerId = FILLER_IDS[fillerKey];
    const animeName = fillerKey.split('_')[0];

    if (!fillerId) {
      return api.answerCallbackQuery(ctx.id, { text: "No data found." });
    }

    try {
      const result = await parseFiller(fillerId);

      if (!result) {
        return api.answerCallbackQuery(ctx.id, { text: "No data found." });
      }
      await message.indicator();
      let messageText = `*Fillers for anime* \`${animeName}\`\n\n`;
      messageText += `*Manga Canon episodes:*\n${result.manga_canon || 'None'}\n\n`;
      messageText += `*Mixed Canon/Filler Episodes:*\n${result.mixed_canon_filler || 'None'}\n\n`;
      messageText += `*Fillers:*\n${result.filler || 'None'}\n\n`;
      if (result.anime_canon) {
        messageText += `*Anime Canon episodes:*\n${result.anime_canon || 'None'}\n\n`;
      }

      await api.editMessageText(messageText, {
        chat_id: ctx.message.chat.id,
        message_id: ctx.message.message_id,
        parse_mode: 'Markdown'
      });
      api.answerCallbackQuery(ctx.id, { text: "Fillers list updated!" });
    } catch (error) {
      console.error("Error handling callback query:", error);
      api.answerCallbackQuery(ctx.id, { text: "An error occurred while retrieving fillers." });
    }
  }
};