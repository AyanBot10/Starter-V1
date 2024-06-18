const sendWelcomeMessage = async (chatId, members, api) => {
  const gifUrl = '';
  const welcomeMessage = `\nWelcome ${members}\nWe're glad to have ${members.includes(', ') ? "Y'all" : "You"} here!`;

  try {
    if (gifUrl) {
      await api.sendAnimation(chatId, gifUrl);
    }
    await api.sendMessage(chatId, welcomeMessage);
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  config: { name: "new_chat_members" },
  start: async function({ event, api, message }) {
    const chatId = event.chat.id;
    const botUsername = await api.getMe().then(botInfo => botInfo.username);
    const newMembers = event.new_chat_members;
    const botAdded = newMembers.some(member => member.username === botUsername);

    if (botAdded) {
      const message = "Hey guys! [I'm Starter-V1](https://github.com/SatoX69/Starter-V1)\nThanks for adding me";
      await api.sendMessage(chatId, message, { parse_mode: "Markdown" });
    } else {
      const memberUsernames = newMembers.map(member => member.username ? "@" + member.username : member.first_name || "User").join(', ');

      if (!global.pending[chatId]) {
        global.pending[chatId] = { members: [], timeout: null };
      }

      global.pending[chatId].members.push(memberUsernames);

      if (!global.pending[chatId].timeout) {
        global.pending[chatId].timeout = setTimeout(async () => {
          const combinedMembers = global.pending[chatId].members.join(', ');
          await sendWelcomeMessage(chatId, combinedMembers, api);

          delete global.pending[chatId];
        }, 5000);
      }
    }
  }
};