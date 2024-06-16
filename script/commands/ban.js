module.exports = {
  config: {
    name: "ban",
    description: "Ban Panel",
    usage: "{pn} ban user|channel uid [reason]\n{pn} unban user|channel uid",
    role: 1
  },
  start: async function({ event, args, api, message, cmd, usersData, threadsData }) {
    try {
      if (args.length < 3) return message.Syntax(cmd);

      const action = args[0].toLowerCase();
      const targetType = args[1].toLowerCase();
      const targetId = parseInt(args[2]);

      if (!['ban', 'unban'].includes(action) || !['user', 'channel'].includes(targetType) || isNaN(targetId)) {
        return message.Syntax(cmd);
      }

      const dataStore = targetType === 'user' ? usersData : threadsData;

      switch (action) {
        case 'ban': {
          let reason = args.slice(3).join(' ') || null;
          if (reason && reason.length > 55) reason = `${reason.substring(0, 50)}...`;

          const entity = await api.getChat(targetId);
          const updateData = {
            isBanned: true,
            ban_message: reason
          };

          await dataStore.update(targetId, updateData);

          let responseText = `${targetType.charAt(0).toUpperCase() + targetType.slice(1)} @${entity.username || entity.title} has been banned.`;
          if (reason) responseText += `\nReason: ${reason}`;

          message.reply(responseText);
          break;
        }

        case 'unban': {
          const entity = await api.getChat(targetId);

          const updateData = {
            isBanned: false
          };

          await dataStore.update(targetId, updateData);

          const responseText = `${targetType.charAt(0).toUpperCase() + targetType.slice(1)} @${entity.username || entity.title} has been unbanned.`;
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