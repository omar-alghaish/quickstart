import chalk from 'chalk';
import { Command } from 'commander';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import path from 'path';
import { fileURLToPath } from 'url';
import { getTemplatesDir } from '../utils/fileUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createCommand(program: Command) {
    program
        .command('create [template]')
        .description('Create a new project from a template')
        .option('-d, --directory <directory>', 'Target directory for the new project')
        .action(async (templateName, options) => {
            console.log(chalk.blue('🚀 Creating a new project from template'));

            try {
                const templatesDir = await getTemplatesDir();

                const templateDirs = await fs.readdir(templatesDir);
                const templates = templateDirs.filter(async (dir) => {
                    const stats = await fs.stat(path.join(templatesDir, dir));
                    return stats.isDirectory();
                });

                if (templates.length === 0) {
                    console.log(
                        chalk.yellow(
                            '⚠️ No templates found. Create one first with "project-init init"'
                        )
                    );
                    return;
                }

                let selectedTemplate = templateName;
                if (!selectedTemplate) {
                    const { template } = await inquirer.prompt([
                        {
                            type: 'list',
                            name: 'template',
                            message: 'Select a template:',
                            choices: templates,
                        },
                    ]);
                    selectedTemplate = template;
                } else if (!templates.includes(selectedTemplate)) {
                    console.log(chalk.red(`❌ Template "${selectedTemplate}" not found`));
                    console.log(chalk.blue(`Available templates: ${templates.join(', ')}`));
                    return;
                }

                let targetDir = options.directory;
                if (!targetDir) {
                    const { projectName } = await inquirer.prompt([
                        {
                            type: 'input',
                            name: 'projectName',
                            message: 'Enter project name:',
                            default: `my-${selectedTemplate}-project`,
                        },
                    ]);
                    targetDir = projectName;
                }

                const targetDirPath = path.resolve(process.cwd(), targetDir);

                if (await fs.pathExists(targetDirPath)) {
                    const { overwrite } = await inquirer.prompt([
                        {
                            type: 'confirm',
                            name: 'overwrite',
                            message: `Directory "${targetDir}" already exists. Continue and merge contents?`,
                            default: false,
                        },
                    ]);

                    if (!overwrite) {
                        console.log(chalk.yellow('⚠️ Project creation canceled'));
                        return;
                    }
                }

                await fs.ensureDir(targetDirPath);

                const templateDir = path.join(templatesDir, selectedTemplate);

                const metadataPath = path.join(templateDir, '.template-meta.json');
                let metadata = {};

                if (await fs.pathExists(metadataPath)) {
                    metadata = await fs.readJSON(metadataPath);
                    await fs.copy(templateDir, targetDirPath, {
                        filter: (src) => !src.endsWith('.template-meta.json'),
                    });
                } else {
                    await fs.copy(templateDir, targetDirPath);
                }

                console.log(chalk.green(`✅ Project created successfully at ${targetDirPath}`));
                console.log(chalk.blue('Happy coding! 🎉'));
            } catch (error) {
                console.error(chalk.red('❌ Error creating project:'), error);
                process.exit(1);
            }
        });
}
