const axios = require('axios');

module.exports = {
  config: {
    name: "pinterest",
    aliases: ["pin"],
    usage: "{pn} <query>",
    description: "Search for Images on Pinterest"
  },

  start: async function({ message, args, event, api }) {
    const query = args.join(" ");
    if (!query) return message.Syntax();

    try {
      message.react()
      const response = await axios.get(`https://www.pinterest.com/resource/BaseSearchResource/get/`, {
        params: {
          source_url: `/search/pins/?rs=ac&len=2&q=${encodeURIComponent(query)}`,
          data: JSON.stringify({
            options: {
              article: "",
              appliedProductFilters: "---",
              price_max: null,
              price_min: null,
              query,
              scope: "pins",
              auto_correction_disabled: "",
              top_pin_id: "",
              filters: ""
            },
            context: {}
          }),
          _: Date.now()
        },
        headers: {
          "accept": "application/json, text/javascript, */*; q=0.01",
          "accept-language": "en-US,en;q=0.9",
          "sec-ch-ua": "\"Chromium\";v=\"107\", \"Not=A?Brand\";v=\"24\"",
          "sec-ch-ua-full-version-list": "\"Chromium\";v=\"107.0.5304.74\", \"Not=A?Brand\";v=\"24.0.0.0\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-model": "\"SM-T378L\"",
          "sec-ch-ua-platform": "\"Android\"",
          "sec-ch-ua-platform-version": "\"6.0.1\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-app-version": "45d5140",
          "x-pinterest-appstate": "active",
          "x-pinterest-pws-handler": "www/search.js",
          "x-pinterest-source-url": `/search/pins/?rs=ac&len=2&q=${encodeURIComponent(query)}`,
          "x-requested-with": "XMLHttpRequest",
          "cookie": "csrftoken=981eb5b0b638b7457c523a24b3e51e8a; _auth=1; _b=\"AW5KGSto2gZI/YyBD+5cCc8BED7scfiAk77JjX82M7MvVLRr9TvqvOZUoBnUx2PSILA=\"; _pinterest_sess=TWc9PSZVTDZNQjBBTUtreFBVKzQ5TXlVR3E0ZmhXQ2VJb0lvejBaQ3lxYW1YRFd6Q0J3alVLMXhram9GNTc0bnZVL1dTUGQ2N3RtcEZROFR3cWxNOEhKdng0bHlCWXJ3MW40Uk8vY2JSbkpFbVZFdlJ6OEFPZUtMSFlsVTR4UWpmR0lLWVRVZktBU0FzcGlpb3QweTBYSWJrc3p5N2xDT3FjU2JORzJEZms2dXp5MUk0a2N2UzVnRVp6WERYY2ZqdXB5Um5iamhzUTRmRndUS1RvcU1wNTZYa3lsNUwvQkpCRVhJekdkZzJqNzBmcW93R2dhSm8rQzQ2WlllUnBqYjZZTGNQTHRIb28ra1drbjVBOU1YdVUvbmhpTXRlcWxFeFV3WElxd0R1V2VSZ0xUZy95WU43cHZoclZlQ2lFN2xaTVhoVHhSM0psTDE2QlE4dVA3UHdvREJnci9ZMU5QM29LQUk4VGhzc3pVNWpFY1ZaZm5vcUF6ckpwSnJRUUFIK0FaYTFqOW9zYXlOUUNiRHdQY3NBMVFxMFZIb0E5eTFCOStub2FmV29NRytUbUd0dDFpc1FyVkdhcWdiOVUxWWpDRFluJmxrb0pLVHFCSmpHOHJIeTNrOElkRkJrZ2I1az0=; _pinterest_referrer=https://www.google.com/; _routing_id=\"d56b788a-94c4-4ffb-abb4-be35325ae31d\"; sessionFunnelEventLogged=1",
          "Referer": "https://www.pinterest.com/",
          "Referrer-Policy": "origin"
        }
      });
      const rawData = JSON.stringify(response.data);
      const regex = /https:\/\/i\.pinimg\.com\/originals\/[0-9a-fA-F/]+\.(jpg|jpeg|png|gif)/g;
      const matches = rawData.match(regex);
      let images = [];
      if (matches && matches.length > 0) {
        message.indicator("upload_photo")
        images = matches.slice(0, random_int(4, 8));
        const media = images.map(item => ({
          type: "photo",
          media: item,
        }));
        await api.sendMediaGroup(event.chat.id, media, { disable_notification: true, reply_to_message_id: event.message_id, caption: query });
      } else {
        message.reply("❌ | No images found for the given query.");
      }
    } catch (error) {
      console.error(error);
      message.reply("❌ | Failed to retrieve images from Pinterest.");
    }
  }
};

function random_int(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}