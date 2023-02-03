[![npm version](https://badge.fury.io/js/yaindexer.svg)](https://badge.fury.io/js/yaindexer)

# yaIndexer
Yet another typescript indexer

yaIndexer and yaImportIndexer are tools that create index files for typescript and javascrpt code,

yaIndexer will automatically generate index.ts files with export-values from a list of files or folders.

yaImportIndexer will go over an application using a library and look for imports from this library. It will collect all the imports and create one index file that exports all the methods used in the code.

## Usage

### yaImportIndexer

Use source code of an app using a package, and automatically collect all imports from that package.

``` bash
npm install --location=global yaindexer

# add npm bin path to your PATH, or use full
# excutable path, e.g. $(npm bin --location=global)/crdtoapi
yaImportIndexer --help

# fetch all imports from @kubev2v/common package and collect them in
# one index.ts file
yaImportIndexer -i ./src -l @kubev2v/common
```

### yaIndexer

Use a source code directory without index files, and add automatically generated index files.

``` bash
npm install --location=global yaindexer

# add npm bin path to your PATH, or use full
# excutable path, e.g. $(npm bin --location=global)/crdtoapi
yaIndexer --help

# add index files for your project
yaIndexer -i ./src

# add index files for your project and overwrite the current index files
# with new version
yaIndexer --overwrite -i ./src

# delete all index files in a project
find . -name "index.ts" -type f | xargs rm
```

## Build

Run this scripts to lint and publish the package.

``` bash
npm install
npm run lint:fix
npm run build
npm publish
```

## Other tools for auto generation of index files

https://www.npmjs.com/package/generate-index-file

https://github.com/gajus/create-index

https://github.com/cycloidio/import-index-generator

https://github.com/Jordan-Eckowitz/indexify-vscode-extension

https://github.com/fjc0k/vscode-generate-index
