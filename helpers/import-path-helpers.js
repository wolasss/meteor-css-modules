import cjson from 'cjson';
import path from 'path';
import fs from 'fs';

let basePath = getBasePath(process.cwd().replace(/\\/g, '/'));

function getBasePath(directory) {
  if (fs.existsSync(path.join(directory, '.meteor'))) {
    return directory;
  }
  const pathAbove = path.resolve(directory, '..');
  if (pathAbove === directory) {
    console.warn('No .meteor directory found in the path tree; ImportPathHelpers.basePath must be set manually.');
    return null;
  }
  return getBasePath(pathAbove);
}

function getAbsoluteImportPath(relativePath) {
  if (path.isAbsolute(relativePath)) {
    return relativePath.replace(/\\/g, '/');
  }

  return path.join(basePath, relativePath).replace(/\\/g, '/');
}

export default {
  init: function() {
  },

  get basePath() {
    return basePath;
  },

  set basePath(newPath) {
    basePath = newPath;
  },

  getImportPathInPackage: function getImportPathInPackage(inputFile) {
    if (inputFile.getPathInPackage().indexOf(basePath) === 0) {
      return inputFile.getPathInPackage();
    }

    if (inputFile.getPackageName() === null) {
      return path.join(basePath, inputFile.getPathInPackage()).replace(/\\/g, '/');
    }
    return path.join(basePath, 'packages', inputFile.getPackageName().replace(':', '_'), inputFile.getPathInPackage()).replace(/\\/g, '/');
  },

  getAbsoluteImportPath,

  getAppRelativeImportPath: function getAppRelativeImportPath(absolutePath) {
    return '/' + path.relative(basePath, absolutePath).replace(/\\/g, '/');
  },

  getImportPathRelativeToFile: function getRealImportPath(importPath, relativeTo) {
    importPath = importPath.replace(/^["']|["']$/g, '');
    if (importPath[0] === '~') {
      return getModulePath(importPath.substring(1));
    }

    if (importPath[0] === '/') {
      return getAbsoluteImportPath(importPath.substring(1))
    }

    // Fix relative paths that don't start with ./
    if (['.', '/', '~', '{'].indexOf(importPath[0]) === -1 && !importPath.match(/^([A-Za-z]:|meteor\/)/)) {
      importPath = './' + importPath;
    }

    if (importPath[0] === '.') {
      importPath = path.join(path.dirname(relativeTo), importPath);
    }

    importPath = convertCurlySyntaxToAbsolutePath(importPath);
    importPath = convertMeteorPackageSyntaxToAbsolutePath(importPath);

    return importPath.replace(/\\/g, '/');

    function getModulePath(importPath) {
      const nodeModulesDir = `${basePath}/node_modules`;
      if (importPath.match(/\//)) {
        return `${nodeModulesDir}/${importPath}`;
      }

      const modulePath = `${nodeModulesDir}/${importPath}`;
      const mainFile = cjson.load(`${modulePath}/package.json`).main;
      return `${modulePath}/${mainFile}`;
    }

    function convertCurlySyntaxToAbsolutePath(importPath) {
      let accPosition = importPath.indexOf('{');
      if (accPosition === -1) {
        return importPath;
      }

      importPath = importPath.substr(accPosition, importPath.length);
      if (importPath.indexOf('{}') === 0) {
        return path.join(basePath, importPath.substring(2));
      }

      return path.join(basePath, 'packages/' + importPath.replace(/\{(.*?):(.*?)}/, '$1_$2').replace(/\{(.*?)}/, '$1'));
    }

    function convertMeteorPackageSyntaxToAbsolutePath(importPath) {
      const packageNameMatch = importPath.match(/^meteor\/(.*?)\//);
      if (!packageNameMatch) {
        return importPath;
      }

      const packageName = packageNameMatch[1];
      const packageOnDisk = packageName.replace(':', '_');
      const pathInPackage = importPath.substring(packageNameMatch[0].length);
      return path.join(basePath, `packages/${packageOnDisk}/${pathInPackage}`);
    }
  }
};
