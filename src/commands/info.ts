import chalk from 'chalk';
import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import { getTemplatesDir, getTemplateMeta } from '../utils/fileUtils.js';

interface InfoOptions {
    json: boolean;
}

export function infoCommand(program: Command) {
    program
        .command('info <template>')
        .description('Show detailed information about a template')
        .option('-j, --json', 'Output as JSON')
        .action(async (templateName: string, options: InfoOptions) => {
            try {
                await handleInfoCommand(templateName, options);
            } catch (error) {
                console.error(chalk.red('❌ Error getting template info:'), error);
                process.exit(1);
            }
        });
}

async function handleInfoCommand(templateName: string, options: InfoOptions) {
    const templatesDir = await getTemplatesDir();
    const templateDir = path.join(templatesDir, templateName);

    if (!(await fs.pathExists(templateDir))) {
        console.error(chalk.red(`❌ Template "${templateName}" not found`));
        process.exit(1);
    }

    const metadata = await getTemplateMeta(templateDir);
    
    const files = await getFileCount(templateDir);
    
    const templateInfo = {
        name: metadata.name,
        description: metadata.description,
        createdAt: metadata.createdAt,
        path: templateDir,
        fileCount: files,
        variables: metadata.variables || [],
        postCreationScripts: metadata.postCreationScripts || [],
    };

    if (options.json) {
        console.log(JSON.stringify(templateInfo, null, 2));
        return;
    }

    console.log(chalk.blue(`📦 Template: ${metadata.name}`));
    console.log(chalk.gray(`Path: ${templateDir}`));
    
    if (metadata.description) {
        console.log(chalk.gray(`Description: ${metadata.description}`));
    }
    
    console.log(chalk.gray(`Created: ${new Date(metadata.createdAt).toLocaleDateString()}`));
    console.log(chalk.gray(`Files: ${files}`));

    if (metadata.variables && metadata.variables.length > 0) {
        console.log(chalk.blue('\n📝 Variables:'));
        metadata.variables.forEach((variable) => {
            console.log(chalk.green(`  • ${variable.name}`));
            console.log(chalk.gray(`    ${variable.description}`));
            if (variable.default) {
                console.log(chalk.gray(`    Default: ${variable.default}`));
            }
            console.log(chalk.gray(`    Required: ${variable.required ? 'Yes' : 'No'}`));
        });
    }

    if (metadata.postCreationScripts && metadata.postCreationScripts.length > 0) {
        console.log(chalk.blue('\n🛠️  Post-Creation Scripts:'));
        metadata.postCreationScripts.forEach((script) => {
            console.log(chalk.green(`  • ${script.name}`));
            if (script.description) {
                console.log(chalk.gray(`    ${script.description}`));
            }
            console.log(chalk.gray(`    Command: ${script.command}`));
            console.log(chalk.gray(`    Run by default: ${script.runByDefault ? 'Yes' : 'No'}`));
        });
    }
}

async function getFileCount(templateDir: string): Promise<number> {
    let count = 0;
    
    async function countFiles(dir: string) {
        const items = await fs.readdir(dir);
        
        for (const item of items) {
            if (item === '.template-meta.json') continue;
            
            const itemPath = path.join(dir, item);
            const stats = await fs.stat(itemPath);
            
            if (stats.isDirectory()) {
                await countFiles(itemPath);
            } else {
                count++;
            }
        }
    }
    
    await countFiles(templateDir);
    return count;
}