const chalk = require('chalk');

module.exports = (data, option) => {
  
	switch (option) {
		case "warn":
				console.warn(chalk.yellow('[ WARN ] » ') + data);
			break;
        case "success":
				console.log(chalk.green('[ SUCCESS ] » ') + data);
			break;
		case "error":
			console.error(chalk.red('[ ERROR ] » ') + data);
			break;
		default:
				console.log(chalk.magenta(`${option} » `) + data);
			break;
	}
}