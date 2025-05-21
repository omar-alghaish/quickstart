import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import zlib from 'zlib';
import { promisify } from 'util';
import { TemplateMeta } from './fileUtils.js';

const gzipAsync = promisify(zlib.gzip);
const gunzipAsync = promisify(zlib.gunzip);

interface TemplateFile {
    p: string;      // path
    c: string;      // content (base64 for binary)
    d?: boolean;    // isDirectory (omitted if false to save space)
    b?: boolean;    // isBinary (omitted if false to save space)
}

interface ImportedTemplate {
    name: string;
    metadata: TemplateMeta;
    extract: (targetDir: string) => Promise<void>;
}

function isBinaryFile(buffer: Buffer): boolean {
    return buffer.includes(0);
}

/**
 * Encodes a template directory into a .qst file with ultra compression
 * @param templateDir Path to the template directory
 * @param metadata Template metadata
 * @param outputPath Output path for the .qst file
 */
export async function encodeTemplate(
    templateDir: string,
    metadata: TemplateMeta,
    outputPath: string
): Promise<void> {
    const files = await getAllFiles(templateDir);
    
    const templateData = {
        m: {
            n: metadata.name,
            d: metadata.description,
            c: metadata.createdAt,
            v: metadata.variables,
            p: metadata.postCreationScripts
        },
        f: files 
    };
    
    const serialized = JSON.stringify(templateData);
    
    const compressed = await gzipAsync(Buffer.from(serialized), { level: 9 });
    
    await fs.writeFile(outputPath, compressed);
}

/**
 * Decodes a .qst file into a template
 * @param filePath Path to the .qst file
 * @returns Imported template information
 */
export async function decodeTemplate(filePath: string): Promise<ImportedTemplate> {
    const compressedContent = await fs.readFile(filePath);
    
    const decompressed = await gunzipAsync(compressedContent);
    
    const templateData = JSON.parse(decompressed.toString());
    
    const minMetadata = templateData.m;
    const metadata: TemplateMeta = {
        name: minMetadata.n,
        description: minMetadata.d,
        createdAt: minMetadata.c,
        variables: minMetadata.v || [],
        postCreationScripts: minMetadata.p || []
    };
    
    const files = templateData.f;
    
    return {
        name: metadata.name,
        metadata,
        extract: async (targetDir: string) => {
            for (const file of files) {
                if (file.d) {
                    await fs.ensureDir(path.join(targetDir, file.p));
                }
            }
            
            for (const file of files) {
                if (!file.d) {
                    const filePath = path.join(targetDir, file.p);
                    await fs.ensureDir(path.dirname(filePath));
                    
                    if (file.b) {
                        const content = Buffer.from(file.c, 'base64');
                        await fs.writeFile(filePath, content);
                    } else {
                        await fs.writeFile(filePath, file.c);
                    }
                }
            }
            
            await fs.writeJSON(path.join(targetDir, '.template-meta.json'), metadata, { spaces: 2 });
        }
    };
}

/**
 * Gets all files and directories with ultra minimized structure
 * @param dir Directory path
 * @returns Array of ultra-minimized template files
 */
async function getAllFiles(dir: string): Promise<TemplateFile[]> {
    const files: TemplateFile[] = [];
    
    const directories = await glob('**/', {
        cwd: dir,
        dot: true,
    });
    
    for (const directory of directories) {
        files.push({
            p: directory,
            c: '',
            d: true  // Only include isDirectory if true
        });
    }
    
    const fileGlobs = await glob('**/*', {
        cwd: dir,
        dot: true,
        nodir: true,
        ignore: ['.template-meta.json'], // Don't include the metadata file
    });
    
    for (const file of fileGlobs) {
        const filePath = path.join(dir, file);
        const content = await fs.readFile(filePath);
        
        const binary = isBinaryFile(content);
        const fileObj: TemplateFile = {
            p: file,
            c: binary ? content.toString('base64') : content.toString('utf8')
        };
        
        if (binary) {
            fileObj.b = true;
        }
        
        files.push(fileObj);
    }
    
    return files;
}