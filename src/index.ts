#!/usr/bin/env node

import chalk from 'chalk';
import { Command } from 'commander';
import { createCommand } from './commands/create.js';
import { initCommand } from './commands/init.js';
import { exportCommand } from './commands/export.js';
import { importCommand } from './commands/import.js';
import { githubCommand } from './commands/github.js';
import { listCommand } from './commands/list.js';
import { removeCommand } from './commands/remove.js';
import { updateCommand } from './commands/update.js';
import { infoCommand } from './commands/info.js';
import { configCommand } from './commands/config.js';

const program = new Command();

program
  .name('quickstart')
  .description('CLI tool to initialize projects from templates')
  .version('2.0.0');

initCommand(program);
createCommand(program);
githubCommand(program);
listCommand(program);
infoCommand(program);
updateCommand(program);
removeCommand(program);
exportCommand(program);
importCommand(program);
configCommand(program);

program.on('command:*', () => {
  console.error(chalk.red('❌ Invalid command'));
  console.log(`Use ${chalk.yellow('quickstart --help')} to see available commands`);
  process.exit(1);
});

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
