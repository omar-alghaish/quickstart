import fs from 'fs-extra';
import { glob } from 'glob';
import os from 'os';
import path from 'path';

export interface TemplateVariable {
    name: string;
    description: string;
    default?: string;
    required?: boolean;
}

export interface PostCreationScript {
    name: string;
    command: string;
    description?: string;
    runByDefault?: boolean;
}

export interface TemplateMeta {
    name: string;
    description?: string;
    createdAt: string;
    variables: TemplateVariable[];
    postCreationScripts: PostCreationScript[];
}

export async function getTemplatesDir(): Promise<string> {
    const homeDir = os.homedir();
    const templatesDir = path.join(homeDir, '.quickstart', 'templates');
    await fs.ensureDir(templatesDir);
    return templatesDir;
}

export async function createTemplatesDir(): Promise<string> {
    const templatesDir = await getTemplatesDir();
    return templatesDir;
}

export async function getTemplateMeta(templateDir: string): Promise<TemplateMeta> {
    const metadataPath = path.join(templateDir, '.template-meta.json');
    if (await fs.pathExists(metadataPath)) {
        return await fs.readJSON(metadataPath);
    }
    return {
        name: path.basename(templateDir),
        createdAt: new Date().toISOString(),
        variables: [],
        postCreationScripts: [],
    };
}

export async function processFileReplacements(
    filePath: string,
    replacements: Record<string, string>
): Promise<void> {
    if (!(await fs.pathExists(filePath))) {
        return;
    }
    try {
        const fileContent = await fs.readFile(filePath, 'utf8');
        let newContent = fileContent;
        for (const [key, value] of Object.entries(replacements)) {
            const placeholder = `{{${key}}}`;
            newContent = newContent.split(placeholder).join(value);
        }
        if (newContent !== fileContent) {
            await fs.writeFile(filePath, newContent, 'utf8');
        }
    } catch (error) {
        console.warn(`Warning: Could not process file ${filePath}:`, error);
    }
}

function replaceVariablesInPath(pathStr: string, replacements: Record<string, string>): string {
    let newPath = pathStr;
    for (const [key, value] of Object.entries(replacements)) {
        const placeholder = `{{${key}}}`;
        newPath = newPath.split(placeholder).join(value);
    }
    return newPath;
}

async function renamePaths(
    dirPath: string,
    replacements: Record<string, string>
): Promise<void> {

    const allPaths = await glob('**/*', {
        cwd: dirPath,
        dot: true,
        nodir: true,
    });

    const sortedPaths = allPaths.sort((a, b) => {
        const depthA = a.split(path.sep).length;
        const depthB = b.split(path.sep).length;
        return depthB - depthA; // Descending order
    });

    const renamedPaths = new Set<string>();

    for (const relativePath of sortedPaths) {
        const fullPath = path.join(dirPath, relativePath);

        if (renamedPaths.has(relativePath)) {
            continue;
        }

        const newRelativePath = replaceVariablesInPath(relativePath, replacements);

        if (newRelativePath !== relativePath) {
            const newFullPath = path.join(dirPath, newRelativePath);

            try {
                await fs.ensureDir(path.dirname(newFullPath));

                await fs.move(fullPath, newFullPath);

                for (const otherPath of allPaths) {
                    if (otherPath.startsWith(relativePath + path.sep) || otherPath === relativePath) {
                        renamedPaths.add(otherPath);
                    }
                }

                console.log(`Renamed: ${relativePath} → ${newRelativePath}`);
            } catch (error) {
                console.warn(`Warning: Could not rename ${relativePath} to ${newRelativePath}:`, error);
            }
        }
    }
}

export async function processDirectoryReplacements(
    dirPath: string,
    replacements: Record<string, string>,
    options: { exclude?: string[] } = {}
): Promise<void> {
    await renamePaths(dirPath, replacements);


    const files = await glob('**/*', {
        cwd: dirPath,
        dot: true,
        nodir: true,
        ignore: options.exclude || [],
    });

    for (const file of files) {
        await processFileReplacements(path.join(dirPath, file), replacements);
    }
}