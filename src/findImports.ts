#!/usr/bin/env node

import { Command } from 'commander';
import { readdir, lstat } from 'fs/promises';
import path from 'path';
import { readFileSync, writeFileSync } from 'fs';

const DEFAULT_OUTPUT = 'index.ts';
const DEFAULT_COMMENT = '// Auto generated index file.\n//  see: https://github.com/yaacov/yaindexer';

/**
 * Define the CLI options
 */
const program = new Command();
program
  .version("0.0.6")
  .description("Find imports in src files")
  .option("-i, --in <dir>", "Input directory path - required")
  .option("-l, --library <text>", "search for imports from this library")
  .option("--output <filename>", "Output filename")
  .option("-c, --comment <text>", "Add comment on top of index file")
  .parse(process.argv);

const options = program.opts();

// Ceck for required fields
if (!options.library) {
    console.log("error: missing mandatory argument --library");
    process.exit(1);
}

if (!options.in) {
    console.log("error: missing mandatory argument --in");
    process.exit(1);
}

// Set default values
if (!options.output) {
    options.output = DEFAULT_OUTPUT;
}

if (!options.comment) {
    options.comment = DEFAULT_COMMENT;
}
// Replace \n with EOL
options.comment = options.comment.replace(/\\n/g, '\n');

const importsDict = Object();

/**
 * findImports read all code files in a directory
 * and dump import statments found
 * 
 * @param dirPath is the directory to read
 */
const findImports = async (dirPath: string) => {
    try {
        const files = await readdir(dirPath);    
        for (const file of files) {
            // Check file stats
            const filePath = path.join(dirPath, file);
            const ext = path.extname(file);

            const stat = await lstat(filePath);
            const isDir = stat.isDirectory();
            
            if (!isDir && ['.ts', '.tsx'].includes(ext)) {
                const fileCode = readFileSync(filePath).toString();

                const regex = /import {([^;]+)} from '(.+)';/g;
                const matches = fileCode.matchAll(regex);

                for (const match of matches) {   
                    const key = match[2];
                    const cleanWords = (word: string) => word.replace(/as [^,]+/g, '').trim();
                    const filterWords = (word: string) => word !== '';

                    const words = match[1]
                        .split(',')
                        .map(cleanWords)
                        .filter(filterWords);          

                    if (importsDict[key]) {
                        importsDict[key].push(...words);
                    } else {
                        importsDict[key] = words;
                    }
                }
            }

            // Index sub directories
            if (isDir) {
                await findImports(filePath);
            }
        }
    } catch (error) {
       console.log(`error occurr ed while reading the input directory (${error})`);
       process.exit(1);
    }
};

findImports(options.in).then(() => {
    let fileTxt = options.comment + '\n\n';

    // Read imports
    for (const key in importsDict) {
        if (key.startsWith(options.library)) {
            const from = key.replace(options.library, '.');
            const wordsSet = new Set(importsDict[key]);
            const worlds = [...wordsSet].join(', ');

            const newLine = `export { ${worlds} } from '${from}';`;
            fileTxt = fileTxt + newLine + '\n';
        }
    }

    // Write index file
    writeFileSync(options.output, fileTxt);
});
