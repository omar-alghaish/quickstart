import chalk from 'chalk';
import { Command } from 'commander';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import {
    createTemplatesDir,
    TemplateMeta,
    TemplateVariable,
    PostCreationScript,
} from '../utils/fileUtils.js';

const execAsync = promisify(exec);

interface GitHubOptions {
    name?: string;
    description?: string;
    branch?: string;
    subdirectory?: string;
    skipVariables: boolean;
    skipScripts: boolean;
}

export function githubCommand(program: Command) {
    program
        .command('github <repo>')
        .description('Create a template from a GitHub repository')
        .option('-n, --name <name>', 'Name for the template')
        .option('-d, --description <description>', 'Description for the template')
        .option('-b, --branch <branch>', 'Branch to clone (default: main/master)')
        .option('-s, --subdirectory <path>', 'Use only a subdirectory of the repo')
        .option('--skip-variables', 'Skip defining template variables')
        .option('--skip-scripts', 'Skip defining post-creation scripts')
        .action(async (repo: string, options: GitHubOptions) => {
            try {
                await handleGitHubCommand(repo, options);
            } catch (error) {
                console.error(chalk.red('❌ Error creating template from GitHub:'), error);
                process.exit(1);
            }
        });
}

async function handleGitHubCommand(repo: string, options: GitHubOptions) {
    console.log(chalk.blue(`🚀 Creating template from GitHub repository: ${repo}`));

    if (!repo.includes('/')) {
        console.error(chalk.red('❌ Repository must be in format: owner/repo'));
        process.exit(1);
    }

    const templatesDir = await createTemplatesDir();
    const tempDir = path.join(templatesDir, '.temp', `github-${Date.now()}`);
    
    try {
        await fs.ensureDir(tempDir);
        
        await cloneRepository(repo, tempDir, options.branch);
        
        const sourceDir = options.subdirectory 
            ? path.join(tempDir, options.subdirectory)
            : tempDir;
            
        if (!(await fs.pathExists(sourceDir))) {
            console.error(chalk.red(`❌ Subdirectory "${options.subdirectory}" not found in repository`));
            process.exit(1);
        }

        const templateName = options.name || repo.split('/')[1];
        const templateDescription = options.description || `Template from ${repo}`;
        
        const templateDir = path.join(templatesDir, templateName);
        await handleExistingTemplate(templateDir, templateName);
        
        await copyTemplateFiles(sourceDir, templateDir);
        
        const variables = await collectTemplateVariables(options);
        const postCreationScripts = await collectPostCreationScripts(options);
        
        await writeTemplateMetadata(templateDir, {
            name: templateName,
            description: templateDescription,
            variables,
            postCreationScripts,
        });

        console.log(chalk.green(`✅ Template "${templateName}" created from GitHub repository`));
        console.log(chalk.blue(`💡 Use 'quickstart create ${templateName}' to use this template`));
        
    } finally {
        await fs.remove(tempDir);
    }
}

async function cloneRepository(repo: string, targetDir: string, branch?: string) {
    const repoUrl = `https://github.com/${repo}.git`;
    const branchFlag = branch ? `--branch ${branch}` : '';
    
    console.log(chalk.blue(`📥 Cloning repository ${repo}...`));
    
    try {
        await execAsync(`git clone ${branchFlag} --depth 1 ${repoUrl} ${targetDir}`);
        console.log(chalk.green('✅ Repository cloned successfully'));
    } catch (error) {
        console.error(chalk.red('❌ Failed to clone repository. Make sure it exists and is accessible.'));
        throw error;
    }
}

async function copyTemplateFiles(sourceDir: string, targetDir: string) {
    await fs.copy(sourceDir, targetDir, {
        filter: (src) => {
            const relativePath = path.relative(sourceDir, src);
            const excludePatterns = ['.git', 'node_modules', '.DS_Store', '*.log'];
            return !excludePatterns.some(pattern => {
                if (pattern.includes('*')) {
                    const regexPattern = pattern.replace(/\*/g, '.*');
                    return new RegExp(regexPattern).test(relativePath);
                }
                return relativePath.startsWith(pattern);
            });
        },
    });
}

async function handleExistingTemplate(templateDir: string, name: string): Promise<void> {
    if (!(await fs.pathExists(templateDir))) {
        return;
    }

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
        process.exit(0);
    }

    await fs.remove(templateDir);
}

async function collectTemplateVariables(options: GitHubOptions): Promise<TemplateVariable[]> {
    if (options.skipVariables) {
        return [];
    }

    const variables: TemplateVariable[] = [];
    console.log(chalk.blue('\n📝 Define template variables for placeholder replacements'));

    while (true) {
        const { variableName } = await inquirer.prompt([
            {
                type: 'input',
                name: 'variableName',
                message: 'Variable name (leave empty to finish):',
            },
        ]);

        if (!variableName.trim()) break;

        const { description, defaultValue, required } = await inquirer.prompt([
            {
                type: 'input',
                name: 'description',
                message: `Description for ${variableName}:`,
                default: `Value for ${variableName}`,
            },
            {
                type: 'input',
                name: 'defaultValue',
                message: `Default value for ${variableName}:`,
            },
            {
                type: 'confirm',
                name: 'required',
                message: `Is ${variableName} required?`,
                default: true,
            },
        ]);

        variables.push({
            name: variableName,
            description,
            ...(defaultValue ? { default: defaultValue } : {}),
            required,
        });
    }

    return variables;
}

async function collectPostCreationScripts(options: GitHubOptions): Promise<PostCreationScript[]> {
    if (options.skipScripts) {
        return [];
    }

    const scripts: PostCreationScript[] = [];
    console.log(chalk.blue('\n📝 Define post-creation scripts'));

    while (true) {
        const { scriptName } = await inquirer.prompt([
            {
                type: 'input',
                name: 'scriptName',
                message: 'Script name (leave empty to finish):',
            },
        ]);

        if (!scriptName.trim()) break;

        const { command, description, runByDefault } = await inquirer.prompt([
            {
                type: 'input',
                name: 'command',
                message: `Command for ${scriptName}:`,
                validate: (input) => input.trim() !== '' ? true : 'Command is required',
            },
            {
                type: 'input',
                name: 'description',
                message: `Description for ${scriptName}:`,
                default: `Runs ${scriptName}`,
            },
            {
                type: 'confirm',
                name: 'runByDefault',
                message: `Run ${scriptName} by default?`,
                default: true,
            },
        ]);

        scripts.push({ name: scriptName, command, description, runByDefault });
    }

    return scripts;
}

async function writeTemplateMetadata(
    templateDir: string,
    metadata: Omit<TemplateMeta, 'createdAt'>
): Promise<void> {
    const fullMetadata: TemplateMeta = {
        ...metadata,
        createdAt: new Date().toISOString(),
    };

    await fs.writeJSON(path.join(templateDir, '.template-meta.json'), fullMetadata, { spaces: 2 });
}
