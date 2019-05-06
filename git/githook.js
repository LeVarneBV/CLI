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
    case '--help':
    case '-h': 
      help(); break;
    case 'add':
      add(repo_type, options); break;
    default:
      printErrorMessage(`${command} is not a supported subcommand for the githook command. See LeVarne githook --help for more information on this command`); break;
  }
}

function add(repo_type, options) {
  switch (repo_type) {
    case undefined:
      printErrorMessage(`No repo type given. To know which githooks need to be added, use LeVarne githook add <lambda> [options]`); break;
    case 'lambda':
      addLambdaGithooks(options); break; 
    default:
      printErrorMessage(`${repo_type} is not a known git repo type. Use LeVarne githook add <lambda> [options]`); break;
  }
}

async function addLambdaGithooks(options) {
  addHooks([
    'pre-commit',
    'autohide-secret.pre-commit',
    'pre-push',
    'deployLambda.pre-push',
    'post-merge',
    'autorevealsecrets.post-merge',
    'post-checkout',
    'autorevealsecrets.post-checkout'
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
          const localHook = path.resolve(__dirname, `./githooks/${hook}`);

          if (hookFolderFiles.includes(hook)) {
            try {
              const answers = await inquirer.prompt(promptHookAlreadyExists(hook));
              if (!answers.hookAlreadyExists)
                continue;
            } catch (error) {
              return printErrorMessage(error);
            }
          }

          if (hook === 'deployLambda.pre-push') {
            try {
              await changeFileContentAndWriteToDest(localHook, `${hookFolderPath}${hook}`);
            } catch (error) {
              return;
            }
          }
          else
            fs.copyFileSync(localHook, `${hookFolderPath}${hook}`);

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

async function changeFileContentAndWriteToDest(file, dest) {
  const answers = await inquirer.prompt(promptAWSDetails());

  if (!answers.accountId || answers.accountId === '' || !answers.apiKeyId || answers.apiKeyId === '') {
    printErrorMessage('Missing AWS account id or API Key id, so this hook is not copied to your githooks folder');
    throw new Error({code: 400, message: 'Missing AWS account id or API Key id, so this hook is not copied to your githooks folder'});
  }
  
  const content = fs.readFileSync(file, 'utf-8');
  const newContent = (content.replace(/^(ACCOUNT_ID=)/gim, `ACCOUNT_ID=${answers.accountId}`)).replace(/^(API_ID=)/gim, `API_ID=${answers.apiKeyId}`);

  fs.writeFileSync(dest, newContent, 'utf-8');
}

function promptHookAlreadyExists(hook) {
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

function promptAWSDetails() {
  return [
   {
     type: 'input',
     name: 'accountId',
     message: 'Account id of AWS account?'
   },
   {
    type: 'input',
    name: 'apiKeyId',
    message: 'API Gateway id of AWS account?'
  }
 ]
}

function help() {
  const text = `Usage: le/LeVarne githook [--help] <command> [<args>]

Subcommands for the githook command:
  add lambda  Adds git-secrets githooks to a Lambda repo`;
  printMessage(text);
}
