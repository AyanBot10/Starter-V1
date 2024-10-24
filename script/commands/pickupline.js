const axios = require('axios');

module.exports = {
  config: {
    name: 'pickupline',
    description: 'Get a random pickup line.',
    usage: '{pn}pickuplines',
    author: 'Ayan Alvi',
    category: 'fun'
  },
  start: async function({ event, api }) { const chatId = event.chat.id;
    try {
      const response = await axios.get('https://api.popcat.xyz/pickuplines');
      const data = response.data;
      const pickupLine = data.pickupline;

      // Send the pickup line to the chat
      api.sendMessage(chatId, pickupLine);
    } catch (error) {
      console.error('Error fetching pickup line:', error);
      api.sendMessage(
        chatId,
        'An error occurred while fetching the pickup line. Please try again later.'
      );
    }
  }
};