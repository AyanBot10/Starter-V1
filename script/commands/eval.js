module.exports = {
  config: {
    name: "eval",
    description: {
      short: "Evaluate Code",
      long: "Evaluate Code"
    }
  },

  start: async function({ api, event, args }) {
    const admin = process.env["admin"] || global.bot.config.admins;
    if (!admin) return await api.sendMessage(event.chat.id, "Unauthorized...");
    async function out(...txt) {
      return await api.sendMessage(event.chat.id, JSON.stringify(txt, null, 2))
    }
    if (event.from.id.includes(admin)) {
      const snippet = `(async () => { try { ${args.join(" ")} } catch(err) { api.sendMessage(event.chat.id, err.message) } })()`;
      eval(snippet);
    } else {
      api.sendMessage(event.chat.id, "Unauthorized");
    }
  }
};