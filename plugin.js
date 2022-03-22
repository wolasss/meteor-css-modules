/* globals Plugin */
import CssModulesBuildPlugin from './css-modules-build-plugin';
import pluginOptionsWrapper from './options';
import ImportPathHelpers from './helpers/import-path-helpers';

const pluginOptions = pluginOptionsWrapper.options;

ImportPathHelpers.init(Plugin);

global.cssModules = global.cssModules || {};
global.cssModules.compiler = new CssModulesBuildPlugin(Plugin);

Plugin.registerCompiler({
    extensions: ['scss', 'sass'],
    archMatching: pluginOptions.specificArchitecture || [],
    filenames: pluginOptions.filenames || []
}, function() {
    return global.cssModules.compiler;
});
