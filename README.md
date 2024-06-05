# Starter-V1

Starter-V1 BOT is a versatile Telegram bot project designed by SatoX69. Unlike many other bots, this project has no obfuscation or encrypted code chunks. It operates independently without relying on any external APIs.

## Features

- **Respond to Command Initialization**: The bot listens and responds to messages starting with a slash (/) and notifies the user if it's a valid command.
- **No External Services or Third-party APIs**: The project uses only first-party modules, resulting in lower latency.
- **Database Integration**: The bot integrates with both SQLite and MongoDB databases, using them efficiently (though the MongoDB part still needs some fixes). SQLite is used with JSON structure data for convenience.

## Installation and Setup

### Prerequisites
- Bot Token
- Downloader Host: [Contact me to get it](https://t.me/Jsusbin)

### Installation

1. **Clone the Repository**:
   ```sh
   git clone https://github.com/SatoX69/Starter-V1-Bot
   cd Bot
   ```

2. **Install Dependencies**:
   ```sh
   npm install 
   ```

3. **Configure the Bot**:
   - Review the `.env-example` and `config.json` files. Include your bot's token in the `.env-example` file and then rename the file to `.env`.
   - After obtaining the Downloader Host from me, place it in the `config.json` file.

### Running the Bot

  ```sh
  npm run start
  ```

## Usage

To interact with the bot, users must initiate a command to add themselves to the bot's database. The bot offers various features, with the most prominent being the `start()` function (not to be confused with `/start`).

- `/start` - Greets the user.
- `/help` - Displays a list of available commands and their descriptions.

## Authors

- **SatoX69** (Lead Author):
  - [GitHub](https://github.com/SatoX69)
  - [Telegram](https://t.me/Jsusbin)

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Starter-V1 Project Is Fully Open Source