if (!global.games) global.games = {};
if (!global.games.ttt) global.games.ttt = new Map();

const EMPTY = ' ';
const PLAYER_SYMBOLS = ['X', 'O'];
const WINNING_COMBINATIONS = [
  [[0, 0], [0, 1], [0, 2]],
  [[1, 0], [1, 1], [1, 2]],
  [[2, 0], [2, 1], [2, 2]],
  [[0, 0], [1, 0], [2, 0]],
  [[0, 1], [1, 1], [2, 1]],
  [[0, 2], [1, 2], [2, 2]],
  [[0, 0], [1, 1], [2, 2]],
  [[0, 2], [1, 1], [2, 0]]
];

const TAUNTS = [
  "Think you can outsmart me? Good luck with that!",
  "I've calculated all possible moves. You're doomed!",
  "Is that the best move you've got? Disappointing.",
  "I almost feel bad for how easily I'm going to win.",
  "Your strategy is as transparent as glass. Try harder!",
  "I'm not just a bot, I'm your worst nightmare in this game!",
  "You're playing checkers while I'm playing 4D chess.",
  "I hope you're ready to lose spectacularly!",
  "Interesting...",
  "I'm giving you a chance. Don't waste it!"
];

module.exports = {
  config: {
    name: "tictactoe",
    aliases: ["ttt"],
    description: "Advanced Game of Tic-Tac-Toe",
    usage: "{pn} - Starts the game\n{pn} forfeit - Ends the game",
    category: "miscellaneous"
    // I know it should be games
  },
  start: async function({ event, message, api, cmd, args }) {
    const userId = event.from.id;
    const chatId = event.chat.id;
    const gameKey = `${userId}-${chatId}`;

    if (args[0] && ["forfeit", "cancel"].includes(args[0])) {
      if (global.games.ttt.has(gameKey)) {
        global.games.ttt.delete(gameKey);
        return message.reply("Game forfeited. Scared of losing?");
      } else {
        return message.reply("No game to forfeit. Are you hallucinating?");
      }
    }

    if (global.games.ttt.has(gameKey)) {
      return message.reply(`Already in a game. Finish it or forfeit, if you dare.`);
    }
    await message.indicator()
    const playerSymbol = PLAYER_SYMBOLS[Math.floor(Math.random() * 2)];
    const botSymbol = playerSymbol === 'X' ? 'O' : 'X';
    const botStarts = Math.random() < 0.5;

    const gameState = {
      board: createEmptyBoard(),
      playerSymbol,
      botSymbol,
      currentTurn: botStarts ? botSymbol : playerSymbol
    };

    global.games.ttt.set(gameKey, gameState);

    let initialMessage = botStarts ?
      "I'll start this game. Prepare to lose!" :
      "Your turn first. Don't mess it up!";

    initialMessage += `\nYou are *${playerSymbol}*, I am *${botSymbol}*`;

    const initiate = await api.sendMessage(chatId, initialMessage, {
      reply_markup: generateKeyboard(gameState.board),
      parse_mode: "Markdown"
    });

    global.bot.callback_query.set(initiate.message_id, {
      cmd,
      author: userId,
      messageID: initiate.message_id,
      gameKey
    });

    if (botStarts) {
      await botMove(api, chatId, initiate.message_id, gameState, gameKey);
    }
  },
  callback_query: async function({ event, message, api, ctx, Context }) {
    const isAuthor = Context.author === ctx.from.id;
    if (!isAuthor) {
      await api.answerCallbackQuery(ctx.id, { text: "This isn't your game. Start your own if you dare!" });
      return;
    }

    const { data } = ctx;
    const { chat: { id: chatId } } = ctx.message;
    const userId = Context.author;
    const gameKey = `${userId}-${chatId}`;
    const gameState = global.games.ttt.get(gameKey);

    if (!gameState)
      return await api.answerCallbackQuery(ctx.id, { text: "Womp Womp" });

    if (gameState.currentTurn !== gameState.playerSymbol) {
      await api.answerCallbackQuery(ctx.id, { text: "Not your turn. Patience is a virtue!" });
      return;
    }

    if (data.startsWith('move_')) {
      const [, row, col] = data.split('_').map(Number);
      if (gameState.board[row][col] === EMPTY) {
        gameState.board[row][col] = gameState.playerSymbol;
        gameState.currentTurn = gameState.botSymbol;

        let winner = checkWinner(gameState.board);
        if (winner || isBoardFull(gameState.board)) {
          await handleGameEnd(api, chatId, ctx.message.message_id, gameState, winner, Context.gameKey);
          global.games.ttt.delete(gameKey);
          return;
        }

        await botMove(api, chatId, ctx.message.message_id, gameState, Context.gameKey);
      } else {
        await api.answerCallbackQuery(ctx.id, { text: "That spot is taken. Are your eyes working?" });
      }
    }
  }
};

function createEmptyBoard() {
  return Array(3).fill().map(() => Array(3).fill(EMPTY));
}

function checkWinner(board) {
  for (let line of WINNING_COMBINATIONS) {
    const [a, b, c] = line;
    if (board[a[0]][a[1]] !== EMPTY &&
      board[a[0]][a[1]] === board[b[0]][b[1]] &&
      board[a[0]][a[1]] === board[c[0]][c[1]]) {
      return board[a[0]][a[1]];
    }
  }
  return null;
}

function isBoardFull(board) {
  return board.every(row => row.every(cell => cell !== EMPTY));
}

function getAvailableMoves(board) {
  let moves = [];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i][j] === EMPTY) {
        moves.push([i, j]);
      }
    }
  }
  return moves;
}

function minimax(board, depth, isMaximizing, botSymbol, playerSymbol) {
  let winner = checkWinner(board);
  if (winner === botSymbol) return 10 - depth;
  if (winner === playerSymbol) return depth - 10;
  if (isBoardFull(board)) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let [i, j] of getAvailableMoves(board)) {
      board[i][j] = botSymbol;
      let score = minimax(board, depth + 1, false, botSymbol, playerSymbol);
      board[i][j] = EMPTY;
      bestScore = Math.max(score, bestScore);
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let [i, j] of getAvailableMoves(board)) {
      board[i][j] = playerSymbol;
      let score = minimax(board, depth + 1, true, botSymbol, playerSymbol);
      board[i][j] = EMPTY;
      bestScore = Math.min(score, bestScore);
    }
    return bestScore;
  }
}

async function botMove(api, chatId, messageId, gameState, userID) {
  let bestScore = -Infinity;
  let move;
  for (let [i, j] of getAvailableMoves(gameState.board)) {
    gameState.board[i][j] = gameState.botSymbol;
    let score = minimax(gameState.board, 0, false, gameState.botSymbol, gameState.playerSymbol);
    gameState.board[i][j] = EMPTY;
    if (score > bestScore) {
      bestScore = score;
      move = [i, j];
    }
  }

  gameState.board[move[0]][move[1]] = gameState.botSymbol;
  gameState.currentTurn = gameState.playerSymbol;

  let winner = checkWinner(gameState.board);
  if (winner || isBoardFull(gameState.board)) {
    await handleGameEnd(api, chatId, messageId, gameState, winner, userID);
    global.games.ttt.delete(`${chatId}`);
  } else {
    let taunt = TAUNTS[Math.floor(Math.random() * TAUNTS.length)];
    await api.editMessageText(taunt, {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: generateKeyboard(gameState.board)
    });
  }
}

function generateKeyboard(board) {
  return {
    inline_keyboard: board.map((row, i) =>
      row.map((cell, j) => ({
        text: cell === EMPTY ? ' ' : (cell === 'X' ? 'X' : 'O'),
        callback_data: `move_${i}_${j}`
      }))
    )
  };
}

async function handleGameEnd(api, chatId, messageId, gameState, winner, uid) {
  let message = winner ?
    (winner === gameState.botSymbol ? "I win! As expected. Want to try again and lose some more?" : "You... won? Impossible! I demand a rematch!") :
    "It's a draw. You're tougher than I thought, but still not good enough!";
  await api.editMessageText(message, {
    chat_id: chatId,
    message_id: messageId,
    reply_markup: generateKeyboard(gameState.board)
  });
  delete global.games.ttt[uid];
}