import chalk from 'chalk';
import { exec } from 'child_process';
import { promisify } from 'util';
import { PostCreationScript } from './fileUtils.js';

const execPromise = promisify(exec);

interface ExecError extends Error {
    stderr?: string;
    stdout?: string;
    code?: number;
}

export async function executeCommand(
    command: string,
    options: { cwd?: string; silent?: boolean } = {}
): Promise<{ stdout: string; stderr: string }> {
    const { cwd = process.cwd(), silent = false } = options;

    if (!silent) {
        console.log(chalk.blue(`🔄 Running: ${command}`));
    }

    try {
        const result = await execPromise(command, { cwd });

        if (!silent && result.stdout && result.stdout.trim() !== '') {
            console.log(chalk.gray(result.stdout.trim()));
        }

        return result;
    } catch (error) {
        if (!silent) {
            console.error(chalk.red(`❌ Command failed: ${command}`));
            console.error(chalk.red((error as ExecError).stderr || (error as Error).message));
        }
        throw error;
    }
}

export async function executePostCreationScripts(
    scripts: PostCreationScript[],
    options: { cwd: string; selectedScripts?: string[] }
): Promise<void> {
    const { cwd, selectedScripts } = options;

    if (!scripts || scripts.length === 0) {
        return;
    }

    console.log(chalk.blue('🔄 Running post-creation scripts...'));

    for (const script of scripts) {
        if (selectedScripts && !selectedScripts.includes(script.name)) {
            continue;
        }

        try {
            console.log(chalk.blue(`🔄 Running script: ${script.name}`));
            if (script.description) {
                console.log(chalk.gray(`   ${script.description}`));
            }

            await executeCommand(script.command, { cwd });
            console.log(chalk.green(`✅ Script completed: ${script.name}`));
        } catch (error) {
            console.error(chalk.red(`❌ Script failed: ${script.name}`));
        }
    }

    console.log(chalk.green('✅ All selected post-creation scripts completed'));
}
