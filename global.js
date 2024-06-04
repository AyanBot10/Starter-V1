const axios = require("axios");
const log = require("./logger/chalk.js");
const config = require("./config.json");
const path = require("path");
const crypto = require("crypto");

global.module = {}
global.module.path = path;
global.users = new Map()
global.tmp = new Map()
global.tmp_path = path.join(__dirname, "tmp");
global.cmds = new Map();
global.utils = {};
global.log = log;
global.config = config;
global.bot = {};
global.bot.text = [];
global.bot.message = new Map();
global.bot.reply = new Map()
global.bot.edited_message = new Map()
global.bot.channel_post = [];
global.bot.edited_channel_post = [];
global.bot.inline_query = new Map();
global.bot.chosen_inline_result = new Map();
global.bot.callback_query = new Map();
global.bot.shipping_query = new Map();
global.bot.pre_checkout_query = new Map();
global.bot.poll = new Map();
global.bot.poll_answer = new Map();
global.bot.chat_member = new Map();
global.bot.my_chat_member = new Map();
global.bot.chat_join_request = new Map();
global.bot.audio = new Map();
global.bot.document = new Map();
global.bot.photo = new Map();
global.bot.sticker = new Map();
global.bot.video = new Map();
global.bot.video_note = new Map();
global.bot.voice = new Map();
global.bot.contact = new Map();
global.bot.location = new Map();
global.bot.venue = new Map();
global.bot.new_chat_members = new Map();
global.bot.left_chat_member = new Map();
global.bot.new_chat_title = new Map();
global.bot.new_chat_photo = new Map();
global.bot.delete_chat_photo = new Map();
global.bot.group_chat_created = new Map();
global.bot.supergroup_chat_created = new Map();
global.bot.channel_chat_created = new Map();
global.bot.migrate_to_chat_id = new Map();
global.bot.migrate_from_chat_id = new Map();
global.bot.pinned_message = new Map();

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

global.utils.sleep = async function(ms) {
  return await new Promise(resolve => setTimeout(resolve, ms))
}

if (!global.react_emojis) {
  axios.get("https://gist.githubusercontent.com/SatoX69/247e9d735a145fc059715a92ccd7b0f6/raw/4d1287c6750d84e55ece9e405ddc988643baf2b9/allowed_emojis.json").then(response => {
    global.react_emojis = response.data.emojis
  }).catch(err => {
    global.log("Failed to set global EMOJI", "red")
    global.react_emojis = []
  })
}

global.mongo = {};
global.sqlite = {};

global.uuid = function() {
  return crypto.randomUUID();
}

module.exports = null;  
