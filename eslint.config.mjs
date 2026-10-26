import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const crossModuleImport = {
  regex: '^@/modules/[^/]+/.+',
  message: 'Import other modules only through their public index (@/modules/<name>).',
};

const browserBoundary = [
  { regex: '^@supabase/', message: 'The browser never talks to Supabase. Use the /api routes.' },
  { regex: '(^|/)(server|functions)/', message: 'Server code must not end up in the browser bundle.' },
];

// Flat config replaces a rule per matching block, so every layer block repeats the browser boundary.
const restrictLayer = (files, forbidden) => ({
  files,
  ignores: ['src/**/*.test.ts', 'src/test/**'],
  rules: {
    'no-restricted-imports': ['error', { patterns: [crossModuleImport, ...browserBoundary, ...forbidden] }],
  },
});

const outerLayers = {
  regex: '(^|/)(application|infra|main|presentation)/',
  message: 'Domain code must not depend on outer layers.',
};
const frameworks = {
  regex: '^(react|react-dom|react-router|@tanstack/.+|zod)(/.*)?$',
  message: 'Domain and application code must stay framework free.',
};

export default defineConfig([
  globalIgnores(['dist', 'coverage', 'node_modules', '.wrangler']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    plugins: { 'react-hooks': reactHooks },
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
      '@typescript-eslint/consistent-type-imports': 'error',
      'no-console': ['warn', { allow: ['error', 'warn'] }],
      eqeqeq: ['error', 'always'],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "MemberExpression[object.type='MetaProperty'][property.name='env']",
          message: 'The browser bundle has no configuration. Settings live in the Cloudflare functions.',
        },
      ],
      'no-restricted-globals': [
        'error',
        { name: 'localStorage', message: 'User data lives in the account, behind /api.' },
        { name: 'sessionStorage', message: 'User data lives in the account, behind /api.' },
        { name: 'indexedDB', message: 'User data lives in the account, behind /api.' },
      ],
      'no-restricted-properties': [
        'error',
        { object: 'window', property: 'localStorage', message: 'User data lives in the account, behind /api.' },
        { object: 'window', property: 'sessionStorage', message: 'User data lives in the account, behind /api.' },
        { object: 'document', property: 'cookie', message: 'Session cookies are HttpOnly and handled by the server.' },
      ],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: browserBoundary }],
    },
  },
  restrictLayer(['src/**/domain/**/*.ts'], [outerLayers, frameworks]),
  restrictLayer(['src/**/application/**/*.ts'], [
    { regex: '(^|/)(infra|main|presentation)/', message: 'Application code must not depend on infra, main or presentation.' },
    frameworks,
  ]),
  restrictLayer(['src/**/infra/**/*.ts'], [{ regex: '(^|/)(main|presentation)/', message: 'Infra must not depend on main or presentation.' }]),
  restrictLayer(['src/**/presentation/**/*.{ts,tsx}', 'src/app/**/*.{ts,tsx}'], [
    { regex: '(^|/)infra/', message: 'Presentation gets concrete implementations through main/factories.' },
  ]),
  {
    files: ['server/**/*.ts', 'functions/**/*.ts'],
    languageOptions: { globals: globals.serviceworker },
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [{ regex: '(^|/)src/|^@/', message: 'Server code shares only the contracts folder with the browser.' }] },
      ],
    },
  },
  {
    files: ['vite.config.ts', 'scripts/**/*.{ts,mjs}'],
    languageOptions: { globals: globals.node },
  },
]);
