import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import prettier from 'eslint-config-prettier'

export default tseslint.config(
  { ignores: ['dist', 'docs', 'node_modules', 'scripts'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommendedTypeChecked, prettier],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      // The tsconfig lives in config/, not the root, so point the parser at it
      // explicitly — projectService's root-directory lookup would miss it.
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: { react: { version: 'detect' } },
    plugins: { react, 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react/jsx-key': 'error',
      // `{count && <X/>}` renders a literal 0. Every conditional in the ported
      // template binds a real boolean, so this guards new code, not old.
      'react/jsx-no-leaked-render': ['error', { validStrategies: ['ternary', 'coerce'] }],
      // Makes the ScreenId switch in BottomPanel exhaustive by construction.
      // Exhaustive by construction where there is no default (the reducer, the
      // actor builder); a default clause is accepted as covering the rest.
      '@typescript-eslint/switch-exhaustiveness-check': [
        'error',
        { considerDefaultExhaustiveForUnions: true },
      ],
    },
  },
  {
    // The layer boundary from the plan, enforced by the linter rather than by
    // discipline: data/ and engine/ stay pure so their tests run in plain Node.
    files: ['src/data/**/*.ts', 'src/engine/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'react', message: 'data/ and engine/ must stay framework-free.' },
            { name: 'react-dom', message: 'data/ and engine/ must stay framework-free.' },
          ],
          patterns: [
            {
              group: ['@/audio/*', '@/scene/*', '@/components/*', '@/hooks/*'],
              message: 'data/ and engine/ may not depend on presentation layers.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['tests/**/*.ts'],
    rules: { '@typescript-eslint/no-unsafe-assignment': 'off' },
  },
)
