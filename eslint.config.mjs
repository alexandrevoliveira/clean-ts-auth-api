import neostandard from 'neostandard'
import globals from 'globals'

export default [
  {
    ignores: [
      '.husky/**',
      '.vscode/**',
      'coverage/**',
      'dist/**',
      'documentation/**',
      'node_modules/**',
      'public/**'
    ]
  },
  ...neostandard({ ts: true }),
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname
      },
      globals: { ...globals.node, ...globals.jest }
    },
    rules: {
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/return-await': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off'
    }
  }
]
