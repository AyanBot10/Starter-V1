module.exports = {
  config: {
    name: "info",
    usage: "{pn}",
    description: "Get your info like user_id and all"
  },
  start: async function({ event, message, usersData }) {
    const { from: { id, is_bot, first_name, username, language_code }, chat } = event;
    const db = await usersData.exists(id);
    const text = `Sender Information
- ID: \`${id}\`
- Is Bot: ${is_bot}
- First Name: ${first_name}
- Username: ${username}
- Language Code: ${language_code}
- In DB: ${db ? "Yes" : "No"}

Chat Information
- ID: ${chat.id}
- Type: ${chat.type}`
    message.reply(`<pre><b>${text}</b></pre>`, { parse_mode: "HTML" })
  }
}