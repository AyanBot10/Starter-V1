const chalk = require('chalk');

function log(text = null, color = "white", bold = false) {
  let styledText = chalk[color](text);
  if (bold) styledText = styledText.bold;
  console.log(styledText);
  return;
}

module.exports = log