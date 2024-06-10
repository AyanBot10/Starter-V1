# node-telegram-bot-api methods

### Message Sending

#### `bot.sendMessage(chatId, text, [options])`: Send text messages.
```javascript
{
  parse_mode, // String, Optional, Markdown or HTML
  disable_web_page_preview, // Boolean, Optional
  disable_notification, // Boolean, Optional
  reply_to_message_id, // Integer, Optional
  allow_sending_without_reply, // Boolean, Optional
  reply_markup // JSON-serialized object, Optional
}
```

#### `bot.sendPhoto(chatId, photo, [options], [fileOptions])`: Send photos.
```javascript
{
  caption, // String, Optional
  parse_mode, // String, Optional, Markdown or HTML
  disable_notification, // Boolean, Optional
  reply_to_message_id, // Integer, Optional
  allow_sending_without_reply, // Boolean, Optional
  reply_markup // JSON-serialized object, Optional
},
{
  filename, // String, Optional, If uploading from a file
  contentType // String, Optional, MIME type of the file
}
```

#### `bot.sendAudio(chatId, audio, [options], [fileOptions])`: Send audio files.
```javascript
{
  caption, // String, Optional
  parse_mode, // String, Optional, Markdown or HTML
  duration, // Integer, Optional
  performer, // String, Optional
  title, // String, Optional
  thumb, // InputFile or String, Optional
  disable_notification, // Boolean, Optional
  reply_to_message_id, // Integer, Optional
  allow_sending_without_reply, // Boolean, Optional
  reply_markup // JSON-serialized object, Optional
},
{
  filename, // String, Optional, If uploading from a file
  contentType // String, Optional, MIME type of the file
}
```

#### `bot.sendDocument(chatId, document, [options], [fileOptions])`: Send general files.
```javascript
{
  thumb, // InputFile or String, Optional
  caption, // String, Optional
  parse_mode, // String, Optional, Markdown or HTML
  disable_content_type_detection, // Boolean, Optional
  disable_notification, // Boolean, Optional
  reply_to_message_id, // Integer, Optional
  allow_sending_without_reply, // Boolean, Optional
  reply_markup // JSON-serialized object, Optional
},
{
  filename, // String, Optional, If uploading from a file
  contentType // String, Optional, MIME type of the file
}
```

#### `bot.sendVideo(chatId, video, [options], [fileOptions])`: Send video files.
```javascript
{
  duration, // Integer, Optional
  width, // Integer, Optional
  height, // Integer, Optional
  thumb, // InputFile or String, Optional
  caption, // String, Optional
  parse_mode, // String, Optional, Markdown or HTML
  supports_streaming, // Boolean, Optional
  disable_notification, // Boolean, Optional
  reply_to_message_id, // Integer, Optional
  allow_sending_without_reply, // Boolean, Optional
  reply_markup // JSON-serialized object, Optional
},
{
  filename, // String, Optional, If uploading from a file
  contentType // String, Optional, MIME type of the file
}
```

#### `bot.sendAnimation(chatId, animation, [options], [fileOptions])`: Send animations (GIF or H.264/MPEG-4 AVC video without sound).
```javascript
{
  duration, // Integer, Optional
  width, // Integer, Optional
  height, // Integer, Optional
  thumb, // InputFile or String, Optional
  caption, // String, Optional
  parse_mode, // String, Optional, Markdown or HTML
  disable_notification, // Boolean, Optional
  reply_to_message_id, // Integer, Optional
  allow_sending_without_reply, // Boolean, Optional
  reply_markup // JSON-serialized object, Optional
},
{
  filename, // String, Optional, If uploading from a file
  contentType // String, Optional, MIME type of the file
}
```

#### `bot.sendVoice(chatId, voice, [options], [fileOptions])`: Send voice messages.
```javascript
{
  caption, // String, Optional
  parse_mode, // String, Optional, Markdown or HTML
  duration, // Integer, Optional
  disable_notification, // Boolean, Optional
  reply_to_message_id, // Integer, Optional
  allow_sending_without_reply, // Boolean, Optional
  reply_markup // JSON-serialized object, Optional
},
{
  filename, // String, Optional, If uploading from a file
  contentType // String, Optional, MIME type of the file
}
```

#### `bot.sendVideoNote(chatId, videoNote, [options], [fileOptions])`: Send video notes.
```javascript
{
  duration, // Integer, Optional
  length, // Integer, Optional
  thumb, // InputFile or String, Optional
  disable_notification, // Boolean, Optional
  reply_to_message_id, // Integer, Optional
  allow_sending_without_reply, // Boolean, Optional
  reply_markup // JSON-serialized object, Optional
},
{
  filename, // String, Optional, If uploading from a file
  contentType // String, Optional, MIME type of the file
}
```

#### `bot.sendMediaGroup(chatId, media, [options])`: Send a group of photos or videos as an album.
```javascript
{
  disable_notification, // Boolean, Optional
  reply_to_message_id, // Integer, Optional
  allow_sending_without_reply // Boolean, Optional
}
```

#### `bot.sendLocation(chatId, latitude, longitude, [options])`: Send location.
```javascript
{
  horizontal_accuracy, // Float, Optional
  live_period, // Integer, Optional
  heading, // Integer, Optional
  proximity_alert_radius, // Integer, Optional
  disable_notification, // Boolean, Optional
  reply_to_message_id, // Integer, Optional
  allow_sending_without_reply, // Boolean, Optional
  reply_markup // JSON-serialized object, Optional
}
```

#### `bot.sendVenue(chatId, latitude, longitude, title, address, [options])`: Send venue information.
```javascript
{
  foursquare_id, // String, Optional
  foursquare_type, // String, Optional
  google_place_id, // String, Optional
  google_place_type, // String, Optional
  disable_notification, // Boolean, Optional
  reply_to_message_id, // Integer, Optional
  allow_sending_without_reply, // Boolean, Optional
  reply_markup // JSON-serialized object, Optional
}
```

#### `bot.sendContact(chatId, phoneNumber, firstName, [options])`: Send contact information.
```javascript
{
  last_name, // String, Optional
  vcard, // String, Optional
  disable_notification, // Boolean, Optional
  reply_to_message_id, // Integer, Optional
  allow_sending_without_reply, // Boolean, Optional
  reply_markup // JSON-serialized object, Optional
}
```

#### `bot.sendPoll(chatId, question, pollOptions, [options])`: Send a native poll.
```javascript
{
  is_anonymous, // Boolean, Optional
  type, // String, Optional, quiz or regular
  allows_multiple_answers, // Boolean, Optional
  correct_option_id, // Integer, Optional
  explanation, // String, Optional
  explanation_parse_mode, // String, Optional, Markdown or HTML
  open_period, // Integer, Optional
  close_date, // Integer, Optional
  is_closed, // Boolean, Optional
  disable_notification, // Boolean, Optional
  reply_to_message_id, // Integer, Optional
  allow_sending_without_reply, // Boolean, Optional
  reply_markup // JSON-serialized object, Optional
}
```

#### `bot.sendDice(chatId, [options])`: Send a dice with a random value.
```javascript
{
  emoji, // String, Optional
  disable_notification, // Boolean, Optional
  reply_to_message_id, // Integer, Optional
  allow_sending_without_reply, // Boolean, Optional
  reply_markup // JSON-serialized object, Optional
}
```

#### `bot.sendChatAction(chatId, action)`: Send chat action (typing, upload_photo, etc.).
```javascript
{
  action // String, Required
}
```

### Message Editing

#### `bot.editMessageText(text, [options])`: Edit text of a sent message.
```javascript
{
  chat_id, // Integer or String, Optional
  message_id, // Integer, Optional
  inline_message_id, // String, Optional
  parse_mode, // String, Optional, Markdown or HTML
  disable_web_page_preview, // Boolean, Optional
  reply_markup // JSON-serialized object, Optional
}
```

#### `bot.editMessageCaption([caption], [options])`: Edit caption of a sent message.
```javascript
{
  chat_id, // Integer or String, Optional
  message_id, // Integer, Optional
  inline_message_id, // String, Optional
  caption, // String, Optional
  parse_mode, // String, Optional, Markdown or HTML
  reply_markup // JSON-serialized object, Optional
}
```

#### `bot.editMessageMedia(media, [options])`: Edit media of a sent message.
```javascript
{
  chat_id, // Integer or String, Optional
  message_id, // Integer, Optional
  inline_message_id, // String, Optional
  media, // InputMedia, Required
  reply_markup // JSON-serialized object, Optional
}
```

#### `bot.editMessageReplyMarkup([replyMarkup], [options])`: Edit reply markup of a sent message.
```javascript
{
  chat_id, // Integer or String, Optional
  message_id, // Integer, Optional
  inline_message_id, // String, Optional
  reply_markup // JSON-serialized object, Optional
}
```

### Message Deletion

#### `bot.deleteMessage(chatId, messageId, [options])`: Delete a sent message.
```javascript
{
  chat_id, // Integer or String, Required
  message_id // Integer, Required
}
```

### Inline Mode

#### `bot.answerInlineQuery(inlineQueryId, results, [options])`: Reply to an inline query.
```javascript
{
  inline_query_id, // String, Required
  results, // Array of InlineQueryResult, Required
  cache_time, // Integer, Optional
  is_personal, // Boolean, Optional
  next_offset, // String, Optional
  switch_pm_text, // String, Optional
  switch_pm_parameter // String, Optional
}
```

### Callback Queries

#### `bot.answerCallbackQuery(callbackQueryId, [options])`: Reply to a callback query.
```javascript
{
  callback_query_id, // String, Required
  text, // String, Optional
  show_alert, // Boolean, Optional
  url, // String, Optional
  cache_time // Integer, Optional
}
```

### Chat and User Management

#### `bot.kickChatMember(chatId, userId, [options])`: Kick a user from a group, a supergroup, or a channel.
```javascript
{
  chat_id, // Integer or String, Required
  user_id, // Integer, Required
  until_date // Integer, Optional
}
```

#### `bot.unbanChatMember(chatId, userId, [options])`: Unban a previously kicked user.
```javascript
{
  chat_id, // Integer or String, Required
  user_id, // Integer, Required
  only_if_banned // Boolean, Optional
}
```

#### `bot.restrictChatMember(chatId, userId, [options])`: Restrict a user in a supergroup.
```javascript
{
  chat_id, // Integer or String, Required
  user_id, // Integer, Required
  permissions, // ChatPermissions, Required
  until_date // Integer, Optional
}
```

#### `bot.promoteChatMember(chatId, userId, [options])`: Promote or demote a user in a supergroup or a channel.
```javascript
{
  chat_id, // Integer or String, Required
  user_id, // Integer, Required
  is_anonymous, // Boolean, Optional
  can_manage_chat, // Boolean, Optional
  can_post_messages, // Boolean, Optional
  can_edit_messages, // Boolean, Optional
  can_delete_messages, // Boolean, Optional
  can_manage_video_chats, // Boolean, Optional
  can_restrict_members, // Boolean, Optional
  can_promote_members, // Boolean, Optional
  can_change_info, // Boolean, Optional
  can_invite_users, // Boolean, Optional
  can_pin_messages // Boolean, Optional
}
```

#### `bot.setChatPermissions(chatId, permissions)`: Set default chat permissions for all members.
```javascript
{
  chat_id, // Integer or String, Required
  permissions // ChatPermissions, Required
}
```

#### `bot.exportChatInviteLink(chatId)`: Export an invite link to a chat.
```javascript
{
  chat_id // Integer or String, Required
}
```

#### `bot.createChatInviteLink(chatId, [options])`: Create an additional invite link for a chat.
```javascript
{
  chat_id, // Integer or String, Required
  expire_date, // Integer, Optional
  member_limit, // Integer, Optional
  creates_join_request // Boolean, Optional
}
```

#### `bot.editChatInviteLink(chatId, inviteLink, [options])`: Edit a non-primary invite link.
```javascript
{
  chat_id, // Integer or String, Required
  invite_link, // String, Required
  expire_date, // Integer, Optional
  member_limit, // Integer, Optional
  creates_join_request // Boolean, Optional
}
```

#### `bot.revokeChatInviteLink(chatId, inviteLink)`: Revoke an invite link.
```javascript
{
  chat_id, // Integer or String, Required
  invite_link // String, Required
}
```

#### `bot.setChatPhoto(chatId, photo, [options])`: Set a new profile photo for the chat.
```javascript
{
  chat_id, // Integer or String, Required
  photo // InputFile, Required
}
```

#### `bot.deleteChatPhoto(chatId, [options])`: Delete a chat's profile photo.
```javascript
{
  chat_id // Integer or String, Required
}
```

#### `bot.setChatTitle(chatId, title, [options])`: Change the title of a chat.
```javascript
{
  chat_id, // Integer or String, Required
  title // String, Required
}
```

#### `bot.setChatDescription(chatId, description, [options])`: Change the description of a supergroup or a channel.
```javascript
{
  chat_id, // Integer or String, Required
  description // String, Optional
}
```

#### `bot.pinChatMessage(chatId, messageId, [options])`: Pin a message in a supergroup or a channel.
```javascript
{
  chat_id, // Integer or String, Required
  message_id, // Integer, Required
  disable_notification // Boolean, Optional
}
```

#### `bot.unpinChatMessage(chatId, [options])`: Unpin a message in a supergroup or a channel.
```javascript
{
  chat_id, // Integer or String, Required
  message_id // Integer, Optional
}
```

#### `bot.unpinAllChatMessages(chatId, [options])`: Unpin all messages in a supergroup or a channel.
```javascript
{
  chat_id // Integer or String, Required
}
```

#### `bot.leaveChat(chatId, [options])`: Leave a group, supergroup, or channel.
```javascript
{
  chat_id // Integer or String, Required
}
```

### Chat Information

#### `bot.getChat(chatId)`: Get information about the chat.
```javascript
{
  chat_id // Integer or String, Required
}
```

#### `bot.getChatAdministrators(chatId)`: Get a list of administrators in a chat.
```javascript
{
  chat_id // Integer or String, Required
}
```

#### `bot.getChatMembersCount(chatId)`: Get the number of members in a chat.
```javascript
{
  chat_id // Integer or String, Required
}
```

#### `bot.getChatMember(chatId, userId)`: Get information about a member of a chat.
```javascript
{
  chat_id, // Integer or String, Required
  user_id // Integer, Required
}
```

### Stickers

#### `bot.sendSticker(chatId, sticker, [options], [fileOptions])`: Send stickers.
```javascript
{
  disable_notification, // Boolean, Optional
  reply_to_message_id, // Integer, Optional
  allow_sending_without_reply, // Boolean, Optional
  reply_markup // JSON-serialized object, Optional
},
{
  filename, // String, Optional, If uploading from a file
  contentType // String, Optional, MIME type of the file
}
```

#### `bot.getStickerSet(name)`: Get information about a sticker set.
```javascript
{
  name // String, Required
}
```

#### `bot.uploadStickerFile(userId, pngSticker, [options])`: Upload a .png file with a sticker for later use.
```javascript
{
  user_id, // Integer, Required
  png_sticker, // InputFile, Required
},
{
  filename, // String, Optional, If uploading from a file
  contentType // String, Optional, MIME type of the file
}
```

#### `bot.createNewStickerSet(userId, name, title, pngSticker, emojis, [options])`: Create a new sticker set.
```javascript
{
  user_id, // Integer, Required
  name, // String, Required
  title, // String, Required
  png_sticker, // InputFile or String, Required
  emojis, // String, Required
  contains_masks, // Boolean, Optional
  mask_position // MaskPosition, Optional
},
{
  filename, // String, Optional, If uploading from a file
  contentType // String, Optional, MIME type of the file
}
```

#### `bot.addStickerToSet(userId, name, pngSticker, emojis, [options])`: Add a sticker to a set.
```javascript
{
  user_id, // Integer, Required
  name, // String, Required
  png_sticker, // InputFile or String, Required
  emojis, // String, Required
  mask_position // MaskPosition, Optional
},
{
  filename, // String, Optional, If uploading from a file
  contentType // String, Optional, MIME type of the file
}
```

#### `bot.setStickerPositionInSet(sticker, position, [options])`: Move a sticker in a set.
```javascript
{
  sticker, // String, Required
  position // Integer, Required
}
```

#### `bot.deleteStickerFromSet(sticker, [options])`: Delete a sticker from a set.
```javascript
{
  sticker // String, Required
}
```

#### `bot.setStickerSetThumb(name, userId, [thumb], [options])`: Set the thumbnail of a sticker set.
```javascript
{
  name, // String, Required
  user_id, // Integer, Required
  thumb, // InputFile or String, Optional
},
{
  filename, // String, Optional, If uploading from a file
  contentType // String, Optional, MIME type of the file
}
```

### Payments

#### `bot.sendInvoice(chatId, title, description, payload, providerToken, startParameter, currency, prices, [options])`: Send an invoice.
```javascript
{
  chat_id, // Integer or String, Required
  title, // String, Required
  description, // String, Required
  payload, // String, Required
  provider_token, // String, Required
  start_parameter, // String, Required
  currency, // String, Required
  prices, // Array of LabeledPrice, Required
  max_tip_amount, // Integer, Optional
  suggested_tip_amounts, // Array of Integer, Optional
  provider_data, // String, Optional
  photo_url, // String, Optional
  photo_size, // Integer, Optional
  photo_width, // Integer, Optional
  photo_height, // Integer, Optional
  need_name, // Boolean, Optional
  need_phone_number, // Boolean, Optional
  need_email, // Boolean, Optional
  need_shipping_address, // Boolean, Optional
  send_phone_number_to_provider, // Boolean, Optional
  send_email_to_provider, // Boolean, Optional
  is_flexible, // Boolean, Optional
  disable_notification, // Boolean, Optional
  reply_to_message_id, // Integer, Optional
  allow_sending_without_reply, // Boolean, Optional
  reply_markup // JSON-serialized object, Optional
}
```

#### `bot.answerShippingQuery(shippingQueryId, ok, [options])`: Reply to shipping queries.
```javascript
{
  shipping_query_id, // String, Required
  ok, // Boolean, Required
  shipping_options, // Array of ShippingOption, Optional
  error_message // String, Optional
}
```

#### `bot.answerPreCheckoutQuery(preCheckoutQueryId, ok, [options])`: Reply to pre-checkout queries.
```javascript
{
  pre_checkout_query_id, // String, Required
  ok, // Boolean, Required
  error_message // String, Optional
}
```

### Games

#### `bot.sendGame(chatId, gameShortName, [options])`: Send a game.
```javascript
{
  chat_id, // Integer or String, Required
  game_short_name, // String, Required
  disable_notification, // Boolean, Optional
  reply_to_message_id, // Integer, Optional
  allow_sending_without_reply, // Boolean, Optional
  reply_markup // JSON-serialized object, Optional
}
```

#### `bot.setGameScore(userId, score, [options])`: Set the score of the specified user in a game.
```javascript
{
  user_id, // Integer, Required
  score, // Integer, Required
  force, // Boolean, Optional
  disable_edit_message, // Boolean, Optional
  chat_id, // Integer or String, Optional
  message_id, // Integer, Optional
  inline_message_id // String, Optional
}
```

#### `bot.getGameHighScores(userId, [options])`: Get the high scores of a game.
```javascript
{
  user_id, // Integer, Required
  chat_id, // Integer or String, Optional
  message_id, // Integer, Optional
  inline_message_id // String, Optional
}
```

### Others

#### `bot.getFile(fileId)`: Get basic info about a file and prepare it for downloading.
```javascript
{
  file_id // String, Required
}
```

#### `bot.getFileLink(fileId)`: Get the file download link.
```javascript
{
  file_id // String, Required
}
```

#### `bot.downloadFile(fileId, downloadDir)`: Download a file to a specific directory.
```javascript
{
  file_id, // String, Required
  download_dir // String, Required
}
```

#### `bot.getUserProfilePhotos(userId, [options])`: Get a list of profile pictures for a user.
```javascript
{
  user_id, // Integer, Required
  offset, // Integer, Optional
  limit // Integer, Optional
}
```

#### `bot.getUpdates([options])`: Get incoming updates using long polling.
```javascript
{
  offset, // Integer, Optional
  limit, // Integer, Optional
  timeout, // Integer, Optional
  allowed_updates // Array of String, Optional
}
```

#### `bot.setWebhook(url, [options])`: Specify a URL and receive incoming updates via an outgoing webhook.
```javascript
{
  url, // String, Required
  certificate, // InputFile, Optional
  ip_address, // String, Optional
  max_connections, // Integer, Optional
  allowed_updates, // Array of String, Optional
  drop_pending_updates, // Boolean, Optional
  secret_token // String, Optional
},
{
  filename, // String, Optional, If uploading from a file
  contentType // String, Optional, MIME type of the file
}
```

#### `bot.deleteWebhook([options])`: Remove webhook integration if you decide to switch back to getUpdates.
```javascript
{
  drop_pending_updates // Boolean, Optional
}
```

#### `bot.getWebhookInfo()`: Get current webhook status.
```javascript
{
}
```

#### `bot.deleteMessage(chatId, messageId, [options])`: Delete a message.
```javascript
{
  chat_id, // Integer or String, Required
  message_id // Integer, Required
}
```

### Briefed by GPT-4o