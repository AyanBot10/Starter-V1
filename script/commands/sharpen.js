const sharp = require('sharp');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  config: {
    name: "sharpen",
    usage: "{pn} <media_reply>",
    description: "Sharpen and enhance an image using the Sharp module"
  },
  start: async function({ event, message, cmd, api }) {
    try {
      const fileId = event?.reply_to_message?.photo?.slice(-1)[0]?.file_id;
      if (!fileId) {
        return message.Syntax(cmd);
      }

      const fileDetails = await api.getFile(fileId);
      if (fileDetails.file_size > 50 * 1024 * 1024) {
        return message.reply("Payload too large");
      }

      message.react("👍", event.message_id);
      const fileLink = await api.getFileLink(fileId);
      const response = await axios.get(fileLink, { responseType: 'arraybuffer' });
      const inputBuffer = Buffer.from(response.data, 'binary');

      const metadata = await sharp(inputBuffer).metadata();
      const upscaleWidth = 3840;
      const upscaleHeight = 2160;

      const outputBuffer = await sharp(inputBuffer)
        .resize({
          width: upscaleWidth,
          height: upscaleHeight,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .sharpen(3, 0.8)
        .modulate({
          brightness: 1.05,
          saturation: 1.15
        })
        .toFormat('jpeg', { quality: 100 })
        .toBuffer();

      const tempDir = path.join(__dirname, 'tmp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }

      const tempFilePath = path.join(tempDir, `${uuidv4()}.jpg`);
      fs.writeFileSync(tempFilePath, outputBuffer);
      message.indicator('upload_photo');
      await api.sendPhoto(event.chat.id, tempFilePath);
      fs.unlinkSync(tempFilePath);
    } catch (error) {
      console.error("Error occurred:", error);
      message.reply("Exception occurred");
    }
  }
};