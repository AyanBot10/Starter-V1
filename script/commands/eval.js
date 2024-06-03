module.exports = {
  config: {
    name: "eval",
    description: {
      short: "Evaluate Code",
      long: "Evaluate Code"
    },
    usage: "{pn} code",
    credits: "Ntkhang",
    role: 1
  },

  start: async function({ api, event, args, message }) {
    try {
      if (!args[0]) return;

      function output(msg) {
        if (typeof msg == "number" || typeof msg == "boolean" || typeof msg == "function") {
          msg = msg.toString();
        } else if (msg instanceof Map) {
          let text = `Map(${msg.size}) `;
          text += JSON.stringify(mapToObj(msg), null, 2);
          msg = text;
        } else if (typeof msg == "object") {
          msg = JSON.stringify(msg, null, 2);
        } else if (typeof msg == "undefined") {
          msg = "undefined";
        }
        return api.sendMessage(event.chat.id, msg);
      }
      const out = output

      function mapToObj(map) {
        const obj = {};
        map.forEach(function(v, k) {
          obj[k] = v;
        });
        return obj;
      }

      const code = args.join(" ");
      const snippet = `
          (async () => { 
            try { 
              ${code} 
            } catch (err) { 
              throw err; 
            } 
          })();
        `;

      try {
        await eval(snippet);
      } catch (err) {
        output(err.message || String(err));
      }
    } catch (err) {
      throw err
    }
    process.on('unhandledRejection', (reason) => {
      message.reply(`<pre><b>Unhandled Rejection: ${reason.message || String(reason)}</b></pre>`, { parse_mode: "HTML" });
    });
  }
};