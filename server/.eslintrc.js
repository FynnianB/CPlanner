module.exports = {
  env: {
    commonjs: true,
    es2020: true,
    node: true,
    mocha: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 11,
  },
  rules: {
    'max-len': 0,
    'linebreak-style': 0,
    'no-console': 0,
    'no-underscore-dangle': 0,
    'no-unused-vars': 0,
  },
};
