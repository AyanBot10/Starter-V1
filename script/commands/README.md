# Command Handler

This directory contains command files executed in response to specific command names sent in the chat, prefixed with a `/` (e.g., `/help`).

## Command File Structure

Each command file in this directory should export an object containing `config` and `start` properties:

```javascript
module.exports = {
  config: {
    name: "do_this",
    description: "Executes a specific task",
    // description: {
    //   long: "Detailed explanation of what the command does.",
    //   short: "Brief explanation."
    // },
    usage: "{pn} other_usage_description",
    author: "SatoX69"
  },
  start: async function({ message }) {
    message.reply("Task executed!")
  }
}
```

### Config Object

- **name**: The command name that triggers execution (required).
- **description**: A brief explanation of the command's function. This can be a simple string or an object with `long` and `short` variations.
- **usage**: Instructions on how to use the command. The `{pn}` placeholder will be replaced with the command name in usage examples.
- **author**: The creator of the command (optional).

### Command Functions

- **start**: An asynchronous function that contains the main logic of the command.

### Additional Functions

- **chat**: An asynchronous function that runs on every chat event. Typically impractical for most commands.
- **reply**: An asynchronous function similar to `chat` but only triggers when a specific message is received. The target message must be defined globally.
- **callback_query**: An asynchronous function executed whenever a callback keyboard event is initiated. The corresponding `message_id` should be defined globally.
- **other_events**: Functions for other event types will only run if those events are defined globally. Check `handler/handler.js@244` for more details.

### Images

Below are illustrative images showing event handling and functional events:

![Event Handler](https://github.com/SatoX69/Starter-V1/blob/master/assets/event_handler.jpg)

![Functional Events](https://github.com/SatoX69/Starter-V1/blob/master/assets/functional_events.jpg)

Following this structure ensures each command integrates seamlessly and functions effectively within the system.

![Logo](https://github.com/SatoX69/Starter-V1/blob/master/assets/logo.jpg)