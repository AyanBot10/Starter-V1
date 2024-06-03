module.exports = {
  config: {
    name: "info",
    usage: "{pn}",
    description: "Get your info like user_id and all"
  },
  start: function({ event, message }) {
    const { from: { id, is_bot, first_name, username, language_code }, chat } = event;
    const text = `Sender Information
- ID: ${id}
- Is Bot: ${is_bot}
- First Name: ${first_name}
- Username: ${username}
- Language Code: ${language_code}

Chat Information
- ID: ${chat.id}
- Type: ${chat.type}`
    message.reply(`<pre><b>${text}</b></pre>`, { parse_mode: "HTML" })
  }
}