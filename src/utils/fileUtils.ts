// src/utils/fileUtils.ts - Utility functions for file operations
import fs from 'fs-extra';
import os from 'os';
import path from 'path';

// Get the templates directory
export async function getTemplatesDir(): Promise<string> {
    const homeDir = os.homedir();
    const templatesDir = path.join(homeDir, '.quickstart', 'templates');
    await fs.ensureDir(templatesDir);
    return templatesDir;
}

// Create templates directory if it doesn't exist
export async function createTemplatesDir(): Promise<string> {
    const templatesDir = await getTemplatesDir();
    return templatesDir;
}
