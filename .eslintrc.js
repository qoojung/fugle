module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
  },
  overrides: [
    {
      files: ['tests/**/*'],
      plugins: ['jest'],
      env: {
        'jest/globals': true,
      },
    },
  ],
};
