module.exports = {
  config: {
    name: 'start',
    description: {
      short: "Initiates The Bot",
      long: this.short
    }
  },

  start: async function({ api, event }) {
    const helpButton = {
      text: '/help',
      callback_data: '/help'
    };
    const message = 'Hello, please use the button below to receive a list of all available commands.';
    const options = {
      reply_markup: {
        inline_keyboard: [[helpButton]]
      }
    };

    api.sendMessage(event.chat.id, message, options);
  }
};