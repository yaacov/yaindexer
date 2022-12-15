[![npm version](https://badge.fury.io/js/yaindexer.svg)](https://badge.fury.io/js/yaindexer)

# yaindexer
Yet another typescript indexer

yaindexer is a tool that create index files for typescript and javascrpt code.

## Usage

Use a source code directory without index files, and add automatically generated index files.

``` bash
npm install --location=global yaindexer

# add npm bin path to your PATH, or use full
# excutable path, e.g. $(npm bin --location=global)/crdtoapi
yaindexer --help

# add index files for your project
yaindexer -i ./src

# add index files for your project and overwrite the current index files
# with new version
yaindexer --overwrite -i ./src

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
