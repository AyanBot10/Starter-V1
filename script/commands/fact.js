const axios = require('axios');

module.exports = {
  config: {
    name: 'fact',
    description: 'Get a random fact',
    usage: '{pn}fact',
    author: 'Ayan Alvi',
    category: 'fun'
  },
  start: async function({ event, api }) { const chatId = event.chat.id;
    try {
      const response = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en');
      const fact = response.data.text;

      // Send the random fact to the chat
      api.sendMessage(chatId, `📚 Random Fact: \n\n${fact}`);
    } catch (error) {
      console.error('Error fetching random fact:', error);
      api.sendMessage(chatId, 'An error occurred while fetching the random fact. Please try again later.');
    }
  }
};