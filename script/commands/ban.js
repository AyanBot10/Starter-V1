module.exports = {
  config: {
    name: "ban",
    description: "Ban Panel",
    usage: "{pn} ban uid [reason]\n{pn} unban uid",
    role: 1
  },
  start: async function({ event, args, api, message, cmd, usersData }) {
    try {
      if (!args[0]) return message.Syntax(cmd);
      if (!args[1] || isNaN(args[1])) return message.Syntax(cmd)
      const action = args[0].toLowerCase();
      const userId = parseInt(args[1]);

      if (!userId) return message.Syntax(cmd);

      switch (action) {
        case 'ban': {
          let reason = args.slice(2).join(' ') || null;
          if (reason.length > 55)
            reason = `${reason.substring(0, 50)}...`
          const user = await api.getChat(userId);

          const updateData = {
            isBanned: true,
            ban_message: reason
          };

          await usersData.update(userId, updateData);

          let responseText = `User @${user.username} has been banned.`;
          if (reason) responseText += `\nReason: ${reason}`;

          message.reply(responseText);
          break;
        }

        case 'unban': {
          const user = await api.getChat(userId);

          const updateData = {
            isBanned: false
          };

          await usersData.update(parseInt(userId), updateData);

          const responseText = `User @${user.username} has been unbanned.`;
          message.reply(responseText);
          break;
        }

        default: {
          return message.Syntax(cmd);
        }
      }
    } catch (error) {
      console.error(error);
      message.reply(`An error occurred: ${error.message}`);
    }
  }
}