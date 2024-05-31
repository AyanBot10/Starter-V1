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
      if (!global.config.has('admins')) {
        return api.sendMessage(event.chat.id, "Invalid Config");
      }

      const admins = global.config.get('admins');
      const admin = event.from.id;

      async function out(...txt) {
        return await api.sendMessage(event.chat.id, txt.join(' '));
      }

      if (false) { // will fix later
        const snippet = `(async () => { 
          try { 
            ${args.join(" ")} 
          } catch(err) { 
            api.sendMessage(event.chat.id, err.message); 
          } 
        })();`;

        eval(snippet);
      } else {
        api.sendMessage(event.chat.id, "Unauthorized");
      }
    } catch (err) {
      console.log(err);
      api.sendMessage(event.chat.id, err.message);
    }
  }
};