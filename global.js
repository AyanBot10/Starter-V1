const axios = require("axios");
const log = require("./logger/chalk.js");
const config = require("./config.json");
const config_handler = require("./config_handler.json")
const crypto = require("crypto");
const fs = require('fs');


// Configs
global.config_handler = config_handler
global.config = config;


global.tmp = {}
global.utils = {};
global.log = log;
global.bot = {};
global.bot.text = [];
global.bot.message = new Map();
global.bot.reply = new Map()
global.bot.inline_query = new Map();
global.bot.chosen_inline_result = new Map();
global.bot.callback_query = new Map();
global.bot.shipping_query = new Map();

// Cooldown
global.cooldown = new Map()


// Databases
global.mongo = {};
global.sqlite = {};

/*
Unnecessary Stuff
global.bot.edited_message = new Map()
global.bot.channel_post = [];
global.bot.edited_channel_post = [];
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
*/


// Utils
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

global.uuid = function() {
  return crypto.randomUUID();
}

global.utils.configSync = function(json) {
  let currentConfig = fs.existsSync("config_handler.json") ? JSON.parse(fs.readFileSync("config_handler.json", 'utf8')) : {};
  fs.writeFileSync("config_handler.json", JSON.stringify({ ...currentConfig, ...json }, null, 2), 'utf8');
  return true;
};


module.exports = null;