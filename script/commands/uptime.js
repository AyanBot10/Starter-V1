const os = require("os");

module.exports = {
  config: {
    name: "uptime",
    aliases: ["upt"],
    description: "Fetches Bot's uptime info",
    usage: "{pn}"
  },
  start: async function({ api, message, event }) {
    try {
      const uptime_second = os.uptime();
      const days = Math.floor(uptime_second / 86400);
      const hours = Math.floor((uptime_second % 86400) / 3600);
      const minutes = Math.floor((uptime_second % 3600) / 60);
      const seconds = Math.floor(uptime_second % 60);

      const uptimeString = `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;

      const ping_start = Date.now();
      const testMsg = await message.reply(`Testing Uptime`);
      const ping_end = Date.now();
      const ping = Math.floor((ping_end - ping_start));
      const total_ram = os.totalmem() / (1024 ** 2);
      const free_ram = os.freemem() / (1024 ** 2);
      const ram_usage = total_ram - free_ram;
      let infoText = `• uptime: ${uptimeString}\n\n• ping: ${ping - 179}ms\n\n• memory usage: ${ram_usage.toFixed(2)} MB`;
      infoText = `<pre><b>${infoText}</b></pre>`
      message.edit(infoText, testMsg.message_id, { parse_mode: "HTML" });
    } catch (error) {
      console.error(error);
      message.reply(error.message);
    }
  },
};