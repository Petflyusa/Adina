import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { test } from 'node:test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('production starts when SESSION_SECRET has not been configured yet', async (t) => {
  const port = 8131;
  const env = {
    ...process.env,
    NODE_ENV: 'production',
    PORT: String(port),
    DB_HOST: '127.0.0.1',
    DB_USER: 'startup-test',
    DB_PASSWORD: 'startup-test',
    DB_NAME: 'startup_test'
  };
  delete env.SESSION_SECRET;

  const server = spawn(process.execPath, [path.join(repoRoot, 'server.js')], {
    cwd: '/tmp',
    env,
    stdio: ['ignore', 'pipe', 'pipe']
  });
  t.after(() => server.kill('SIGTERM'));

  let stderr = '';
  server.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`Server did not start. ${stderr}`)), 5_000);
    server.stdout.on('data', (chunk) => {
      if (chunk.toString().includes(`running on port ${port}`)) {
        clearTimeout(timeout);
        resolve();
      }
    });
    server.once('error', reject);
    server.once('exit', (code) => {
      clearTimeout(timeout);
      reject(new Error(`Server exited with ${code}. ${stderr}`));
    });
  });

  const response = await fetch(`http://127.0.0.1:${port}/`);
  assert.equal(response.status, 200);
});
