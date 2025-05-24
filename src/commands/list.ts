import chalk from 'chalk';
import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import { getTemplatesDir, getTemplateMeta } from '../utils/fileUtils.js';

interface ListOptions {
    detailed: boolean;
    json: boolean;
}

export function listCommand(program: Command) {
    program
        .command('list')
        .alias('ls')
        .description('List all available templates')
        .option('-d, --detailed', 'Show detailed information for each template')
        .option('-j, --json', 'Output as JSON')
        .action(async (options: ListOptions) => {
            try {
                await handleListCommand(options);
            } catch (error) {
                console.error(chalk.red('❌ Error listing templates:'), error);
                process.exit(1);
            }
        });
}

async function handleListCommand(options: ListOptions) {
    const templatesDir = await getTemplatesDir();
    const templateDirs = await fs.readdir(templatesDir);
    
    const templates = [];
    for (const dir of templateDirs) {
        const templatePath = path.join(templatesDir, dir);
        const stats = await fs.stat(templatePath);
        
        if (stats.isDirectory() && !dir.startsWith('.')) {
            const metadata = await getTemplateMeta(templatePath);
            templates.push({
                name: metadata.name,
                description: metadata.description,
                createdAt: metadata.createdAt,
                variables: metadata.variables?.length || 0,
                scripts: metadata.postCreationScripts?.length || 0,
                path: templatePath,
            });
        }
    }

    if (templates.length === 0) {
        console.log(chalk.yellow('⚠️ No templates found. Create one first with "quickstart init" or "quickstart github"'));
        return;
    }

    if (options.json) {
        console.log(JSON.stringify(templates, null, 2));
        return;
    }

    console.log(chalk.blue(`📦 Found ${templates.length} template${templates.length !== 1 ? 's' : ''}:\n`));

    for (const template of templates) {
        console.log(chalk.green(`• ${template.name}`));
        
        if (options.detailed) {
            if (template.description) {
                console.log(chalk.gray(`  Description: ${template.description}`));
            }
            console.log(chalk.gray(`  Created: ${new Date(template.createdAt).toLocaleDateString()}`));
            console.log(chalk.gray(`  Variables: ${template.variables}`));
            console.log(chalk.gray(`  Scripts: ${template.scripts}`));
            console.log(chalk.gray(`  Path: ${template.path}`));
            console.log();
        }
    }

    if (!options.detailed) {
        console.log(chalk.blue('\n💡 Use --detailed flag for more information'));
    }
}