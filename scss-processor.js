import path from 'path';
import fs from 'fs';
import IncludedFile from './included-file';
import ImportPathHelpers from './helpers/import-path-helpers';
import logger from './logger';
import sass from 'node-sass';
import { promisify } from 'util';
import LRU from 'lru-cache';
import { Meteor } from 'meteor/meteor';

const compileSass = promisify(sass.render);

export default class ScssProcessor {
    constructor(pluginOptions) {
        this.fileCache = new LRU({
            size: 1024 * 1024 * 10
        });
        this.filesByName = null;
        this.pluginOptions = pluginOptions;
        this.sass = sass;
    }

    isRoot(inputFile) {
        const fileOptions = inputFile.getFileOptions();
        if (fileOptions.hasOwnProperty('isImport')) {
            return !fileOptions.isImport;
        }

        return !hasUnderscore(inputFile.getPathInPackage());

        function hasUnderscore(file) {
            return path.basename(file)[0] === '_';
        }
    }

    shouldProcess(file) {
        const sassCompilationExtensions = this.pluginOptions.enableSassCompilation;
        if (!sassCompilationExtensions || typeof sassCompilationExtensions === 'boolean') {
            return sassCompilationExtensions;
        }

        return sassCompilationExtensions.some((extension) => file.getPathInPackage().endsWith(extension));
    }

    async process(file, filesByName) {
        this.filesByName = filesByName;
        try {
            await this._process(file);
        } catch (err) {
            const numberOfAdditionalLines = this.pluginOptions.globalVariablesTextLineCount
                ? this.pluginOptions.globalVariablesTextLineCount + 1
                : 0;
            const adjustedLineNumber = err.line - numberOfAdditionalLines;
            logger.error(`\n/~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`);
            logger.error(`Processing Step: SCSS compilation`);
            logger.error(`Unable to compile ${file.importPath}\nLine: ${adjustedLineNumber}, Column: ${err.column}\n${err}`);
            logger.error(`\n/~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`);
            throw err;
        }
    }

    async _process(file) {
        if (file.isPreprocessed) return;

        if (this.pluginOptions.enableDebugLog) {
            console.log(`***\nSCSS process: ${file.importPath}`);
        }
        const sourceFile = this._wrapFileForNodeSass(file);
        const { css, sourceMap } = await this._transpile(sourceFile);
        file.contents = css;
        file.sourceMap = sourceMap;
        file.isPreprocessed = true;
    }

    _wrapFileForNodeSass(file) {
        return { path: file.importPath, contents: file.rawContents, file: file };
    }

    async _transpile(sourceFile) {
        const sassOptions = {
            sourceMap: Meteor.isProduction ? false : true,
            sourceMapContents: true,
            sourceMapEmbed: false,
            sourceComments: false,
            sourceMapRoot: '.',
            omitSourceMapUrl: true,
            indentedSyntax: sourceFile.file.getExtension() === 'sass',
            outFile: `.${sourceFile.file.getBasename()}`,
            importer: this._importFile.bind(this, sourceFile),
            includePaths: [],
            file: sourceFile.path,
            data: sourceFile.contents
        };

        /* Empty options.data workaround from fourseven:scss */
        if (!sassOptions.data.trim()) {
            sassOptions.data = '$fakevariable : blue;';
        }

        const output = await compileSass(sassOptions);
        return { css: output.css.toString('utf-8'), sourceMap: JSON.parse(output.map.toString('utf-8')) };
    }

    _importFile(rootFile, sourceFilePath, relativeTo) {
        try {
            if (this.pluginOptions.enableDebugLog) {
                console.log(`***\nImport: ${sourceFilePath}\n rootFile: ${rootFile}`);
            }
            let importPath = ImportPathHelpers.getImportPathRelativeToFile(sourceFilePath, relativeTo);
            importPath = !importPath.endsWith('.scss') ? importPath + '.scss' : importPath;

            let inputFile = this.filesByName.get(importPath);
            if (inputFile) {
                rootFile.file.referencedImportPaths.push(importPath);
            } else {
                console.log('creating included file');
                inputFile = this._createIncludedFile(importPath, rootFile);
            }

            return this._wrapFileForNodeSassImport(inputFile, importPath);
        } catch (err) {
            return err;
        }
    }

    _createIncludedFile(importPath, rootFile) {
        const file = new IncludedFile(importPath, rootFile);
        file.prepInputFile();
        this.filesByName.set(importPath, file);

        return file;
    }

    _wrapFileForNodeSassImport(file, importPath) {
        return { contents: file.rawContents, file: file.importPath || importPath };
    }
};
