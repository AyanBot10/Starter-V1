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

  start: async function({ api, event, args }) {
    try {
      if (!process.env['ADMIN']) {
        return api.sendMessage(event.chat.id, "Invalid Config");
      }

      if (!args[0]) return;

      function output(msg) {
        if (typeof msg == "number" || typeof msg == "boolean" || typeof msg == "function")
          msg = msg.toString();
        else if (msg instanceof Map) {
          let text = `Map(${msg.size}) `;
          text += JSON.stringify(mapToObj(msg), null, 2);
          msg = text;
        }
        else if (typeof msg == "object")
          msg = JSON.stringify(msg, null, 2);
        else if (typeof msg == "undefined")
          msg = "undefined";
        return api.sendMessage(event.chat.id, msg);
      }

      function mapToObj(map) {
        const obj = {};
        map.forEach(function(v, k) {
          obj[k] = v;
        });
        return obj;
      }
      const admin = process.env['ADMIN']

      function out(txt) {
        output(txt)
      }

      if (admin == event.from.id) {
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