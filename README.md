# Starter-V1

Starter-V1 BOT is a versatile Telegram bot project designed by me (SatoX69). Unlike a few other bot, this project does not have any obfuscation or encrypted chunks or code. This project does not use any external APIs and is fully self depended.

## Features

- **Respond to Command Initialization**: The bot listens and responds to messages starting with a slash (/) and will notify the user if it's a valid command or not.
- **Integration with no such External Services or Third-party APIs**: The Project uses First-party modules and codes to run commands hence a lower latency.
- **Database Integration**: This project has both SQLITE and MONGODB Databases. It uses them both efficiently (MongoDB part still needs some fix). Use SQLite with json structure data for convenience.

## Installation and Setup

### Prerequisites
- Bot Token
- Downloader Host [Contact me to get it](t.me/Jsusbin)

### Installation

1. **Clone the Repository**:
   ```sh
   git clone https://github.com/SatoX69/Starter-V1 Bot
   cd Bot
   ```
   
2. **Install Dependencies**:
   ```sh
    npm install 
   ```

3. **Configure the Bot**:
   - Go through both .env-example and config.json file, include your bot's token in the .env-example file then rename the file to .env
   - About the Downloader Host, after you get it from me, place it in the config.json file


### Running the Bot

  ```sh
  npm run start
  ```


## Usage

To interact with the bot, users will have to initiate a command to add themselves to the bot's database. The commands have Different features but the most prominent and used one is *start()* (Not to confuse it with */start*)

- `/start` - Greets the user
- `/help` - Displays a list of available commands and their descriptions

## Authors

• **SatoX69** (Lead Author):
[Github](https://github.com/SatoX69)
[Telegram](https://t.me/Jsusbin) -

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.


# Starter-V1 Project Is Fully Open source

### README.md template copied from [samirxpikachuio](https://github.com/samirxpikachuio)