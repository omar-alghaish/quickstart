import chalk from 'chalk';
import { Command } from 'commander';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
    getTemplateMeta,
    getTemplatesDir,
    processDirectoryReplacements,
} from '../utils/fileUtils.js';
import { executePostCreationScripts } from '../utils/scriptUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CreateOptions {
    directory?: string;
    yes: boolean;
    skipScripts: boolean;
    vars?: string;
}

interface TemplateVariable {
    name: string;
    description?: string;
    default?: string;
    required?: boolean;
}

interface PostCreationScript {
    name: string;
    description?: string;
    command: string;
    runByDefault?: boolean;
}

interface TemplateMetadata {
    name: string;
    description?: string;
    variables?: TemplateVariable[];
    postCreationScripts?: PostCreationScript[];
}

export function createCommand(program: Command) {
    program
        .command('create [template]')
        .description('Create a new project from a template')
        .option('-d, --directory <directory>', 'Target directory for the new project')
        .option('-y, --yes', 'Skip all prompts and use defaults')
        .option('-s, --skip-scripts', 'Skip running post-creation scripts')
        .option('-v, --vars <jsonString>', 'Provide variable values as JSON string')
        .action(async (templateName: string, options: CreateOptions) => {
            try {
                await handleCreateCommand(templateName, options);
            } catch (error) {
                console.error(chalk.red('❌ Error creating project:'), error);
                process.exit(1);
            }
        });
}

async function handleCreateCommand(templateName: string, options: CreateOptions) {
    console.log(chalk.blue('🚀 Creating a new project from template'));

    const templates = await getAvailableTemplates();
    if (templates.length === 0) {
        console.log(chalk.yellow('⚠️ No templates found. Create one first with "quickstart init"'));
        return;
    }

    const selectedTemplate = await selectTemplate(templateName, templates, options.yes);
    const templateDir = path.join(await getTemplatesDir(), selectedTemplate);
    const metadata = await getTemplateMeta(templateDir);

    displayTemplateInfo(metadata);

    const targetDir = await getTargetDirectory(options, selectedTemplate);
    const targetDirPath = path.resolve(process.cwd(), targetDir);

    await handleExistingDirectory(targetDirPath, options);

    const variableValues = await collectVariableValues(metadata, options);
    await copyAndProcessTemplate(templateDir, targetDirPath, variableValues);
    await handlePostCreationScripts(metadata, targetDirPath, options);

    console.log(chalk.green(`\n✅ Project created successfully at ${targetDirPath}`));
    console.log(chalk.blue('Happy coding! 🎉'));
}

async function getAvailableTemplates(): Promise<string[]> {
    const templatesDir = await getTemplatesDir();
    const templateDirs = await fs.readdir(templatesDir);
    return (
        await Promise.all(
            templateDirs.map(async (dir) => {
                const stats = await fs.stat(path.join(templatesDir, dir));
                return stats.isDirectory() ? dir : null;
            })
        )
    ).filter((dir): dir is string => dir !== null);
}

async function selectTemplate(
    templateName: string,
    templates: string[],
    skipPrompt: boolean
): Promise<string> {
    if (!templateName) {
        if (skipPrompt) {
            console.log(chalk.red('❌ Template name is required with --yes flag'));
            process.exit(1);
        }

        const { template } = await inquirer.prompt([
            {
                type: 'list',
                name: 'template',
                message: 'Select a template:',
                choices: templates,
            },
        ]);
        return template;
    }

    if (!templates.includes(templateName)) {
        console.log(chalk.red(`❌ Template "${templateName}" not found`));
        console.log(chalk.blue(`Available templates: ${templates.join(', ')}`));
        process.exit(1);
    }

    return templateName;
}

function displayTemplateInfo(metadata: TemplateMetadata) {
    console.log(chalk.blue(`\n📦 Template: ${metadata.name}`));
    if (metadata.description) {
        console.log(chalk.gray(`   ${metadata.description}`));
    }
}

async function getTargetDirectory(options: CreateOptions, templateName: string): Promise<string> {
    if (options.directory) {
        return options.directory;
    }

    if (options.yes) {
        return `my-${templateName}-project`;
    }

    const { projectName } = await inquirer.prompt([
        {
            type: 'input',
            name: 'projectName',
            message: 'Enter project name:',
            default: `my-${templateName}-project`,
        },
    ]);
    return projectName;
}

async function handleExistingDirectory(
    targetDirPath: string,
    options: CreateOptions
): Promise<void> {
    if (!(await fs.pathExists(targetDirPath))) {
        await fs.ensureDir(targetDirPath);
        return;
    }

    let overwrite = options.yes;
    if (!overwrite) {
        const { confirmOverwrite } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirmOverwrite',
                message: `Directory "${path.basename(targetDirPath)}" already exists. Continue and merge contents?`,
                default: false,
            },
        ]);
        overwrite = confirmOverwrite;
    }

    if (!overwrite) {
        console.log(chalk.yellow('⚠️ Project creation canceled'));
        process.exit(0);
    }
}

async function collectVariableValues(
    metadata: TemplateMetadata,
    options: CreateOptions
): Promise<Record<string, string>> {
    const variableValues: Record<string, string> = {
        projectName: path.basename(options.directory || ''),
        currentYear: new Date().getFullYear().toString(),
    };

    if (options.vars) {
        try {
            Object.assign(variableValues, JSON.parse(options.vars));
        } catch (error) {
            console.error(chalk.red('❌ Error parsing variables JSON:'), error);
            process.exit(1);
        }
    }

    if (!metadata.variables?.length) {
        return variableValues;
    }

    if (options.yes) {
        return handleYesModeVariables(metadata.variables, variableValues);
    }

    return await promptForVariables(metadata.variables, variableValues);
}

async function handleYesModeVariables(
    variables: TemplateVariable[],
    existingValues: Record<string, string>
): Promise<Record<string, string>> {
    const variableValues = { ...existingValues };

    for (const variable of variables) {
        if (variableValues[variable.name] === undefined) {
            if (variable.required && variable.default === undefined) {
                console.error(
                    chalk.red(
                        `❌ Required variable "${variable.name}" has no default and none provided`
                    )
                );
                process.exit(1);
            }
            if (variable.default !== undefined) {
                variableValues[variable.name] = variable.default;
            }
        }
    }

    return variableValues;
}

async function promptForVariables(
    variables: TemplateVariable[],
    existingValues: Record<string, string>
): Promise<Record<string, string>> {
    const variableValues = { ...existingValues };

    console.log(chalk.blue('\n📝 Template Variables'));

    for (const variable of variables) {
        if (variableValues[variable.name] !== undefined) {
            continue;
        }

        const { value } = await inquirer.prompt([
            {
                type: 'input',
                name: 'value',
                message: `${variable.description || variable.name}:`,
                default: variable.default,
                validate: (input) => {
                    if (variable.required && !input.trim()) {
                        return `${variable.name} is required`;
                    }
                    return true;
                },
            },
        ]);

        variableValues[variable.name] = value;
    }

    return variableValues;
}

async function copyAndProcessTemplate(
    templateDir: string,
    targetDirPath: string,
    variableValues: Record<string, string>
): Promise<void> {
    await fs.copy(templateDir, targetDirPath, {
        filter: (src) => !src.endsWith('.template-meta.json'),
    });

    if (Object.keys(variableValues).length > 0) {
        console.log(chalk.blue('\n🔄 Processing template variables...'));
        await processDirectoryReplacements(targetDirPath, variableValues);
        console.log(chalk.green('✅ Variables processed successfully'));
    }
}

async function handlePostCreationScripts(
    metadata: TemplateMetadata,
    targetDirPath: string,
    options: CreateOptions
): Promise<void> {
    if (!metadata.postCreationScripts?.length || options.skipScripts) {
        return;
    }

    const selectedScripts = await selectPostCreationScripts(
        metadata.postCreationScripts,
        options.yes
    );

    if (selectedScripts.length > 0) {
        await executePostCreationScripts(metadata.postCreationScripts, {
            cwd: targetDirPath,
            selectedScripts,
        });
    } else {
        console.log(chalk.blue('📝 No post-creation scripts to run'));
    }
}

async function selectPostCreationScripts(
    scripts: PostCreationScript[],
    skipPrompt: boolean
): Promise<string[]> {
    if (skipPrompt) {
        return scripts.filter((script) => script.runByDefault).map((script) => script.name);
    }

    console.log(chalk.blue('\n🛠️ Post-Creation Scripts'));

    const { scripts: selectedScripts } = await inquirer.prompt([
        {
            type: 'checkbox',
            name: 'scripts',
            message: 'Select scripts to run:',
            choices: scripts.map((script) => ({
                name: `${script.name} (${script.description || script.command})`,
                value: script.name,
                checked: script.runByDefault,
            })),
        },
    ]);

    return selectedScripts;
}
