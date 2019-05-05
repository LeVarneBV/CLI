'use strict';

const init = require('./init');

module.exports = function(command, project, options) {
  switch (command) {
    case undefined:
      printErrorMessage(`No subcommand given. See LeVarne basics --help for more information on this command`); break;
    case 'init':
      init(project, options); break;
    default:
      printErrorMessage(`${command} is not a supported subcommand for the basics command. See LeVarne basics --help for more information on this command`); break;
  }
}