import chalk from 'chalk';
import { Command } from 'commander';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import path from 'path';
import { fileURLToPath } from 'url';
import { getTemplatesDir } from '../utils/fileUtils.js';
import { decodeTemplate } from '../utils/qstUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ImportOptions {
    force: boolean;
}

export function importCommand(program: Command) {
    program
        .command('import <file>')
        .description('Import a template from a .qst file')
        .option('-f, --force', 'Overwrite existing template without prompting')
        .action(async (filePath: string, options: ImportOptions) => {
            try {
                await handleImportCommand(filePath, options);
            } catch (error) {
                console.error(chalk.red('❌ Error importing template:'), error);
                process.exit(1);
            }
        });
}

async function handleImportCommand(filePath: string, options: ImportOptions) {
    console.log(chalk.blue('🚀 Importing template from .qst file'));

    const resolvedPath = path.resolve(process.cwd(), filePath);
    
    if (!(await fs.pathExists(resolvedPath))) {
        console.error(chalk.red(`❌ File not found: ${resolvedPath}`));
        process.exit(1);
    }
    
    if (path.extname(resolvedPath) !== '.qst') {
        console.error(chalk.red('❌ File must have .qst extension'));
        process.exit(1);
    }
    
    const templatesDir = await getTemplatesDir();
    const templateInfo = await decodeTemplate(resolvedPath);
    
    const targetDir = path.join(templatesDir, templateInfo.name);
    
    if (await fs.pathExists(targetDir)) {
        if (!options.force) {
            const { overwrite } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'overwrite',
                    message: `Template "${templateInfo.name}" already exists. Overwrite?`,
                    default: false,
                },
            ]);
            
            if (!overwrite) {
                console.log(chalk.yellow('⚠️ Import canceled'));
                process.exit(0);
            }
        }
        
        await fs.remove(targetDir);
    }
    
    await fs.ensureDir(targetDir);
    await templateInfo.extract(targetDir);
    
    console.log(chalk.green(`✅ Template "${templateInfo.name}" imported successfully`));
    console.log(chalk.blue(`💡 Use 'quickstart create ${templateInfo.name}' to use this template`));
}