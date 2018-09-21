'use strict';

const { printMessage, printErrorMessage } = require('../messages');
const shell = require('shelljs');
const git = require('simple-git/promise');
const path = require('path');
const fs = require('fs');

module.exports = function(command, repo_type, options) {
  switch (command) {
    case undefined:
      printErrorMessage(`No subcommand given. See LeVarne githook --help for more information on this command`); break;
    case 'add':
      add(repo_type, options); break;
    default:
      printErrorMessage(`${command} is not a supported subcommand for the githook command. See LeVarne githook --help for more information on this command`); break;
  }
}

function add(repo_type, options) {
  switch (repo_type) {
    case undefined:
      printErrorMessage(`No repo type given. To know which githooks need to be added, use LeVarne githook add [lambda | basics] [options]`); break;
    case 'lambda':
      addLambdaGithooks(options); break; 
    default:
      printErrorMessage(`${repo_type} is not a known git repo type. Use LeVarne githook add [lambda | basics] [options]`); break;
  }
}

function addLambdaGithooks(options) {
  if (options === undefined || options === 'all' || options === '.') {
    addPreCommits();
  }
  else {
    addPreCommits();
  }
}

async function addPreCommits() {
  try {
    const cwd = shell.pwd().toString();
    const isRepo = await git(cwd).checkIsRepo();
    if (isRepo) {
      const toplevel = await git(cwd).raw([`rev-parse`, `--show-toplevel`]);
      const hookFolderPath = toplevel.toString().trim() + `/.git/hooks/`;
      const hookFolderFiles = fs.readdirSync(hookFolderPath);

      if (hookFolderFiles.length) {
        if (hookFolderFiles.includes('pre-commit'))
          return printErrorMessage('pre-commit already exists');

        fs.copyFileSync(path.resolve(__dirname, './githooks/pre-commit'), hookFolderPath + 'pre-commit');
        //printMessage(preCommit);
      }
      else
        printErrorMessage(`hooks folder not found`);
    }
    else
      printErrorMessage('The current directory is not a Git directory');
  } catch (error) {
    printErrorMessage(error);
  }
}