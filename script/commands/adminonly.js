module.exports = {
  config: {
    name: "adminonly",
    description: "Restrict access to normal users",
    usage: "{pn} [on|off] if on, you can include a message",
    role: 1
  },
  start: async function({ event, args, api, message, cmd }) {
    if (!args[0]) return message.Syntax(cmd);

    switch (args[0]) {
      case 'on': {
        let text = args.slice(1).join(' ');
        global.utils.configSync({ adminOnly: { toggle: true, toggle_message: text || false } });
        message.reply("Toggled the setting on");
        break;
      }
      case 'off': {
        global.utils.configSync({ adminOnly: { toggle: false } });
        message.reply("Toggled the setting off");
        break;
      }
      default: {
        return message.Syntax(cmd);
      }
    }
  }
}