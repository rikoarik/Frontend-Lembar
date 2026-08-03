import next from 'eslint-config-next';

const config = [
  ...next,
  {
    ignores: ['.next/**', '.worktrees/**', 'node_modules/**', 'dist/**', 'build/**'],
  },
];

export default config;
