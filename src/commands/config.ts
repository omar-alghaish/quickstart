import chalk from 'chalk';
import { Command } from 'commander';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import os from 'os';
import path from 'path';

interface Config {
    defaultAuthor?: string;
    defaultLicense?: string;
    templatesDir?: string;
    githubToken?: string;
}

interface ConfigOptions {
    get?: string;
    set?: string;
    reset: boolean;
    list: boolean;
}

export function configCommand(program: Command) {
    program
        .command('config')
        .description('Manage configuration settings')
        .option('-g, --get <key>', 'Get a configuration value')
        .option('-s, --set <key=value>', 'Set a configuration value')
        .option('-r, --reset', 'Reset configuration to defaults')
        .option('-l, --list', 'List all configuration values')
        .action(async (options: ConfigOptions) => {
            try {
                await handleConfigCommand(options);
            } catch (error) {
                console.error(chalk.red('❌ Error managing configuration:'), error);
                process.exit(1);
            }
        });
}

async function handleConfigCommand(options: ConfigOptions) {
    const configPath = getConfigPath();
    
    if (options.reset) {
        await resetConfig(configPath);
        return;
    }
    
    if (options.get) {
        await getConfig(configPath, options.get);
        return;
    }
    
    if (options.set) {
        await setConfig(configPath, options.set);
        return;
    }
    
    if (options.list) {
        await listConfig(configPath);
        return;
    }
    
    // Interactive configuration
    await interactiveConfig(configPath);
}

function getConfigPath(): string {
    return path.join(os.homedir(), '.quickstart', 'config.json');
}

async function loadConfig(configPath: string): Promise<Config> {
    if (await fs.pathExists(configPath)) {
        return await fs.readJSON(configPath);
    }
    return {};
}

async function saveConfig(configPath: string, config: Config): Promise<void> {
    await fs.ensureFile(configPath);
    await fs.writeJSON(configPath, config, { spaces: 2 });
}

async function resetConfig(configPath: string) {
    await fs.remove(configPath);
    console.log(chalk.green('✅ Configuration reset to defaults'));
}

async function getConfig(configPath: string, key: string) {
    const config = await loadConfig(configPath);
    const value = config[key as keyof Config];
    
    if (value !== undefined) {
        console.log(value);
    } else {
        console.log(chalk.yellow(`⚠️ Configuration key "${key}" not found`));
    }
}

async function setConfig(configPath: string, keyValue: string) {
    const [key, ...valueParts] = keyValue.split('=');
    const value = valueParts.join('=');
    
    if (!key || !value) {
        console.error(chalk.red('❌ Invalid format. Use: key=value'));
        process.exit(1);
    }
    
    const config = await loadConfig(configPath);
    (config as any)[key] = value;
    await saveConfig(configPath, config);
    
    console.log(chalk.green(`✅ Set ${key} = ${value}`));
}

async function listConfig(configPath: string) {
    const config = await loadConfig(configPath);
    
    if (Object.keys(config).length === 0) {
        console.log(chalk.yellow('⚠️ No configuration values set'));
        return;
    }
    
    console.log(chalk.blue('📋 Configuration:'));
    for (const [key, value] of Object.entries(config)) {
        console.log(chalk.green(`${key}: ${value}`));
    }
}

async function interactiveConfig(configPath: string) {
    const config = await loadConfig(configPath);
    
    console.log(chalk.blue('⚙️  Interactive Configuration'));
    
    const { defaultAuthor, defaultLicense, templatesDir } = await inquirer.prompt([
        {
            type: 'input',
            name: 'defaultAuthor',
            message: 'Default author name:',
            default: config.defaultAuthor || '',
        },
        {
            type: 'input',
            name: 'defaultLicense',
            message: 'Default license:',
            default: config.defaultLicense || 'MIT',
        },
        {
            type: 'input',
            name: 'templatesDir',
            message: 'Custom templates directory (leave empty for default):',
            default: config.templatesDir || '',
        },
    ]);
    
    const newConfig: Config = {
        ...config,
        defaultAuthor: defaultAuthor || undefined,
        defaultLicense: defaultLicense || undefined,
        templatesDir: templatesDir || undefined,
    };
    
    Object.keys(newConfig).forEach(key => {
        if ((newConfig as any)[key] === undefined || (newConfig as any)[key] === '') {
            delete (newConfig as any)[key];
        }
    });
    
    await saveConfig(configPath, newConfig);
    console.log(chalk.green('✅ Configuration saved'));
}