const axios = require("axios");
const FormData = require('form-data');

module.exports = {
  config: {
    name: "ocr",
    usage: "{pn} Image_reply",
    description: {
      long: "Use Optical Character Recognition (OCR) on images to extract texts from images",
      short: "OCR"
    },
    author: "Tanvir"
  },
  start: async function({ api, message, event, cmd }) {
    const fileId = event?.reply_to_message?.photo?.slice(-1)[0]?.file_id;
    if (!fileId) return message.Syntax(cmd);
    const image_link = await api.getFileLink(fileId)
    const imageUrl = await imgur(image_link);
    try {
      message.react("👍", event.message_id);
      const text = await ocr(imageUrl);
      message.indicator();
      await global.utils.sleep(1500)
      message.reply(`✅ | Text Extracted:\n\n<pre><b>${text}</b></pre>`, { parse_mode: "HTML" });
      message.react("💯", event.message_id);
    } catch (error) {
      message.react("👎", event.message_id);
      message.reply("❌ | An error occurred while performing OCR.");
    }
  },
};

async function imgur(imageUrl) {
  try {
    const formData = new FormData();
    formData.append('new_album_id', '0');
    formData.append('resize', '-1');
    formData.append('url', imageUrl);

    const response = await axios.post('https://imgur.com/upload', formData, {
      headers: {
        ...formData.getHeaders(),
        'accept': '*/*',
        'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120"',
        'sec-ch-ua-mobile': '?1',
        'sec-ch-ua-platform': '"Android"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'cookie': 'postpagebeta=1; frontpagebetav2=1; _ga=GA1.2.132131849.1706566157; _gid=GA1.2.1526217734.1706566157; ana_client_session_id=dcebb783-5b0c-4f88-b2f7-c7e2a3ba4c50; _gat=1; m_section=hot; m_sort=time; amp_f1fc2a=Ex8WS_wf1Mvsexf7knCfL1...1hlbka23u.1hlbka35f.1.3.4; is_emerald=0; _lr_env=noEnvelope; retina=1; IMGURUIDJAFO=3bd1abf61d0d5356f807c88fb00effbfabf5750e81e9310c9f38a6e5328bb368; authautologin=b31aa684f00d3ac5e1b65c0f0886467f%7EfOB2ozZIbUv1Zbvd2O5KiATr9t6FrmDS; IMGURSESSION=7895dcc0ea4d84efd8d509c856db2d3f; accesstoken=a1e55097a2c06d3e3cc25d69adeb0284eac47b75; is_authed=1; is_just_signed_up=1; _nc=1; postpagebetalogged=1; amplitude_id_f1fc2abcb6d136bd4ef338e7fc0b9d05imgur.com=eyJkZXZpY2VJZCI6Ijk0Y2Y2Nzg4LWM1ODAtNGE3Yi1iMjg4LWNjOTRiOGU0MDE3YVIiLCJ1c2VySWQiOiIxNzgyOTIwOTYiLCJvcHRPdXQiOmZhbHNlLCJzZXNzaW9uSWQiOjE3MDY1NjYxNjYzOTMsImxhc3RFdmVudFRpbWUiOjE3MDY1NjYxOTQ5NDEsImV2ZW50SWQiOjMsImlkZW50aWZ5SWQiOjUsInNlcXVlbmNlTnVtYmVyIjo4fQ==; SESSIONDATA=%7B%22sessionCount%22%3A1%2C%22sessionTime%22%3A1706566194966%7D',
        'Referer': 'https://kuttarbaccha56.imgur.com/',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      }
    });

    const hash = response.data.data.hash;
    const ext = response.data.data.ext;
    return `https://imgur.com/${hash}${ext}`;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

async function ocr(imageUrl) {
  const vision_api = `https://vision.googleapis.com/v1/images:annotate?key=${global.config.keys.google_vision}`;

  const req_body = {
    requests: [{
      image: {
        source: {
          imageUri: imageUrl
        }
      },
      features: [{
        type: "DOCUMENT_TEXT_DETECTION"
      }]
    }]
  };

  try {
    const vision_res = await axios.post(vision_api, req_body, {
      headers: {
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Content-Type': 'application/json',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120"',
        'Sec-Ch-Ua-Mobile': '?1',
        'Sec-Ch-Ua-Platform': '"Android"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
        'X-Client-Data': 'CIP9ygE=',
        'Referer': 'https://brandfolder.com/',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      }
    });
    return vision_res.data.responses[0].textAnnotations[0].description;
  } catch (error) {
    throw new Error('Internal Server Error');
  }
}