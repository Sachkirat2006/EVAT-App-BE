const tseslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');

module.exports = [
    {
        ignores: [
            'node_modules/**',
            'dist/**',
            'coverage/**',

            // Duplicate legacy source tree - excluded from CI analysis
            'src/src/**'
        ]
    },

    {
        files: ['src/**/*.ts'],

        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 2022,
                sourceType: 'module'
            }
        },

        plugins: {
            '@typescript-eslint': tseslint
        },

        rules: {
            // Blocking quality issues
            'no-debugger': 'error',
            'no-constant-condition': 'error',

            // Existing legacy issue is reported but does not block CI
            'no-unreachable': 'warn',

            // Technical-debt reporting
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_'
                }
            ]
        }
    }
];