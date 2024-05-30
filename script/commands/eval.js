module.exports = {
  config: {
    name: "eval",
    description: {
      short: "Evaluate Code",
      long: "Evaluate Code"
    }
  },

  start: async function({ api, event, args }) {
    try {
      const admin = ''
      // Will add better handling later'
      async function out(...txt) {
        return await api.sendMessage(event.chat.id, txt.join(' '))
      }
      if (event.from.id == admin) {
        const snippet = `(async () => { try { ${args.join(" ")} } catch(err) { api.sendMessage(event.chat.id, err.message) } })()`;
        eval(snippet);
      } else {
        api.sendMessage(event.chat.id, "Unauthorized");
      }
    } catch (err) {
      console.log(err);
      api.sendMessage(event.chat.id, err.message)
    }
  }
};