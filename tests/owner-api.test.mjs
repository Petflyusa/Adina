import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { after, before, test } from 'node:test';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const port = 8128;
const origin = `http://127.0.0.1:${port}`;
const secret = 'adina-local-development-secret';
const token = jwt.sign(
  { sub: '2', role: 'owner', name: 'Test Owner' },
  secret,
  { expiresIn: '5m', issuer: 'adina-api', audience: 'adina-web' }
);
const headers = { Cookie: `adina_session=${token}` };
let server;
const hasDatabase = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'].every((key) => process.env[key]);

before(async () => {
  if (!hasDatabase) return;
  server = spawn(process.execPath, ['server.js'], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(port), NODE_ENV: 'test', SESSION_SECRET: secret },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Test server did not start')), 10_000);
    server.stdout.on('data', (chunk) => {
      if (chunk.toString().includes(`running on port ${port}`)) {
        clearTimeout(timeout);
        resolve();
      }
    });
    server.once('error', reject);
    server.once('exit', (code) => reject(new Error(`Test server exited with ${code}`)));
  });
});

after(() => server?.kill('SIGTERM'));

for (const path of ['/api/owner/dashboard', '/api/owner/stats', '/api/owner/animals', '/api/owner/travel']) {
  test(`${path} returns JSON for the authenticated owner`, { skip: !hasDatabase }, async () => {
    const response = await fetch(`${origin}${path}`, { headers });
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type') || '', /^application\/json/);
    const body = await response.json();
    assert.equal(body.success, true);
  });
}
