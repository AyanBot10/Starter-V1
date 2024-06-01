const kleur = require('kleur');

function logger(type, username, commandName, userId, groupId = null) {
  let log = '';
  if (type == "cmd") {
    log = `${kleur.bold().bgBlack().white('[')}${kleur.bold().magenta(username)}${kleur.bold().bgBlack().white(']')} ` +
      `${kleur.bold().bgBlack().white('[')}${kleur.yellow(commandName)}${kleur.bold().bgBlack().white(']')} ` +
      `${kleur.bold().bgBlack().white('[')}${kleur.grey(userId)}${kleur.bold().bgBlack().white(']')}`;

    if (groupId) {
      log += ` ${kleur.bold().bgBlack().white('[')}${kleur.yellow(groupId)}${kleur.bold().bgBlack().white(']')} ${kleur.bold().bgBlack().white('(Group)')}`;
    }
  }
  console.log(log);
}

module.exports = logger