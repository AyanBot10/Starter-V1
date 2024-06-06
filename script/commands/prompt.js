const axios = require("axios");
const FormData = require("form-data");

module.exports = {
  config: {
    name: "prompt",
    aliases: ["describe", "synthesis"],
    usage: "{pn} <image_reply>",
    description: "Image Synthesis"
  },
  start: async function({ event, message, cmd, api }) {
    const initial = await message.reply("Processing...")
    try {
      const fileId = event?.reply_to_message?.photo?.slice(-1)[0]?.file_id;
      if (!fileId) return message.Syntax(cmd);
      const stream = await axios.get(await api.getFileLink(fileId), { responseType: 'arraybuffer' })
      message.indicator()
      process(Buffer.from(stream.data)).then(x => {
        message.reply(`<pre><b>${x}</b></pre>`, { parse_mode: "HTML" })
      }).catch(e => { throw e })
    } catch (error) {
      message.reply("Exception Occurrd")
    } finally {
      if (initial?.message_id) {
        await message.unsend(initial.message_id)
      } 
    }
  }
}

async function process(imageData) {
  try {
    const api = 'https://inferenceengine.vyro.ai';
    const version = '1';
    const formData = new FormData();
    formData.append('model_version', version);
    formData.append('image', imageData, { filename: 'prompt_generator_temp.png' });
    const response = await axios.post(`${api}/interrogator`, formData, {
      headers: formData.getHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error
  }
}