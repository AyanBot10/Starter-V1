const fetch = require('node-fetch');
const FormData = require('form-data');
const uri = global.config["DISCORD_WEBHOOK"];

module.exports = {
  config: {
    name: "link",
    usage: "{pn} <media_reply>",
    description: "Get media link",
    category: "utility"
  },
  start: async ({ event, message, cmd, api }) => {
    try {
      if (!uri) return message.reply("No Webhook Provided");

      const fileId =
        event?.reply_to_message?.photo?.slice(-1)[0]?.file_id ||
        event?.reply_to_message?.video?.file_id ||
        event?.reply_to_message?.animation?.file_id ||
        event?.reply_to_message?.voice?.file_id ||
        event?.reply_to_message?.audio?.file_id ||
        event?.reply_to_message?.document?.file_id ||
        event?.reply_to_message?.sticker?.file_id;

      if (!fileId) return message.Syntax(cmd);

      const { file_size } = await api.getFile(fileId);
      if (file_size > 50 * 1024 * 1024) return message.reply("Payload too large");

      message.indicator();
      const fileLink = await api.getFileLink(fileId);

      const form = new FormData();
      form.append('content', 'Sent from TG');
      form.append('file', fileLink);

      const response = await fetch(uri, {
        method: 'POST',
        headers: form.getHeaders(),
        body: form
      });

      if (!response.ok) throw new Error(`Failed to send webhook: ${response.statusText}`);

      const responseData = await response.json();

      if (!responseData.attachments || responseData.attachments.length === 0) {
        throw new Error('No attachments found in response');
      }

      const uploadedImageLink = responseData.attachments[0].url;
      await message.reply(uploadedImageLink);
    } catch (error) {
      console.error("Error occurred:", error);
      message.reply(error.message);
    }
  }
};