module.exports = {
  config: {
    name: "admin",
    description: "Admin Panel",
    usage: "{pn} list - {pn} add uid - {pn} remove uid",
    role: 1
  },
  start: async function({ event, args, api, message, cmd }) {
    if (!args[0]) return message.Syntax(cmd);

    switch (args[0]) {
      case 'add': {
        if (!args[1]) return message.Syntax(cmd);
        api.getChat(args[1])
          .then(chat => {
            const username = chat.username;
            if (username) {
              if (!global.config_handler.admins.includes(args[1])) {
                global.config_handler.admins.push(args[1]);
                global.utils.configSync({ admins: global.config_handler.admins });
                message.reply(`Added @${username} (${args[1]}) as admin`);
              } else {
                message.reply("User is already an admin");
              }
            } else {
              return message.reply("Couldn't find user with such userID");
            }
          })
          .catch(err => {
            return message.reply("Error fetching user data");
          });
        break;
      }

      case 'remove':
      case 'del': {
        if (!args[1]) return message.Syntax(cmd);
        const index = global.config_handler.admins.indexOf(args[1]);
        if (index > -1) {
          global.config_handler.admins.splice(index, 1);
          global.utils.configSync({ admins: global.config_handler.admins });
          message.reply(`Removed user with ID ${args[1]} from admins`);
        } else {
          message.reply("User ID not found in admin list");
        }
        break;
      }

      case 'list': {
        if (global.config_handler.admins.length === 0) {
          return message.reply("No admins found");
        }

        const adminPromises = global.config_handler.admins.map(uid =>
          api.getChat(uid).then(chat => ({
            uid,
            username: chat.username || "Unknown"
          })).catch(() => ({
            uid,
            username: "Unknown"
          }))
        );

        Promise.all(adminPromises)
          .then(admins => {
            const adminList = admins.map(admin => `@${admin.username} (${admin.uid})`).join("\n");
            message.reply(`Current admins: ${adminList}`);
          })
          .catch(err => {
            message.reply("Error fetching admin data");
          });
        break;
      }

      default: {
        return message.Syntax(cmd);
      }
    }
  }
}