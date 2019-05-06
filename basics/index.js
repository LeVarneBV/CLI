'use strict';

const init = require('./init');
const { printMessage, printErrorMessage } = require('../messages');

module.exports = function(command, project, options) {
  switch (command) {
    case undefined:
      printErrorMessage(`No subcommand given. See LeVarne basics --help for more information on this command`); break;
    case '--help':
    case '-h':
      help(); break;
    case 'init':
      init(project, options); break;
    default:
      printErrorMessage(`${command} is not a supported subcommand for the basics command. See LeVarne basics --help for more information on this command`); break;
  }
}

function help() {
  const text = `Usage: le/LeVarne basics [--help] <command> [<args>]

Subcommands for the basics command:
  init <project> [version]  Downloads a project from remote basics repo into current directory. The version argument is optional and can be used to retrieve an older version of the project (e.g. Ionic 3 iso Ionic 4)`;
  printMessage(text);
}
