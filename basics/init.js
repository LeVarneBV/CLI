const shell = require('shelljs');
const git = require('simple-git/promise');
const path = require('path');
const fs = require('fs');
const inquirer = require('inquirer');

const { printMessage, printErrorMessage } = require('../messages');

module.exports = async function(project, options) {
  switch (project) {
    case undefined:
      printErrorMessage(`No project specified. See LeVarne basics --help for more information on this command`); break;
    case 'nodejs':
      await initNodejs(options); break;
    case 'ionic':
      await initIonic(options); break;
    case 'lambdas':
      await initLambdas(options); break;
    default:
      printErrorMessage(`${project} is not a supported project for the basics init command. See LeVarne basics --help for more information on this command`); break;
  }
}

async function initNodejs(options) {
  await initProject('Nodejs', undefined);
}

async function initIonic(options) {
  const version = '3';
  await initProject('Ionic', version);
}

async function initLambdas(options) {
  shell.exec('svn ls https://github.com/LeVarneBV/basics.git/trunk/Blueprints/Application/Lambdas', { silent: true }, async (code, stdout, stderr) => {
    if (stderr)
      printErrorMessage(stderr);
    else if (!stdout)
      printErrorMessage('Could not find any Lambda folders in basics repo');
    else {
      const availableLambdaFolders = stdout.trim().replace(/\//g, '').split('\n');
      const answer = await inquirer.prompt(promptWhichLambdaFoldersToImport(availableLambdaFolders));
      for (const dir of answer.lambdasToImport)
        await initProject('Lambdas', undefined, dir);
    }
  });
}

async function initProject(project, version, subDir) {
  return new Promise((res, rej) => {
    let dir = `${project}`;
    if (subDir)
      dir = `${subDir}`;
  
    shell.exec(`cat ${dir}`, { silent: true }, async (code, stdout, stderr) => {
      if (stderr.startsWith(`cat: ${dir}: Is a directory`)) {
        const answer = await inquirer.prompt(promptOverwriteDirectory(`${dir}`));
        if (!answer.directoryAlreadyExists) {
          let message = `Aborted initialization of ${project} project`;
          if (subDir)
            message += `: ${subDir} directory`;
          res(printMessage(message));
        }
        else
          res(createProject(project, version, true, subDir));
      }
      else
        res(createProject(project, version, false, subDir));
    });
  });
}

function createProject(project, version, force, subDir) {
  let dir = `${project}`;
  if (subDir)
    dir += `/${subDir}`;
  let command = `svn export https://github.com/LeVarneBV/basics.git/trunk/Blueprints/Application/${dir}`;
  let message = `Successfully initialized ${project} project`;
  if (version)
    message = `Successfully initialized ${project} version ${version} project`;
  if (subDir) 
    message += `: ${subDir} directory`;
  if (force)
    command += ' --force';

  shell.exec(command);
  printMessage(message);
}

function promptOverwriteDirectory(dirName) {
  return [
    {
      type: 'confirm',
      name: 'directoryAlreadyExists',
      message: `${dirName} directory already exists. Do you want to overwrite it?`,
      default: 'n',
      choices: ['Y', 'n']
    }
  ]
}

function promptWhichLambdaFoldersToImport(folders) {
  return [
    {
      type: 'checkbox',
      name: 'lambdasToImport',
      message: 'Which Lambda directories would you like to import?',
      choices: folders
    }
  ]
}