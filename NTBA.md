### Message Sending
- `bot.sendMessage(chatId, text, [options])`: Send text messages.
- `bot.sendPhoto(chatId, photo, [options], [fileOptions])`: Send photos.
- `bot.sendAudio(chatId, audio, [options], [fileOptions])`: Send audio files.
- `bot.sendDocument(chatId, document, [options], [fileOptions])`: Send general files.
- `bot.sendVideo(chatId, video, [options], [fileOptions])`: Send video files.
- `bot.sendAnimation(chatId, animation, [options], [fileOptions])`: Send animations (GIF or H.264/MPEG-4 AVC video without sound).
- `bot.sendVoice(chatId, voice, [options], [fileOptions])`: Send voice messages.
- `bot.sendVideoNote(chatId, videoNote, [options], [fileOptions])`: Send video notes.
- `bot.sendMediaGroup(chatId, media, [options])`: Send a group of photos or videos as an album.
- `bot.sendLocation(chatId, latitude, longitude, [options])`: Send location.
- `bot.sendVenue(chatId, latitude, longitude, title, address, [options])`: Send venue information.
- `bot.sendContact(chatId, phoneNumber, firstName, [options])`: Send contact information.
- `bot.sendPoll(chatId, question, pollOptions, [options])`: Send a native poll.
- `bot.sendDice(chatId, [options])`: Send a dice with a random value.
- `bot.sendChatAction(chatId, action)`: Send chat action (typing, upload_photo, etc.).

### Message Editing
- `bot.editMessageText(text, [options])`: Edit text of a sent message.
- `bot.editMessageCaption([caption], [options])`: Edit caption of a sent message.
- `bot.editMessageMedia(media, [options])`: Edit media of a sent message.
- `bot.editMessageReplyMarkup([replyMarkup], [options])`: Edit reply markup of a sent message.

### Message Deletion
- `bot.deleteMessage(chatId, messageId, [options])`: Delete a sent message.

### Inline Mode
- `bot.answerInlineQuery(inlineQueryId, results, [options])`: Reply to an inline query.

### Callback Queries
- `bot.answerCallbackQuery(callbackQueryId, [options])`: Reply to a callback query.

### Chat and User Management
- `bot.kickChatMember(chatId, userId, [options])`: Kick a user from a group, a supergroup or a channel.
- `bot.unbanChatMember(chatId, userId, [options])`: Unban a previously kicked user.
- `bot.restrictChatMember(chatId, userId, [options])`: Restrict a user in a supergroup.
- `bot.promoteChatMember(chatId, userId, [options])`: Promote or demote a user in a supergroup or a channel.
- `bot.setChatPermissions(chatId, permissions)`: Set default chat permissions for all members.
- `bot.exportChatInviteLink(chatId)`: Export an invite link to a chat.
- `bot.createChatInviteLink(chatId, [options])`: Create an additional invite link for a chat.
- `bot.editChatInviteLink(chatId, inviteLink, [options])`: Edit a non-primary invite link.
- `bot.revokeChatInviteLink(chatId, inviteLink)`: Revoke an invite link.
- `bot.setChatPhoto(chatId, photo, [options])`: Set a new profile photo for the chat.
- `bot.deleteChatPhoto(chatId, [options])`: Delete a chat's profile photo.
- `bot.setChatTitle(chatId, title, [options])`: Change the title of a chat.
- `bot.setChatDescription(chatId, description, [options])`: Change the description of a supergroup or a channel.
- `bot.pinChatMessage(chatId, messageId, [options])`: Pin a message in a supergroup or a channel.
- `bot.unpinChatMessage(chatId, [options])`: Unpin a message in a supergroup or a channel.
- `bot.unpinAllChatMessages(chatId, [options])`: Unpin all messages in a supergroup or a channel.
- `bot.leaveChat(chatId, [options])`: Leave a group, supergroup, or channel.

### Chat Information
- `bot.getChat(chatId)`: Get information about the chat.
- `bot.getChatAdministrators(chatId)`: Get a list of administrators in a chat.
- `bot.getChatMembersCount(chatId)`: Get the number of members in a chat.
- `bot.getChatMember(chatId, userId)`: Get information about a member of a chat.

### Stickers
- `bot.sendSticker(chatId, sticker, [options], [fileOptions])`: Send stickers.
- `bot.getStickerSet(name)`: Get information about a sticker set.
- `bot.uploadStickerFile(userId, pngSticker, [options])`: Upload a .png file with a sticker for later use.
- `bot.createNewStickerSet(userId, name, title, pngSticker, emojis, [options])`: Create a new sticker set.
- `bot.addStickerToSet(userId, name, pngSticker, emojis, [options])`: Add a sticker to a set.
- `bot.setStickerPositionInSet(sticker, position, [options])`: Move a sticker in a set.
- `bot.deleteStickerFromSet(sticker, [options])`: Delete a sticker from a set.
- `bot.setStickerSetThumb(name, userId, [thumb], [options])`: Set the thumbnail of a sticker set.

### Payments
- `bot.sendInvoice(chatId, title, description, payload, providerToken, startParameter, currency, prices, [options])`: Send an invoice.
- `bot.answerShippingQuery(shippingQueryId, ok, [options])`: Reply to shipping queries.
- `bot.answerPreCheckoutQuery(preCheckoutQueryId, ok, [options])`: Reply to pre-checkout queries.

### Games
- `bot.sendGame(chatId, gameShortName, [options])`: Send a game.
- `bot.setGameScore(userId, score, [options])`: Set the score of the specified user in a game.
- `bot.getGameHighScores(userId, [options])`: Get the high scores of a game.

### Others
- `bot.getFile(fileId)`: Get basic info about a file and prepare it for downloading.
- `bot.getFileLink(fileId)`: Get the file download link.
- `bot.downloadFile(fileId, downloadDir)`: Download a file to a specific directory.
- `bot.getUserProfilePhotos(userId, [options])`: Get a list of profile pictures for a user.
- `bot.getUpdates([options])`: Get incoming updates using long polling.
- `bot.setWebhook(url, [options])`: Specify a URL and receive incoming updates via an outgoing webhook.
- `bot.deleteWebhook([options])`: Remove webhook integration if you decide to switch back to getUpdates.
- `bot.getWebhookInfo()`: Get current webhook status.
- `bot.deleteMessage(chatId, messageId, [options])`: Delete a message.