#!/usr/bin/env node

import { Command } from 'commander';
import { writeFile, readdir, lstat } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import Mustache from 'mustache';

let regexp: RegExp;
let skipRegexp: RegExp;

const DEFAULT_OUTPUT = 'index.ts';
const DEFAULT_COMMENT = '// Auto generated index file.\n//  see: https://github.com/yaacov/yaindexer';
// eslint-disable-next-line no-useless-escape
const DEFAULT_REGEXP = '^(?!.*test\.ts[x]?).*\.ts[x]?$';
const DEFAULT_SKIP_REGEXP = '';
const DEFAULT_EXPORT_LINE_TEMPLATE = "export * from './{{name}}';\n"

/**
 * Define the CLI options
 */
const program = new Command();
program
  .version("0.0.6")
  .description("Create index files")
  .option("-i, --in <dir>", "Input directory path - required")
  .option("--output <filename>", "Output filename")
  .option("--template <text>", "Template for export line")
  .option("--overwrite", "Overwrite existing index files")
  .option("-d, --exportDirectories", "Export directoroies in the index files")
  .option("-r, --regexp <regexp>", "Index files matching regexp")
  .option("-s, --skipRegexp <regexp>", "Skip files matching regexp")
  .option("-c, --comment <text>", "Add comment on top of index file")
  .parse(process.argv);

const options = program.opts();

// Ceck for required fields
if (!options.in) {
    console.log("error: missing mandatory argument --in");
    process.exit(1);
}

// Set default values
if (!options.output) {
    options.output = DEFAULT_OUTPUT;
}

if (!options.template) {
    options.template = DEFAULT_EXPORT_LINE_TEMPLATE;
}
// Replace \n with EOL
options.template = options.template.replace(/\\n/g, '\n');

if (!options.comment) {
    options.comment = DEFAULT_COMMENT;
}
// Replace \n with EOL
options.comment = options.comment.replace(/\\n/g, '\n');

if (!options.exportDirectories) {
    options.exportDirectories = false;
}

if (options.regexp === undefined) {
    options.regexp = DEFAULT_REGEXP;
}

if (options.skipRegexp === undefined) {
    options.skipRegexp = DEFAULT_SKIP_REGEXP;
}

try {
    regexp = new RegExp(options.regexp);
    skipRegexp = new RegExp(options.skipRegexp);
} catch (error) {
    console.log(`error occurr parsing regular expression (${error})`);
    process.exit(1);
}

/**
 * Recursivly read all code files in a directory
 * and create index file if indexable file found
 * 
 * @param dirPath is the directory to read
 */
const createIndexFiles = async (dirPath: string) => {
    let fileTxt = "";
    const indexFile = path.join(dirPath, options.output);
    const indexFileExists = existsSync(indexFile);

    try {
        const files = await readdir(dirPath);    
        for (const file of files) {
            // Check file stats
            const filePath = path.join(dirPath, file);
            const ext = path.extname(file);
            const name = path.basename(file, ext);

            const stat = await lstat(filePath);
            const isDir = stat.isDirectory();
            const isIndex = file === 'index.js' || file === 'index.ts';

            // Do we want to export this file/dir ?
            const exportFile =
                !isIndex &&
                (options.exportDirectories || !isDir) &&
                (!options.regexp || regexp.test(filePath)) &&
                (!options.skipRegexp || !skipRegexp.test(filePath));

            // Export file if matching regexps
            if (exportFile) {
                const templateData = {
                    dir: dirPath,
                    file: file,
                    isDir: isDir,
                    ext: ext,
                    name: name,
                }

                fileTxt = fileTxt + Mustache.render(options.template, templateData);
            }

            // Index sub directories
            if (isDir) {
                await createIndexFiles(filePath);
            }
        }

        // Create index file if found an indexable src file
        if ((!indexFileExists || options.overwrite) && fileTxt !== "") {
            fileTxt = options.comment + '\n\n' + fileTxt;

            writeFile(indexFile, fileTxt);
        }
    } catch (error) {
       console.log(`error occurr ed while reading the input directory (${error})`);
       process.exit(1);
    }
};

console.log('Indexing options:')
for (const opt in options) {
    console.log(`  ${opt}: ${options[opt]}`);
}

console.log('')
console.log('Running...')

createIndexFiles(options.in).then(() => { 
    console.log('Done.')
});
