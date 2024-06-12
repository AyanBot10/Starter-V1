module.exports = {
  config: {
    name: "ban",
    description: "Ban Panel",
    usage: "{pn} ban uid\n{pn} unban uid",
    role: 1
  },
  start: async function({ event, args, api, message, cmd, usersData }) {
    try {
      if (!args[0]) return message.Syntax(cmd);
      switch (args[0]) {
        case 'ban': {
          if (!args[1]) return message.Syntax(cmd);
          const username = await api.getChat(args[1])
          const form = { isBanned: true, ban_message: args[1] ? args.slice(0).join(' ') : null }
          await usersData.update(args[0], form)
          let text = `User ${args[0]} has been banned`
          if (form.ban_message)
            text += `\nWith Reason:\n${form.ban_message}`
          message.reply(tex)
          break;
        }
        case 'unban': {
          if (!args[1]) return message.Syntax(cmd);
          const username = await api.getChat(args[1])
          const form = { isBanned: false }
          await usersData.update(args[0], form)
          let text = `User ${args[0]} has been unbanned`
          if (form.ban_message)
            message.reply(tex)
          break;
        }
        default: {
          return message.Syntax(cmd);
        }
      }
    } catch (er) {
      console.log(er);
      message.reply(er)
    }
  }
}