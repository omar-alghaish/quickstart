import chalk from 'chalk';
import { Command } from 'commander';
import { createCommand } from './commands/create.js';
import { initCommand } from './commands/init.js';
import { exportCommand } from './commands/export.js';
import { importCommand } from './commands/import.js';

const program = new Command();

program
  .name('quickstart')
  .description('CLI tool to initialize projects from templates')
  .version('1.0.2');

initCommand(program);
createCommand(program);
exportCommand(program);
importCommand(program);

program.on('command:', () => {
  console.error(chalk.red('❌ Invalid command'));
  console.log(`Use ${chalk.yellow('quickstart --help')} to see available commands`);
  process.exit(1);
});

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
