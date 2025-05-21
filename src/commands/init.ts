import chalk from 'chalk';
import { Command } from 'commander';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
    PostCreationScript,
    TemplateMeta,
    TemplateVariable,
    createTemplatesDir,
} from '../utils/fileUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface InitOptions {
    name?: string;
    description?: string;
    skipVariables: boolean;
    skipScripts: boolean;
}

export function initCommand(program: Command) {
    program
        .command('init')
        .description('Initialize a new template from current directory')
        .option('-n, --name <name>', 'Name of the template')
        .option('-d, --description <description>', 'Description of the template')
        .option('-s, --skip-variables', 'Skip defining template variables')
        .option('-p, --skip-scripts', 'Skip defining post-creation scripts')
        .action(async (options: InitOptions) => {
            try {
                await handleInitCommand(options);
            } catch (error) {
                console.error(chalk.red('❌ Error initializing template:'), error);
                process.exit(1);
            }
        });
}

async function handleInitCommand(options: InitOptions) {
    console.log(chalk.blue('🚀 Initializing a new project template'));

    const templatesDir = await createTemplatesDir();
    const { name, description } = await getTemplateInfo(options);
    const templateDir = path.join(templatesDir, name);

    await handleExistingTemplate(templateDir, name);
    const ignoreList = await getIgnorePatterns();
    const variables = await collectTemplateVariables(options);
    const postCreationScripts = await collectPostCreationScripts(options);

    await copyTemplateFiles(process.cwd(), templateDir, ignoreList);
    await writeTemplateMetadata(templateDir, { name, description, variables, postCreationScripts });

    displaySuccessMessage(name, templateDir, variables, postCreationScripts);
}

async function getTemplateInfo(
    options: InitOptions
): Promise<{ name: string; description: string }> {
    let name = options.name;
    let description = options.description;

    if (!name) {
        const { templateName } = await inquirer.prompt([
            {
                type: 'input',
                name: 'templateName',
                message: 'Enter a name for this template:',
                validate: (input) => (input.trim() !== '' ? true : 'Template name is required'),
            },
        ]);
        name = templateName;
    }

    if (!description) {
        const { templateDescription } = await inquirer.prompt([
            {
                type: 'input',
                name: 'templateDescription',
                message: 'Enter a description for this template:',
                default: `Template for ${name} projects`,
            },
        ]);
        description = templateDescription;
    }

    return { name: name!, description: description! };
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

async function getIgnorePatterns(): Promise<string[]> {
    const { ignorePatterns } = await inquirer.prompt([
        {
            type: 'input',
            name: 'ignorePatterns',
            message: 'Enter patterns to ignore (comma separated, e.g. node_modules,dist,.git):',
            default: 'node_modules,dist,.git,.DS_Store,*.log',
        },
    ]);

    return ignorePatterns.split(',').map((p: string) => p.trim());
}

async function collectTemplateVariables(options: InitOptions): Promise<TemplateVariable[]> {
    if (options.skipVariables) {
        return [];
    }

    const variables: TemplateVariable[] = [];
    console.log(chalk.blue('\n📝 Define template variables for placeholder replacements'));
    console.log(chalk.gray('Variables will be used to replace {{variableName}} in files\n'));

    while (true) {
        const { variableName } = await inquirer.prompt([
            {
                type: 'input',
                name: 'variableName',
                message: 'Variable name (leave empty to finish):',
            },
        ]);

        if (!variableName.trim()) {
            break;
        }

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
                message: `Default value for ${variableName} (leave empty for no default):`,
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

        console.log(chalk.green(`✅ Variable ${variableName} added`));
    }

    return variables;
}

async function collectPostCreationScripts(options: InitOptions): Promise<PostCreationScript[]> {
    if (options.skipScripts) {
        return [];
    }

    const scripts: PostCreationScript[] = [];
    console.log(chalk.blue('\n📝 Define post-creation scripts'));
    console.log(chalk.gray('Scripts will run after project creation\n'));

    while (true) {
        const { scriptName } = await inquirer.prompt([
            {
                type: 'input',
                name: 'scriptName',
                message: 'Script name (leave empty to finish):',
            },
        ]);

        if (!scriptName.trim()) {
            break;
        }

        const { command, description, runByDefault } = await inquirer.prompt([
            {
                type: 'input',
                name: 'command',
                message: `Command for ${scriptName}:`,
                validate: (input) => (input.trim() !== '' ? true : 'Command is required'),
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
                message: `Run ${scriptName} by default when creating from template?`,
                default: true,
            },
        ]);

        scripts.push({ name: scriptName, command, description, runByDefault });
        console.log(chalk.green(`✅ Script ${scriptName} added`));
    }

    return scripts;
}

async function copyTemplateFiles(
    sourceDir: string,
    targetDir: string,
    ignoreList: string[]
): Promise<void> {
    await fs.copy(sourceDir, targetDir, {
        filter: (src) => {
            const relativePath = path.relative(sourceDir, src);
            return !ignoreList.some((pattern: string) => {
                if (pattern.includes('*')) {
                    const regexPattern = pattern.replace(/\*/g, '.*');
                    return new RegExp(regexPattern).test(relativePath);
                }
                return relativePath.startsWith(pattern) || relativePath === pattern;
            });
        },
    });
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

function displaySuccessMessage(
    name: string,
    templateDir: string,
    variables: TemplateVariable[],
    scripts: PostCreationScript[]
): void {
    console.log(chalk.green(`✅ Template "${name}" created successfully at ${templateDir}`));
    console.log(
        chalk.blue(`💡 Use '${chalk.yellow(`quickstart create ${name}`)}' to use this template`)
    );

    if (variables.length > 0) {
        console.log(chalk.blue(`\n📋 Template Variables: ${variables.length}`));
        variables.forEach((v) => {
            console.log(chalk.gray(`- ${v.name} ${v.required ? '(required)' : '(optional)'}`));
        });
    }

    if (scripts.length > 0) {
        console.log(chalk.blue(`\n📋 Post-Creation Scripts: ${scripts.length}`));
        scripts.forEach((s) => {
            console.log(chalk.gray(`- ${s.name}: ${s.command}`));
        });
    }
}
