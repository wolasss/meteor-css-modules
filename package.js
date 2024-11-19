/* globals Package */
Package.describe({
    name: 'wolas:scss-modules-linux-x64',
    version: '7.0.10',
    summary: 'CSS modules implementation. CSS for components!',
    git: 'https://github.com/wolasss/meteor-css-modules',
    documentation: 'README.md'
});

Package.registerBuildPlugin({
    name: 'scss-modules',
    use: [
        'babel-compiler@7.11.1',
        'ecmascript@0.16.9',
        'caching-compiler@2.0.1'
    ],
    npmDependencies: {
        'app-module-path': '2.2.0',
        'camelcase': '8.0.0',
        'cjson': '0.5.0',
        'css-modules-loader-core': '1.1.0',
        'json-to-regex': '0.0.2',
        'es6-template-strings': '2.0.1',
        'postcss': '8.4.47',
        'postcss-modules-local-by-default': '4.0.5',
        'postcss-modules-extract-imports': '3.1.0',
        'postcss-modules-scope': '3.2.0',
        'postcss-modules-values': '4.0.0',
        'ramda': '0.30.1',
        'sass-embedded': '1.58.3',
        'sass-embedded-linux-x64': '1.80.7',
        'recursive-readdir': '2.2.3',
        'string-template': '1.0.0',
        '@babel/runtime': '7.17.2',
        'sass-embedded': '1.80.5'
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
    api.versionsFrom(['1.6.1', '2.3', '3.0']);
    api.use('isobuild:compiler-plugin@1.0.0');
    api.use([
        'ecmascript@0.16.9',
    ]);

    api.mainModule('package/main.js');
});
