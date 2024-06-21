const axios = require('axios');
const uri = global.config["DISCORD_WEBHOOK"] || ""

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

      const webhookPayload = {
        content: `${event?.from?.username ? `@${event.from.username}` : event.from.last_name ? event.from.first_name || "User" + " " + event.from.last_name : event.from.first_name} sent on TG`,
        file: fileLink
      };

      const response = await axios.post(uri, webhookPayload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.data) throw new Error(`Failed to send webhook: ${response.statusText}`);
      const uploadedImageLink = response.data.attachments[0].url;
      await message.reply(uploadedImageLink);
    } catch (error) {
      console.error("Error occurred:", error);
      message.reply(error.message);
    }
  }
};