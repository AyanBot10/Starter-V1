const axios = require("axios");
const { v4: uuid } = require("uuid");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "nude",
    aliases: ["nudify"],
    usage: "{pn} image_reply",
    description: "Nudify images of people although the results would be blurred",
    cooldown: 15
  },
  start: async function({ api, message, event, cmd }) {
    const fileId = event?.reply_to_message?.photo?.slice(-1)[0]?.file_id;
    if (!fileId) return message.Syntax(cmd);
    const image_link = await api.getFileLink(fileId)
    let confirm = await message.send("Nudifying");
    try {
      const stream = await process(image_link);
      await message.indicator("upload_photo")
      message.unsend(confirm.message_id)
      await api.sendPhoto(event.chat.id, stream.data, { reply_to_message_id: event.message_id })
      fs.unlinkSync(stream.path);
    } catch (error) {
      message.edit(error.message, confirm.message_id, event.chat.id);
    }
  }
};

async function process(link) {
  try {
    const imageResponse = await axios.get(link, {
      responseType: 'arraybuffer',
    });
    const imageData = `data:image/jpeg;base64,${Buffer.from(imageResponse.data, 'binary').toString('base64')}`;
    const firstPostData = Buffer.from(imageData, 'utf-8');
    const firstPostConfig = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'https://deep-nude.co',
      },
    };

    const response = await axios.post('https://api.deep-nude.co/', firstPostData, firstPostConfig);
    const dir = path.join(__dirname, "tmp", `${uuid()}.mp4`)
    fs.writeFileSync(dir, response.data.imgData.split(',')[1], 'base64');
    const stream = fs.createReadStream(dir);
    return { data: stream, path: dir };
  } catch (error) {
    throw error;
  }
}