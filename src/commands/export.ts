import chalk from 'chalk';
import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { getTemplatesDir, getTemplateMeta } from '../utils/fileUtils.js';
import { encodeTemplate } from '../utils/qstUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ExportOptions {
    output?: string;
}

export function exportCommand(program: Command) {
    program
        .command('export <template>')
        .description('Export a template as a .qst file')
        .option('-o, --output <path>', 'Output file path')
        .action(async (templateName: string, options: ExportOptions) => {
            try {
                await handleExportCommand(templateName, options);
            } catch (error) {
                console.error(chalk.red('❌ Error exporting template:'), error);
                process.exit(1);
            }
        });
}

async function handleExportCommand(templateName: string, options: ExportOptions) {
    console.log(chalk.blue(`🚀 Exporting template "${templateName}" as .qst file`));

    const templatesDir = await getTemplatesDir();
    const templateDir = path.join(templatesDir, templateName);

    if (!(await fs.pathExists(templateDir))) {
        console.error(chalk.red(`❌ Template "${templateName}" not found`));
        process.exit(1);
    }

    const metadata = await getTemplateMeta(templateDir);
    
    const outputPath = options.output || path.join(process.cwd(), `${templateName}.qst`);
    
    await encodeTemplate(templateDir, metadata, outputPath);
    
    console.log(chalk.green(`✅ Template exported successfully to ${outputPath}`));
    console.log(chalk.blue(`💡 Use 'quickstart import ${path.basename(outputPath)}' to import this template`));
}