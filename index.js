#!/usr/bin/env node
'use strict';

const shell = require('shelljs');
const path = require('path');
const program = require('commander');

const pkg = require('./package.json');
const { printMessage, printErrorMessage } = require('./messages');

const git = require('./git');
const basics = require('./basics');

const [,, ...args] = process.argv;

switch (args[0]) {
  case undefined:
    printErrorMessage(`No command given. See LeVarne --help for help`); break;
  case '--version':
  case '-v': 
    printMessage(pkg.version); break;
  case '--help':
  case '-h':
    help(); break;
  case 'githook':
    git.githook(args[1], args[2], args[3]); break;
  case 'secret-conflicts':
    shell.exec(path.resolve(__dirname, './git/secret-conflicts')); break;
  case 'basics':
    basics(args[1], args[2], args[3]); break;
  default: 
    printErrorMessage(`${args[0]} is not a supported command. See LeVarne --help for help`);
}

function help() {
  const text = `Usage: le/LeVarne [--version] [--help] <command> [<args>]

Currently supported commands:

Commands that have to do with git-secrets
  githook           Add githooks to your git repo that work well with git-secrets
  secret-conflicts  Exports conflicts in decrypted secret files to encrypted secret files

Commands that have to do with setting up projects
  basics\t Initialize new projects like NodeJS, Ionic or Lambda functions
  
See le/LeVarne --help <command> to read about specific subcommands`;
  printMessage(text);
}