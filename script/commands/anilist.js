const axios = require("axios");
const ANILIST_API_URL = "https://graphql.anilist.co";

module.exports = {
  config: {
    name: 'anilist',
    aliases: ["tracker"],
    author: "David",
    description: {
      short: "Fetches details on anilist users",
      long: this.short
    },
    usage: "{pn} <username>",
    category: "anime"
  },

  start: async function({ api, event, args, message, cmd, usersData }) {
    const chatId = event.chat.id;
    switch (args[0]) {
      case 'set': {
        try {
          if (!args[1]) return api.sendMessage(event.chat.id, "Include Username")
          await usersData.update(event.from.id, { anilist_username: args[1] });
          api.sendMessage(event.chat.id, "Username has been saved.");
        } catch (error) {
          console.error("Error saving username:", error);
          api.sendMessage(
            event.chat.id,
            "Error saving username. Make sure the username is correct and the privacy is set to public.",
          );
        }
        return;
      }
      case 'del': {
        try {
          await usersData.removeKey(event.from.id, ["anilist_username"])
          api.sendMessage(
            chatId,
            "Your AniList username has been deleted from Database",
          );
        } catch (error) {
          console.error("Error deleting username:", error);
          api.sendMessage(
            chatId,
            "Error deleting username. Please try again.",
          );
        }
        return
      }
      case 'view': {
        if (!args[1]) return message.Syntax(cmd)
        try {
          api.sendChatAction(event.chat.id, 'upload_photo')
          const userId = await getUserId(args[1]);
          const recentActivity = await getUserRecentActivity(userId);
          const metaImageUrl = `https://img.anili.st/user/${userId}`;

          let message = `❏ Recent activity of \`${args[1]}\`:\n\n`;
          recentActivity.forEach((activity) => {
            if (activity.media) {
              const { romaji, english, native } = activity.media.title;
              const mediaTitle = english || romaji || native;
              message += `➤ ${activity.status.charAt(0).toUpperCase() + activity.status.slice(1)} ${activity.progress ? `${activity.progress}` : ""}: \`${mediaTitle}\`\n`;
            }
          });

          const response = await axios.get(metaImageUrl, { responseType: 'stream' });
          api.sendPhoto(chatId, response.data, {
            caption: message,
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                        [
                  {
                    text: "Profile",
                    url: `https://anilist.co/user/${args[1]}`,
                            },
                        ],
                    ],
            },
          });
        } catch (error) {
          console.error("Error fetching user data:", error);
          api.sendMessage(
            chatId,
            "Error fetching user data. Make sure the username is correct and the privacy is set to public.",
          );
        }
        return;
      }
      default: {
        const user = await usersData.retrieve(event.from.id);
        if (!user.anilist_username) {
          return await api.sendMessage(event.chat.id, "Couldn't Find your anilist userID, Please set your ID with `/anilist set`")
        }
        try {
          api.sendChatAction(event.chat.id, 'typing')
          const userId = await getUserId(user.anilist_username);
          const recentActivity = await getUserRecentActivity(userId);
          const stats = await getUserStats(userId);
          const metaImageUrl = `https://img.anili.st/user/${userId}`;

          let message = `❏ Recent activity of \`${user.anilist_username}\`:\n\n`;
          message += `*Anime Stats:*\n➤ Total Anime: ${stats.anime.count}\n➤ Days Watched: ${Math.round(stats.anime.minutesWatched / 60 / 24)}\n➤ Mean Score: ${stats.anime.meanScore}\n\n`;
          message += `*Manga Stats:*\n➤ Total Manga: ${stats.manga.count}\n➤ Chapters Read: ${stats.manga.chaptersRead}\n➤ Mean Score: ${stats.manga.meanScore}\n\n`;
          message += `*Recent Activities:*\n`;
          recentActivity.forEach((activity) => {
            if (activity.media) {
              const { romaji, english, native } = activity.media.title;
              const mediaTitle = english || romaji || native;
              message += `➤ ${activity.status.charAt(0).toUpperCase() + activity.status.slice(1)} ${activity.progress ? `${activity.progress}` : ""}: \`${mediaTitle}\`\n`;
            }
          });

          const response = await axios.get(metaImageUrl, { responseType: 'stream' });
          api.sendPhoto(chatId, response.data, {
            caption: message,
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                        [
                  {
                    text: "Profile",
                    url: `https://anilist.co/user/${user.anilist_username}`,
                            },
                        ],
                    ],
            },
          });
        } catch (error) {
          console.error("Error fetching user data:", error);
          api.sendMessage(
            chatId,
            "Error fetching user data. Make sure the username is correct and the privacy is set to public.",
          );
        }
        return
      }
    }
  }
}





const fetchGraphQL = async (query, variables) => {
  try {
    const response = await axios.post(
      ANILIST_API_URL,
      {
        query: query,
        variables: variables,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    );
    return response.data.data;
  } catch (error) {
    console.error("Error in GraphQL request:", error);
    throw error;
  }
};

async function getUserId(username) {
  const query = `
        query ($username: String) {
            User(name: $username) {
                id
            }
        }
    `;
  const data = await fetchGraphQL(query, { username });
  return data.User.id;
}

async function getUserRecentActivity(userId) {
  const query = `
        query ($userId: Int) {
            Page(page: 1, perPage: 10) {
                activities(userId: $userId, sort: ID_DESC) {
                    ... on ListActivity {
                        id
                        status
                        progress
                        createdAt
                        media {
                            title {
                                romaji
                                english
                                native
                            }
                        }
                    }
                }
            }
        }
    `;
  const data = await fetchGraphQL(query, { userId });
  return data.Page.activities;
}

async function getUserStats(userId) {
  const query = `
        query ($userId: Int) {
            User(id: $userId) {
                statistics {
                    anime {
                        count
                        meanScore
                        minutesWatched
                    }
                    manga {
                        count
                        meanScore
                        chaptersRead
                    }
                }
            }
        }
    `;
  const data = await fetchGraphQL(query, { userId });
  return data.User.statistics;
}