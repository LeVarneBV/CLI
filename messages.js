'use strict';

const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');

module.exports = {
  printMessage: printMessage,
  printErrorMessage: printErrorMessage
}

function printMessage(text) {
  process.stdout.write(text + '\n');
}

function printErrorMessage(text) {
  process.stderr.write(chalk.red(text + '\n'));
}