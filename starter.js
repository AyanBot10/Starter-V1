const log = require("./logger/chalk.js");
const config = require("./config.json");
const config_handler = require("./config_handler.json");
const axios = require("axios");
const utils = require("./utils");


// Command dependencies
global.tmp.manga = new Set();
global.tmp.spotify = new Set();


// Configs
global.config_handler = config_handler
global.config = config;

// Event Dependencies
global.pending

// Prefix
global.prefix = {};

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
global.sqlite = {}

// Miscellaneous;
global.react_emojis = axios.get("https://gist.githubusercontent.com/SatoX69/247e9d735a145fc059715a92ccd7b0f6/raw/4d1287c6750d84e55ece9e405ddc988643baf2b9/allowed_emojis.json").then(response => {
  global.react_emojis = response.data.emojis
}).catch(err => {
  global.log("Failed to set global EMOJI", "red")
  global.react_emojis = []
});

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

// Utils
global.log("Loading Utils", "blue")
for (let util of Object.keys(utils)) {
  try {
    global.utils[util] = utils[util]
  } catch (err) {
    global.log(`Error while loading util ${util} : ${err.message}`)
  }
}
global.log("Successfully Loaded Utils")