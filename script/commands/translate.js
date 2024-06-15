module.exports = {
  config: {
    name: "translate",
    aliases: ["trans"],
    description: "Translates text",
    usage: "{pn} text (or reply) | lang_code"
  },
  start: async function({ event, args, message, api, cmd }) {
    let inputText = args.length ? args.join(' ') : event?.reply_to_message?.text;
    if (!inputText) return message.Syntax(cmd);

    var text, lang;

    if (inputText.includes('|')) {
      var [text, lang] = inputText.split("|").map(x => x.trim());
    } else {
      text = inputText.trim();
      lang = "en";
    }
    message.indicator();
    try {
      let translatedText = await global.utils.translate(text, lang);
      message.reply(translatedText);
    } catch (error) {
      console.log(error)
      await message.reply("Exception Occurred");
    }
  }
};