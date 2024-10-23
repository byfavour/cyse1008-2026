module.exports = {
  root: true,
  env: { 
    browser: true, 
    es2020: true, 
    node: true // Ensure compatibility for Node.js-based tools
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true, // Enable JSX parsing
    },
  },
  settings: {
    react: {
      version: 'detect', // Auto-detect React version
    },
    'import/resolver': {
      alias: {
        map: [['src', './src']],
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'], // Support for TS and JS files
      },
    },
  },
  plugins: [
    'perfectionist', 
    'unused-imports', 
    'prettier', 
    'react', 
    'react-hooks'
  ],
  extends: [
    'airbnb', 
    'airbnb/hooks', 
    'prettier'
  ],
  rules: {
    // General Rules
    'no-use-before-define': 'off',
    'no-alert': 'off',
    camelcase: 'off',
    'no-console': 'off',
    'no-unused-vars': 'off',
    'no-nested-ternary': 'off',
    'no-param-reassign': 'off',
    'no-underscore-dangle': 'off',
    'no-restricted-exports': 'off',
    'no-promise-executor-return': 'off',
    'import/prefer-default-export': 'off',

    // React Rules
    'react/react-in-jsx-scope': 'off', // Not required in Next.js
    'react/prop-types': 'off', // Disable prop-types if using TypeScript
    'react/no-children-prop': 'off',
    'react/no-array-index-key': 'off',
    'react/require-default-props': 'off',
    'react/jsx-props-no-spreading': 'off', // Allow prop spreading
    'react/function-component-definition': [
      'off', // Turn off the rule
      {
        namedComponents: 'arrow-function', // Or use 'function-declaration' if preferred
        unnamedComponents: 'arrow-function',
      },
    ],
    'react/jsx-no-duplicate-props': ['warn', { ignoreCase: false }],
    'react/jsx-no-useless-fragment': ['warn', { allowExpressions: true }],
    'react/no-unstable-nested-components': ['warn', { allowAsProps: true }],

    // JSX Accessibility Rules
    'jsx-a11y/anchor-is-valid': 'off',
    'jsx-a11y/control-has-associated-label': 'off',

    // Unused Imports Plugin
    'unused-imports/no-unused-imports': 'warn',
    'unused-imports/no-unused-vars': [
      'warn', 
      { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' }
    ],

    // Perfectionist Plugin Rules (Sorting)
    'perfectionist/sort-exports': [
      'warn', 
      { order: 'asc', type: 'line-length' }
    ],
    'perfectionist/sort-named-imports': [
      'warn', 
      { order: 'asc', type: 'line-length' }
    ],
    'perfectionist/sort-named-exports': [
      'warn', 
      { order: 'asc', type: 'line-length' }
    ],
    'perfectionist/sort-imports': [
      'warn',
      {
        order: 'asc',
        type: 'line-length',
        'newlines-between': 'always',
        groups: [
          'style',
          'type',
          ['builtin', 'external'],
          'custom-mui',
          'custom-routes',
          'custom-hooks',
          'custom-utils',
          'internal',
          'custom-components',
          'custom-sections',
          'custom-auth',
          'custom-types',
          ['parent', 'sibling', 'index'],
          ['parent-type', 'sibling-type', 'index-type'],
          'object',
          'unknown',
        ],
        'custom-groups': {
          value: {
            'custom-mui': '@mui/**',
            'custom-auth': 'src/auth/**',
            'custom-hooks': 'src/hooks/**',
            'custom-utils': 'src/utils/**',
            'custom-types': 'src/types/**',
            'custom-routes': 'src/routes/**',
            'custom-sections': 'src/sections/**',
            'custom-components': 'src/components/**',
          },
        },
        'internal-pattern': ['src/**'],
      },
    ],
  },
};
