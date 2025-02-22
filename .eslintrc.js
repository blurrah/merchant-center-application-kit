module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 8,
    sourceType: 'module',
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:jest/recommended',
    'plugin:react/recommended',
    'plugin:testing-library/react',
    'prettier',
    'prettier/react',
    'prettier/@typescript-eslint',
  ],
  plugins: [
    'import',
    'jest',
    'jsx-a11y',
    'prettier',
    'react',
    'react-hooks',
    'graphql',
    '@typescript-eslint/eslint-plugin',
  ],
  rules: {
    '@typescript-eslint/ban-types': 0,
    '@typescript-eslint/naming-convention': 0,
    '@typescript-eslint/consistent-type-definitions': 0,
    '@typescript-eslint/no-explicit-any': 2,
    '@typescript-eslint/no-use-before-define': [
      'error',
      {
        functions: false,
      },
    ],
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/unbound-method': 0,
    'react/jsx-tag-spacing': 0,
    'import/no-extraneous-dependencies': 0,
    'import/no-named-as-default': 0,
    'import/no-named-as-default-member': 0,
    'import/default': 0,
    'import/no-unresolved': 2,
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'jest/expect-expect': 'off',
    'testing-library/prefer-presence-queries': 'error',
    'testing-library/await-async-query': 'error',
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.js', '.jsx', '.ts', '.tsx'],
    },
    'import/resolver': {
      'eslint-import-resolver-typescript': true,
      typescript: {},
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  overrides: [
    {
      files: ['*.spec.js'],
      rules: {
        'react/display-name': 0,
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/ban-ts-comment': 0,
        '@typescript-eslint/explicit-function-return-type': 0,
        '@typescript-eslint/explicit-member-accessibility': [
          2,
          {
            accessibility: 'no-public',
          },
        ],
        '@typescript-eslint/no-require-imports': 0,
        '@typescript-eslint/promise-function-async': 0,
        'react/prop-types': 0,
      },
    },
    {
      files: ['**/*.mc.graphql'],
      rules: {
        'graphql/template-strings': [
          'error',
          {
            env: 'literal',
            schemaJson: require('./schemas/mc.json'),
          },
        ],
      },
    },
    {
      files: ['**/*.ctp.graphql'],
      rules: {
        'graphql/template-strings': [
          'error',
          {
            env: 'literal',
            schemaJson: require('./schemas/ctp.json'),
          },
        ],
      },
    },
    {
      files: ['**/*.settings.graphql'],
      rules: {
        'graphql/template-strings': [
          'error',
          {
            env: 'literal',
            schemaJson: require('./schemas/settings.json'),
          },
        ],
      },
    },
    {
      files: ['**/*.proxy.graphql'],
      rules: {
        'graphql/template-strings': [
          'error',
          {
            env: 'literal',
            schemaJson: require('./schemas/proxy.json'),
          },
        ],
      },
    },
  ],
};
