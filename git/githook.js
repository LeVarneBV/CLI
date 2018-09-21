'use strict';

const shell = require('shelljs');
const git = require('simple-git/promise');
const path = require('path');
const fs = require('fs');
const inquirer = require('inquirer');

const { printMessage, printErrorMessage } = require('../messages');

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

async function addLambdaGithooks(options) {
  addHooks([
    'pre-commit',
    'autohide-secret.pre-commit',
    'pre-push',
    'deployLambda.pre-push'
  ]);
}

async function addHooks(hooks) {
  try {
    const cwd = shell.pwd().toString();
    const isRepo = await git(cwd).checkIsRepo();
    if (isRepo) {
      const toplevel = await git(cwd).raw([`rev-parse`, `--show-toplevel`]);
      const hookFolderPath = toplevel.toString().trim() + `/.git/hooks/`;
      const hookFolderFiles = fs.readdirSync(hookFolderPath);

      if (hookFolderFiles.length) {
        for (let i = 0; i < hooks.length; i++) {
          const hook = hooks[i];
          if (hookFolderFiles.includes(hook)) {
            try {
              const answers = await inquirer.prompt(hookAlreadyExistPrompt(hook));
              if (!answers.hookAlreadyExists)
                continue;
            } catch (error) {
              return printErrorMessage(error);
            }
          }

          fs.copyFileSync(path.resolve(__dirname, `./githooks/${hook}`), `${hookFolderPath}${hook}`);
          shell.exec(`chmod a+x ${hookFolderPath}${hook}`);
          printMessage(`Copied ${hook} to your githooks and made it an executable file`);
        }
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

function hookAlreadyExistPrompt(hook) {
   return [
    {
      type: 'confirm',
      name: 'hookAlreadyExists',
      message: `${hook} already exists. Do you want to overwrite it?`,
      default: 'n',
      choices: ['Y', 'n']
    }
  ]
}