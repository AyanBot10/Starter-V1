const axios = require("axios");
const log = require("./logger/chalk.js");

global.cmds = global.cmds || new Map();
global.utils = global.utils || new Map();
global.log = global.log || log;
global.bot = {};

global.bot.callback = new Map()


global.utils.getStream = async function(link) {
  try {
    const response = await axios.get(link, { responseType: 'stream' });
    if (response.status === 200) {
      return response.data;
    } else {
      throw { status: response.status }
    }
  } catch (err) {
    return `Response returned status ${err?.status}`;
  }
};

module.exports = null;