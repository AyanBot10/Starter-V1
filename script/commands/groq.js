const axios = require("axios");
const maxStorageMessage = 10

global.tmp.groq = global.tmp?.groq || {}
global.tmp.groq.history = global.tmp.groq.history || {}

const { history } = global.tmp.groq;

module.exports = {
  config: {
    name: "ai",
    usage: "Either talk in chat with groq enabled in config or do '{pn} Hello World'",
    description: "Talk to AI models from Groq"
  },

  start: async function({ api, args, message, event }) {
    if (!history[event.from.id]) {
      history[event.from.id] = [];
    }
    if (!args[0]) { return message.reply("Include a prompt.") }
    switch (args[0].toLowerCase()) {
      case 'clear': {
        history[event.from.id] = [];
        return message.reply("Our conversation has been Cleared.");
      }
      default: {
        const prompt = args.join(" ");
        try {
          history[event.from.id].push({ role: 'user', content: prompt });
          await main(history[event.from.id], message, event);
        } catch (e) {
          message.reply(e.message);
        }
      }
    }
  },

  reply: async function({ message, event, args, Context }) {
    let { author, cmd, messageID } = Context;
    if (event.from.id != author) return;
    const prompt = args.join(" ");
    history[event.from.id].push({ role: 'user', content: prompt })
    try {
      if (args[0].toLowerCase() === "clear") {
        history[event.from.id] = [];
        global.bot.reply.delete(messageID);
        return message.reply("Our conversation has been Cleared.")
      }
      global.bot.reply.delete(messageID);
      await main(history[event.from.id], message, event);
    } catch (e) {
      message.reply(e.message);
    }
  },

  chat: async function({ event, message, api, args }) {
    if (global.config.use_groq_on_chat) return
    let prompt = args?.join(" ");
    if (!prompt || prompt.length <= 4) return
    if (!history[event.from.id]) {
      history[event.from.id] = [];
      history[event.from.id].push({
        role: 'user',
        content: `My name is ${event?.from?.first_name || "Telegram User"}`
      })
    }
    try {
      history[event.from.id].push({ role: 'user', content: prompt });
      await main(history[event.from.id], message, event, true);
    } catch (e) {
      console.log(e)
    }
  }
}

async function main(history, message, event, chatType) {
  if (!global.config.groq.groq_api_key) {
    throw new Error("Get your ApiKey from console.groq.com/keys and place it in the config.json")
  }
  if (!history[event.from.id] ||
    !Array.isArray(history[event.from.id]))
    history[event.from.id] = [];

  if (history[event.from.id].length >= maxStorageMessage)
    history[event.from.id].shift()

  const requestData = {
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant"
      }
    ],
    model: "mixtral-8x7b-32768",
    temperature: 1,
    max_tokens: 1024,
    top_p: 1,
    stop: [],
    stream: false
  }

  history.forEach((data) => requestData.messages.push(data));

  const requestHeaders = {
    'Authorization': 'Bearer ' + global.config.groq.groq_api_key,
    'Content-Type': 'application/json'
  };
  try {
    message.indicator()
    const response = await axios.post("https://api.groq.com/openai/v1/chat/completions", requestData, { headers: requestHeaders });
    history[event.from.id].push({ role: 'assistant', content: response.data.choices[0].message.content })
    const reply = await message.reply(response.data.choices[0].message.content, { parse_mode: "Markdown" })
    if (chatType) return
    global.bot.reply.set(reply.message_id, {
      cmd: "ai",
      ctx: reply,
      author: event.from.id,
      messageID: reply.message_id
    })
  } catch (error) {
    throw error;
  }
}