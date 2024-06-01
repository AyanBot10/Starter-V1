const kleur = require('kleur');

function logger(username, commandName, userId, groupId = null, type) {
  let log = `${kleur.bold().bgBlack().white('[')}${kleur.bold().magenta(username)}${kleur.bold().bgBlack().white(']')} ` +
    `${kleur.bold().bgBlack().white('[')}${type ? kleur.cyan(commandName) : kleur.yellow(commandName)}${kleur.bold().bgBlack().white(']')} ` +
    `${kleur.bold().bgBlack().white('[')}${kleur.grey(userId)}${kleur.bold().bgBlack().white(']')}`;

  if (groupId) {
    log += ` ${kleur.bold().bgBlack().white('[')}${kleur.yellow(groupId)}${kleur.bold().bgBlack().white(']')} ${kleur.bold().bgBlack().white('(Group)')}`;
  }
  console.log(log);
}

module.exports = logger;