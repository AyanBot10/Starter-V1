module.exports = {
  config: {
    name: "translate",
    aliases: ["trans"],
    description: "Translates text",
    usage: "{pn} text (or reply) | lang_code"
  },
  start: async function({ event, args, message, api, cmd }) {
    let inputText;

    if (args[0]) {
      inputText = args.join(' ');
    } else if (event?.reply_to_message?.text) {
      inputText = event.reply_to_message.text;
    } else {
      return message.Syntax(cmd);
    }

    let [text, lang = "en"] = inputText.includes('|') ?
      inputText.split("|").map(x => x.trim()) : [inputText.trim(), "en"];

    message.indicator();

    try {
      let translatedText = await global.utils.translate(text, lang);
      await message.reply(translatedText);
    } catch (error) {
      await message.reply("An error occurred while translating the text. Please try again.");
    }
  }
};