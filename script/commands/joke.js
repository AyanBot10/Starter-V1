const axios = require('axios');

module.exports = {
  config: {
    name: 'joke',
    description: 'Get a random joke.',
    usage: '{pn}joke',
    author: 'Ayan Alvi',
    category: 'fun'
  },
  start: async function({ event, api }) { const chatId = event.chat.id;
    const apiUrl = 'https://api.popcat.xyz/joke';

    try {
      // Fetch a random joke from the API
      const response = await axios.get(apiUrl);
      const joke = response.data.joke;

      // Send the joke to the chat
      api.sendMessage(chatId, joke);
    } catch (error) {
      console.error('Error fetching joke:', error);
      api.sendMessage(
        chatId,
        'An error occurred while fetching the joke. Please try again later.'
      );
    }
  }
};