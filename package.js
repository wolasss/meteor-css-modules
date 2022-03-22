/* globals Package */
Package.describe({
  name: 'wolasss:scss-modules',
  version: '5.0.0',
  summary: 'CSS modules implementation. CSS for components!',
  git: 'https://github.com/wolasss/meteor-css-modules',
  documentation: 'README.md'
});

Package.registerBuildPlugin({
  name: 'mss',
  use: [
    'babel-compiler@7.8.1',
    'ecmascript@0.16.1',
    'caching-compiler@1.2.2',
    'underscore@1.0.10',
  ],
  npmDependencies: {
    'app-module-path': '2.2.0',
    'camelcase': '6.3.0',
    'cjson': '0.5.0',
    'css-modules-loader-core': '1.1.0',
    'json-to-regex': '0.0.2',
    'es6-template-strings': '2.0.1',
    'hasha': '3.0.0',
    'lru-cache': '4.1.5',
    'postcss': '8.4.6',
    'postcss-modules-local-by-default': '4.0.0',
    'postcss-modules-extract-imports': '3.0.0',
    'postcss-modules-scope': '3.0.0',
    'postcss-modules-values': '2.0.0',
    'ramda': '0.19.0',
    'recursive-readdir': '2.2.2',
    'node-sass': '7.0.1',
    'shorthash': '0.0.2',
    '@babel/runtime': '7.17.8',
    '@babel/plugin-transform-template-literals': '7.16.7',
    'string-template': '1.0.0',
  },
  sources: [
    'sha1.js',
    'logger.js',
    'text-replacer.js',
    'included-file.js',
    'get-output-path.js',
    'options.js',
    'helpers/import-path-helpers.js',
    'helpers/profile.js',
    'postcss-plugins.js',
    'scss-processor.js',
    'css-modules-processor.js',
    'css-modules-build-plugin.js',
    'plugin.js'
  ]
});

Package.onUse(function (api) {
  api.versionsFrom('1.6.1');
  api.use('isobuild:compiler-plugin@1.0.0');
  api.use([
    'ecmascript@0.16.1',
  ]);

  api.mainModule('package/main.js');
});
