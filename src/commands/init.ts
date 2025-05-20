import chalk from 'chalk';
import { Command } from 'commander';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import path from 'path';
import { fileURLToPath } from 'url';
import { createTemplatesDir } from '../utils/fileUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function initCommand(program: Command) {
    program
        .command('init')
        .description('Initialize a new template from current directory')
        .option('-n, --name <name>', 'Name of the template')
        .action(async (options) => {
            console.log(chalk.blue('🚀 Initializing a new project template'));

            try {
                const templatesDir = await createTemplatesDir();

                let { name } = options;
                if (!name) {
                    const answers = await inquirer.prompt([
                        {
                            type: 'input',
                            name: 'templateName',
                            message: 'Enter a name for this template:',
                            validate: (input) =>
                                input.trim() !== '' ? true : 'Template name is required',
                        },
                    ]);
                    name = answers.templateName;
                }

                const templateDir = path.join(templatesDir, name);

                if (await fs.pathExists(templateDir)) {
                    const { overwrite } = await inquirer.prompt([
                        {
                            type: 'confirm',
                            name: 'overwrite',
                            message: `Template "${name}" already exists. Overwrite?`,
                            default: false,
                        },
                    ]);

                    if (!overwrite) {
                        console.log(chalk.yellow('⚠️ Template creation canceled'));
                        return;
                    }

                    await fs.remove(templateDir);
                }

                const currentDir = process.cwd();

                const { ignorePatterns } = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'ignorePatterns',
                        message:
                            'Enter patterns to ignore (comma separated, e.g. node_modules,dist,.git):',
                        default: 'node_modules,dist,.git,.DS_Store,*.log',
                    },
                ]);

                const ignoreList = ignorePatterns.split(',').map((p: string) => p.trim());

                await fs.copy(currentDir, templateDir, {
                    filter: (src) => {
                        const relativePath = path.relative(currentDir, src);
                        return !ignoreList.some((pattern: string) => {
                            if (pattern.includes('*')) {
                                const regexPattern = pattern.replace(/\*/g, '.*');
                                return new RegExp(regexPattern).test(relativePath);
                            }
                            return relativePath.startsWith(pattern) || relativePath === pattern;
                        });
                    },
                });

                await fs.writeJSON(
                    path.join(templateDir, '.template-meta.json'),
                    {
                        name,
                        createdAt: new Date().toISOString(),
                        variables: [], // For future feature to support template variables
                    },
                    { spaces: 2 }
                );

                console.log(
                    chalk.green(`✅ Template "${name}" created successfully at ${templateDir}`)
                );
                console.log(
                    chalk.blue(
                        `💡 Use '${chalk.yellow(`quickstart create ${name}`)}' to use this template`
                    )
                );
            } catch (error) {
                console.error(chalk.red('❌ Error initializing template:'), error);
                process.exit(1);
            }
        });
}
