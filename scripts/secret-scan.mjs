import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const ROOTS = ['src', 'app'];
const TEXT_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);

export const SECRET_PATTERNS = [
  { name: 'openai', pattern: /sk-[A-Za-z0-9]{20,}/g },
  { name: 'anthropic', pattern: /sk-ant-[A-Za-z0-9\-_]{20,}/g },
  { name: 'google-api-key', pattern: /AIza[0-9A-Za-z\-_]{35}/g },
  { name: 'github-pat', pattern: /ghp_[A-Za-z0-9]{36}/g },
  { name: 'github-fine-grained-pat', pattern: /github_pat_[A-Za-z0-9_]{20,}/g },
  { name: 'slack-token', pattern: /xox[baprs]-[A-Za-z0-9-]{10,}/g },
  { name: 'private-key', pattern: /-----BEGIN (?:RSA |EC |OPENSSH |DSA |)PRIVATE KEY-----/g },
  { name: 'aws-access-key-id', pattern: /AKIA[0-9A-Z]{16}/g },
];

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stats = statSync(path);
    if (stats.isDirectory()) {
      walk(path, files);
      continue;
    }
    if (TEXT_EXTENSIONS.has(extname(path))) files.push(path);
  }
  return files;
}

function findMatches(filePath, source) {
  const matches = [];
  for (const { name, pattern } of SECRET_PATTERNS) {
    pattern.lastIndex = 0;
    for (const match of source.matchAll(pattern)) {
      matches.push({
        filePath,
        rule: name,
        sample: match[0].slice(0, 16),
      });
    }
  }
  return matches;
}

export function scanDirectories(rootDir = process.cwd(), roots = ROOTS) {
  return roots.flatMap((root) => {
    const absoluteRoot = resolve(rootDir, root);
    try {
      return walk(absoluteRoot).flatMap((filePath) => {
        const source = readFileSync(filePath, 'utf8');
        return findMatches(filePath, source);
      });
    } catch {
      return [];
    }
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const matches = scanDirectories();
  if (matches.length === 0) {
    console.log('secret-scan: ok');
    process.exit(0);
  }

  for (const match of matches) {
    console.error(`${match.rule}: ${match.filePath} (${match.sample}...)`);
  }
  process.exit(1);
}
