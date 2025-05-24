import chalk from 'chalk';
import { Command } from 'commander';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import path from 'path';
import { getTemplatesDir } from '../utils/fileUtils.js';

interface RemoveOptions {
    force: boolean;
}

export function removeCommand(program: Command) {
    program
        .command('remove <template>')
        .alias('rm')
        .description('Remove a template')
        .option('-f, --force', 'Remove without confirmation')
        .action(async (templateName: string, options: RemoveOptions) => {
            try {
                await handleRemoveCommand(templateName, options);
            } catch (error) {
                console.error(chalk.red('❌ Error removing template:'), error);
                process.exit(1);
            }
        });
}

async function handleRemoveCommand(templateName: string, options: RemoveOptions) {
    const templatesDir = await getTemplatesDir();
    const templateDir = path.join(templatesDir, templateName);

    if (!(await fs.pathExists(templateDir))) {
        console.error(chalk.red(`❌ Template "${templateName}" not found`));
        process.exit(1);
    }

    if (!options.force) {
        const { confirm } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: `Are you sure you want to remove template "${templateName}"?`,
                default: false,
            },
        ]);

        if (!confirm) {
            console.log(chalk.yellow('⚠️ Template removal canceled'));
            return;
        }
    }

    await fs.remove(templateDir);
    console.log(chalk.green(`✅ Template "${templateName}" removed successfully`));
}