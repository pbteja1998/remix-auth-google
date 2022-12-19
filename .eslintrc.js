module.exports = {
  extends: 'galex',
  rules: {
    '@typescript-eslint/explicit-member-accessibility': [
      'error',
      {
        accessibility: 'explicit',
        overrides: {
          accessors: 'explicit',
          constructors: 'no-public',
          methods: 'explicit',
          properties: 'explicit',
          parameterProperties: 'explicit',
        },
      },
    ],
    '@typescript-eslint/no-throw-literal': 'off',
    'sonarjs/no-duplicate-string': 'off',
    'sonarjs/elseif-without-else': 'off',
  },
}
