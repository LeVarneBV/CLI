#!/usr/bin/env node
'use strict';

const { printMessage, printErrorMessage } = require('./messages');
const git = require('./git');

const [,, ...args] = process.argv;

switch (args[0]) {
  case undefined:
    printErrorMessage(`No command given. See LeVarne --help for help`); break;
  case '--help':
    help(); break;
  case 'githook':
    git.githook(args[1], args[2], args[3]); break;
  default: 
    printErrorMessage(`${args[0]} is not a supported command. See LeVarne --help for help`);
}

function help() {
  const text = `Currently supported commands: 
    - githook`;
  printMessage(text);
}