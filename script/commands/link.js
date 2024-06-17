module.exports = {
  config: {
    name: "link",
    usage: "{pn} <media_reply>",
    description: "Get media link"
  },
  start: async function({ event, message, cmd, api }) {
    try {
      const fileId = event?.reply_to_message?.photo?.slice(-1)[0]?.file_id || event?.reply_to_message?.video?.file_id;
      if (!fileId) {
        return message.Syntax(cmd);
      }

      const fileDetails = await api.getFile(fileId);
      if (fileDetails.file_size > 50 * 1024 * 1024) {
        return message.reply("Payload too large");
      }
      message.indicator();
      const fileLink = await api.getFileLink(fileId);
      await message.reply(fileLink);
    } catch (error) {
      console.error("Error occurred:", error);
      message.reply("Exception Occurred");
    }
  }
}