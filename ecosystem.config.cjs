// PM2 config for Frontend-Lembar (Next.js production)
const fs = require('fs');
const path = require('path');
const envPath = path.join('/home/hermes/Projects/Frontend-Lembar', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  const value = trimmed.slice(eqIdx + 1).trim();
  env[key] = value;
}

module.exports = {
  apps: [
    {
      name: 'lembar-frontend',
      script: 'pnpm',
      args: 'run start',
      cwd: '/home/hermes/Projects/Frontend-Lembar',
      env: {
        ...env,
        NODE_ENV: 'production',
        PORT: '3000',
      },
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
};
