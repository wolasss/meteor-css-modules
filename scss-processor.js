import path from 'path';
import fs from 'fs';
import IncludedFile from './included-file';
import ImportPathHelpers from './helpers/import-path-helpers';
import logger from './logger';
import sass from 'sass-embedded';
import url from 'url';

export default class ScssProcessor {
  constructor(pluginOptions) {
    this.fileCache = {};
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
        console.error(err);

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
    const { css, sourceMap } = this._transpile(sourceFile);
    file.contents = css;
    file.sourceMap = sourceMap;
    file.isPreprocessed = true;
  }

  _wrapFileForNodeSass(file) {
    return { path: file.importPath, contents: file.rawContents, file: file };
  }

  _transpile(sourceFile) {
    const sassOptions = {
      sourceMap: true,
      sourceMapIncludeSources: true,
      charset: 'utf-8',
      loadPaths: [],
      verbose: true,
      importers: [{
        findFileUrl(_url) {
            if (!decodeURI(_url).startsWith('{}')) return null;
            const finalPath = process.cwd().toString() + decodeURI(_url).substring(2).toString();

            return new URL(url.pathToFileURL(finalPath));
        }
      }]
    };

    const { css, sourceMap } = sass.compileString(sourceFile.contents, sassOptions);

    return { css, sourceMap };
  }
};
