const kleur = require('kleur');

function logger({ name, command, uid, type, event }) {
  const use24HourFormat = false;
  let timeZone = global.config?.timeZone;
  const now = new Date();
  const options = {
    timeZone: timeZone,
    hour12: !use24HourFormat,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };

  const formatter = new Intl.DateTimeFormat('en-US', options);
  const parts = formatter.formatToParts(now);
  const timeString = parts.filter(part => part.type === 'hour' || part.type === 'minute' || part.type === 'dayPeriod')
    .map(part => part.value).join(' ');
  const dateString = parts.filter(part => part.type === 'month' || part.type === 'day' || part.type === 'year')
    .map(part => part.value).join(' ');

  const timestamp = `${kleur.bold().bgBlack().white('[')}${kleur.green(timeString)}${kleur.bold().bgBlack().white(' : ')}${kleur.blue(dateString)}${kleur.bold().bgBlack().white(']')}`;

  let log = `${timestamp} ` +
    `${kleur.bold().bgBlack().white('[')}${kleur.bold().magenta(name)}${kleur.bold().bgBlack().white(']')} ` +
    `${kleur.bold().bgBlack().white('[')}${type ? kleur.cyan(command) : kleur.yellow(command)}${kleur.bold().bgBlack().white(']')} ` +
    `${kleur.bold().bgBlack().white('[')}${kleur.grey(uid)}${kleur.bold().bgBlack().white(']')} ` +
    `${kleur.bold().bgBlack().white('[')}${kleur.red(event.toUpperCase())}${kleur.bold().bgBlack().white(']')}`;

  // Console
  console.log(log);

  if (global.config.server["save_logs_in_server"]) {
    const logEntry = {
      timestamp: now.getTime(),
      readable_time: timeString,
      readable_date: dateString,
      event,
      author: name,
      id: uid,
      command,
      event_in: type
    };

    if (global.server.logs) {
      if (global.server.logs.length > 25) {
        global.server.logs = global.server.logs.slice(20);
      }
      global.server.logs.push(logEntry);
    }
  }
}

module.exports = logger;