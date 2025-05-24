import chalk from 'chalk';
import { Command } from 'commander';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import path from 'path';
import { getTemplatesDir, getTemplateMeta, TemplateMeta } from '../utils/fileUtils.js';

interface UpdateOptions {
    name?: string;
    description?: string;
}

export function updateCommand(program: Command) {
    program
        .command('update <template>')
        .description('Update template metadata')
        .option('-n, --name <name>', 'Update template name')
        .option('-d, --description <description>', 'Update template description')
        .action(async (templateName: string, options: UpdateOptions) => {
            try {
                await handleUpdateCommand(templateName, options);
            } catch (error) {
                console.error(chalk.red('❌ Error updating template:'), error);
                process.exit(1);
            }
        });
}

async function handleUpdateCommand(templateName: string, options: UpdateOptions) {
    const templatesDir = await getTemplatesDir();
    const templateDir = path.join(templatesDir, templateName);

    if (!(await fs.pathExists(templateDir))) {
        console.error(chalk.red(`❌ Template "${templateName}" not found`));
        process.exit(1);
    }

    const metadata = await getTemplateMeta(templateDir);
    
    console.log(chalk.blue(`🔄 Updating template: ${templateName}`));
    
    const updates: Partial<TemplateMeta> = {};
    
    if (options.name) {
        updates.name = options.name;
    } else {
        const { newName } = await inquirer.prompt([
            {
                type: 'input',
                name: 'newName',
                message: 'Template name:',
                default: metadata.name,
            },
        ]);
        updates.name = newName;
    }

    if (options.description) {
        updates.description = options.description;
    } else {
        const { newDescription } = await inquirer.prompt([
            {
                type: 'input',
                name: 'newDescription',
                message: 'Template description:',
                default: metadata.description || '',
            },
        ]);
        updates.description = newDescription;
    }

    const updatedMetadata = { ...metadata, ...updates };
    await fs.writeJSON(
        path.join(templateDir, '.template-meta.json'),
        updatedMetadata,
        { spaces: 2 }
    );

    if (updates.name && updates.name !== templateName) {
        const newTemplateDir = path.join(templatesDir, updates.name);
        await fs.move(templateDir, newTemplateDir);
        console.log(chalk.green(`✅ Template renamed from "${templateName}" to "${updates.name}"`));
    } else {
        console.log(chalk.green(`✅ Template "${templateName}" updated successfully`));
    }
}
