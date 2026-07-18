import next from 'eslint-config-next';

const config = [
  ...next,
  {
    ignores: ['.next/**', 'node_modules/**', 'dist/**', 'build/**'],
  },
];

export default config;
