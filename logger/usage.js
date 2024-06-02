const kleur = require('kleur');

function logger(username, commandName, userId, type, cmd, event) {
  let log = `${kleur.bold().bgBlack().white('[')}${kleur.bold().magenta(username)}${kleur.bold().bgBlack().white(']')} ` +
    `${kleur.bold().bgBlack().white('[')}${type ? kleur.cyan(commandName) : kleur.yellow(commandName)}${kleur.bold().bgBlack().white(']')} ` +
    `${kleur.bold().bgBlack().white('[')}${kleur.grey(userId)}${kleur.bold().bgBlack().white(']')}`;

  if (cmd) {
    if (event) {
      log += ` ${kleur.bold().bgBlack().white('[')}${kleur.red(cmd.toUpperCase())}${kleur.bold().bgBlack().white(']')} ${kleur.bold().bgBlack().white('(CMD)')}`;
    } else {
      log += ` ${kleur.bold().bgBlack().white('[')}${kleur.red(cmd.toUpperCase())}${kleur.bold().bgBlack().white(']')} ${kleur.bold().bgBlack().white('(Event)')}`;
    }
  }
  console.log(log);
}

module.exports = logger;