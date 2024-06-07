const axios = require('axios');
const cheerio = require('cheerio');
const FormData = require('form-data');

async function getContentLens(content) {
  const timestamp = Date.now();
  const url = `https://lens.google.com/v3/upload?hl=en&re=df&stcs=${timestamp}&vpw=1500&vph=1500`;

  const formData = new FormData();
  formData.append('encoded_image', content, { contentType: 'image/jpeg' });

  const headers = {
    Cookie: 'NID=511=eoiYVbD3qecDKQrHrtT9_jFCqvrNnL-GSi7lPJANAlHOoYlZOhFjOhPvcc-43ZSGmBx_L5D_Irknb8HJvUMo41sCh1i0homN3Taqg2z7mdjnu3AQe-PbpKAyKE4zW1-N6niKTJAMkV6Jq4AWPwp6txH_c24gjt7fU3LWAfNIezA'
  };

  const response = await axios.post(url, formData, { headers });
  return response.data;
}

function extractURL(htmlContent) {
  const items = [];

  try {
    const $ = cheerio.load(htmlContent);
    const divs = $('div.Vd9M6');

    divs.each((index, div) => {
      const actionUrl = $(div).attr('data-action-url');
      const query = new URLSearchParams(actionUrl);
      const imgUrl = decodeURIComponent(query.get('imgurl'));
      const imgRefUrl = decodeURIComponent(query.get('imgrefurl'));
      const title = $(div).find('div.UAiK1e').text().trim();

      if (imgUrl && imgRefUrl && title) {
        const host = new URL(imgRefUrl).host;
        items.push({
          title,
          thumbnail: imgUrl,
          link: imgRefUrl,
          host
        });
      }
    });
  } catch (error) {
    throw error;
  }

  return items;
}

async function discover(link) {
  if (!link) {
    throw new Error('No Link Passed');
  }

  try {
    const { data } = await axios.get(link, { responseType: 'arraybuffer' });
    const content = await getContentLens(data);

    if (content) {
      const response = extractURL(content);
      return response;
    } else {
      throw new Error('No Content Found');
    }
  } catch (error) {
    throw error;
  }
}

module.exports = {
  config: {
    name: "lens",
    aliases: ["googlelens", "vision"],
    usage: "{pn} <image_reply>",
    description: {
      short: "Google Lens",
      long: "Search for similar images via Google Lens",
    },
    cooldown: 20
  },
  start: async function({ event, api, message, cmd }) {
    try {
      const fileId = event?.reply_to_message?.photo?.slice(-1)[0]?.file_id;
      if (!fileId) return message.Syntax(cmd);
      const initiate = await message.reply("Looking up");
      const link = await api.getFileLink(fileId);
      let response = await discover(link);
      response = response.slice(0, 3);
      let thumbnails = response.map(item => ({
        type: "photo",
        media: item.thumbnail,
        caption: item.title
      }));

      let redirects = [];
      const maxButtonsPerRow = 3;
      const totalButtons = response.length;
      const numRows = Math.ceil(totalButtons / maxButtonsPerRow);

      for (let i = 0; i < numRows; i++) {
        let row = [];

        for (let j = 0; j < i; j++) {
          const item = response[j];
          row.push({ text: item.host, url: item.link });
        }

        const remainingButtons = totalButtons - row.length;
        const remainingColumns = maxButtonsPerRow - row.length;
        const buttonsToAddOnRight = Math.min(remainingColumns, remainingButtons);
        for (let j = totalButtons - 1; j >= totalButtons - buttonsToAddOnRight; j--) {
          const item = response[j];
          row.push({ text: item.host, url: item.link });
        }

        redirects.push(row);
      }

      await message.unsend(initiate.message_id);
      await api.sendMediaGroup(event.chat.id, thumbnails, { disable_notification: true, reply_to_message_id: event.message_id });
      message.send("Similar Images", { reply_markup: { inline_keyboard: redirects } });
    } catch (e) {
      console.log(e);
      message.reply(e.message);
    }
  }
};