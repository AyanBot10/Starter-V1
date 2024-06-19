# Event Handler

This folder contains event commands for various types of events. The event files can handle one of these following events:

- `edited_message`
- `channel_post`
- `edited_channel_post`
- `poll`
- `poll_answer`
- `chat_member`
- `my_chat_member`
- `new_chat_members`
- `left_chat_member`
- `new_chat_title`
- `new_chat_photo`
- `delete_chat_photo`
- `group_chat_created`
- `supergroup_chat_created`
- `channel_chat_created`
- `migrate_to_chat_id`
- `migrate_from_chat_id`
- `pinned_message`

**Note:** This is different from command handlers. Event handler command names must match the event type exactly as listed above.

## Example Code
```javascript
module.exports = {
  config: "event_name",
  start: function() {}
}
```

Here, this code will only run when any event with the same type/name as `event_name` gets emitted

### Note
`message` event won't work because the handler/handler.js has other implementations for it.