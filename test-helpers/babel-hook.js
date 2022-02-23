const register = require('@babel/register').default;

register({ presets: [
    [
              "@babel/preset-env"
    ]
],
plugins: [
  '@babel/plugin-proposal-object-rest-spread',
  '@babel/plugin-transform-destructuring',
  'syntax-async-functions',
  'syntax-async-generators',
  'transform-regenerator'
] });
