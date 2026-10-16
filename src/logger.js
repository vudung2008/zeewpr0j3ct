const chalk = require('chalk');

function getTimestamp() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  return `[${h}:${m}:${s}]`;
}

function logger(data, option = 'info') {
  const timestamp = chalk.gray(getTimestamp());
  
  switch (option) {
    case 'warn':
      console.warn(timestamp + ' ' + chalk.yellow('[ WARN ] » ') + data);
      break;
    case 'success':
      console.log(timestamp + ' ' + chalk.green('[ SUCCESS ] » ') + data);
      break;
    case 'error':
      console.error(timestamp + ' ' + chalk.red('[ ERROR ] » ') + data);
      break;
    default:
      console.log(timestamp + ' ' + chalk.magenta(`${option} » `) + data);
      break;
  }
}

module.exports = logger;
