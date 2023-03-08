/* globals Package */
Package.describe({
    name: 'wolas:scss-modules',
    version: '6.2.1',
    summary: 'CSS modules implementation. CSS for components!',
    git: 'https://github.com/wolasss/meteor-css-modules',
    documentation: 'README.md'
});

Package.registerBuildPlugin({
    name: 'scss-modules',
    use: [
        'babel-compiler@7.10.3',
        'ecmascript@0.16.6',
        'caching-compiler@1.2.2'
    ],
    npmDependencies: {
        'app-module-path': '2.2.0',
        'camelcase': '7.0.1',
        'cjson': '0.5.0',
        'css-modules-loader-core': '1.1.0',
        'json-to-regex': '0.0.2',
        'es6-template-strings': '2.0.1',
        'postcss': '8.4.21',
        'postcss-modules-local-by-default': '4.0.0',
        'postcss-modules-extract-imports': '3.0.0',
        'postcss-modules-scope': '3.0.0',
        'postcss-modules-values': '2.0.0',
        'ramda': '0.28.0',
        'sass-embedded': '1.58.3',
        'recursive-readdir': '2.2.3',
        'string-template': '1.0.0',
        '@babel/runtime': '7.17.2',
        'node-sass': '8.0.0',
        'lru-cache': '6.0.0'
    },
    sources: [
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
        'plugin.js',
        'utils.js'
    ]
});

Package.onUse(function (api) {
    api.versionsFrom('1.6.1');
    api.use('isobuild:compiler-plugin@1.0.0');
    api.use([
        'ecmascript@0.16.6',
    ]);

    api.mainModule('package/main.js');
});
