const kleur = require('kleur');

function logger({ name, command, uid, type, event }) {
  let use24HourFormat = false
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const month = now.toLocaleString('default', { month: 'short' });
  const day = now.getDate();
  const year = now.getFullYear();

  if (!use24HourFormat) {
    hours = hours % 12 || 12;
  }
  const timeString = use24HourFormat ? `${hours}:${minutes}` : `${hours}:${minutes} ${ampm}`;
  const timestamp = `${kleur.bold().bgBlack().white('[')}${kleur.green(timeString)}${kleur.bold().bgBlack().white(' : ')}${kleur.blue(month + ' ' + day + ', ' + year)}${kleur.bold().bgBlack().white(']')}`;

  let log = `${timestamp} ` +
    `${kleur.bold().bgBlack().white('[')}${kleur.bold().magenta(name)}${kleur.bold().bgBlack().white(']')} ` +
    `${kleur.bold().bgBlack().white('[')}${type ? kleur.cyan(command) : kleur.yellow(command)}${kleur.bold().bgBlack().white(']')} ` +
    `${kleur.bold().bgBlack().white('[')}${kleur.grey(uid)}${kleur.bold().bgBlack().white(']')} ` +
    `${kleur.bold().bgBlack().white('[')}${kleur.red(event.toUpperCase())}${kleur.bold().bgBlack().white(']')}`;
  //Console
  console.log(log);

  if (global.config["save_logs_in_server"]) {
    const log = {
      timestamp: Date.now(),
      readable_time: timeString,
      event,
      author: name,
      id: uid,
      event_in: type
    };

    if (global.server.logs) {
      if (global.server.logs.length > 25) {
        global.server.logs = global.server.logs.slice(20);
      }
      global.server.logs.push(log);
    }
  }
}

module.exports = logger;