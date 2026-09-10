import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { after, before, test } from 'node:test';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const port = 8127;
const origin = `http://127.0.0.1:${port}`;
let server;
const hasDatabase = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'].every((key) => process.env[key]);
const secret = 'adina-local-development-secret';
const adminToken = jwt.sign(
  { sub: '1', role: 'admin', name: 'Security Test Admin' },
  secret,
  { expiresIn: '5m', issuer: 'adina-api', audience: 'adina-web' }
);
const adminHeaders = {
  Cookie: `adina_session=${adminToken}`,
  'Content-Type': 'application/json'
};

before(async () => {
  server = spawn(process.execPath, ['server.js'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT: String(port),
      NODE_ENV: 'production',
      SESSION_SECRET: secret,
      DB_HOST: process.env.DB_HOST || '127.0.0.1',
      DB_USER: process.env.DB_USER || 'ci-no-database',
      DB_PASSWORD: process.env.DB_PASSWORD || 'ci-no-database',
      DB_NAME: process.env.DB_NAME || 'ci_no_database'
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Test server did not start')), 10_000);
    const onData = (chunk) => {
      if (chunk.toString().includes(`running on port ${port}`)) {
        clearTimeout(timeout);
        resolve();
      }
    };
    server.stdout.on('data', onData);
    server.once('error', reject);
    server.once('exit', (code) => reject(new Error(`Test server exited with ${code}`)));
  });
});

after(() => {
  server?.kill('SIGTERM');
});

for (const path of [
  '/api/admin/owners',
  '/api/admin/applications',
  '/api/admin/uploads/id_doc_example.pdf',
  '/api/owner/animals'
]) {
  test(`anonymous request to ${path} is rejected`, async () => {
    const response = await fetch(`${origin}${path}`);
    assert.equal(response.status, 401);
    assert.match(response.headers.get('content-type') || '', /^application\/json/);
  });
}

test('unknown API route returns a JSON 404 instead of the SPA document', async () => {
  const response = await fetch(`${origin}/api/does-not-exist`);
  assert.equal(response.status, 404);
  assert.match(response.headers.get('content-type') || '', /^application\/json/);
  assert.deepEqual(await response.json(), { success: false, error: 'API endpoint not found.' });
});

test('production does not expose the database diagnostic endpoint', async () => {
  const response = await fetch(`${origin}/api/test-db-connection`);
  assert.equal(response.status, 404);
  assert.match(response.headers.get('content-type') || '', /^application\/json/);
});

test('public verification redacts owner identity details', { skip: !hasDatabase }, async () => {
  const response = await fetch(`${origin}/api/verify/985112000012345`);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(Object.hasOwn(body.data.owner, 'idLast4'), false);
  assert.notEqual(body.data.facility.contact, '+1 (555) 234-5678');
});

test('responses include baseline security headers', async () => {
  const response = await fetch(`${origin}/api/does-not-exist`);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('x-frame-options'), 'SAMEORIGIN');
  assert.match(response.headers.get('content-security-policy') || '', /img-src[^;]*https:\/\/images\.unsplash\.com/);
});

test('application submission rejects missing required fields before database access', async () => {
  const response = await fetch(`${origin}/api/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  assert.equal(response.status, 400);
  assert.match(response.headers.get('content-type') || '', /^application\/json/);
});

test('registration rejects invalid identity and password fields before database access', async () => {
  const response = await fetch(`${origin}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  assert.equal(response.status, 400);
});

test('application submission rejects malformed email', async () => {
  const response = await fetch(`${origin}/api/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ handler_name: 'Test', email: 'not-an-email', pet_name: 'Dog', pet_microchip: '123456789' })
  });
  assert.equal(response.status, 400);
});

test('application submission rejects unsafe image data URLs', async () => {
  const response = await fetch(`${origin}/api/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      handler_name: 'Test',
      email: 'test@example.com',
      pet_name: 'Dog',
      pet_breed: 'Mixed Breed',
      pet_microchip: '123456789',
      pet_photo: 'data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9ImFsZXJ0KDEpIj48L3N2Zz4='
    })
  });
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /JPEG, PNG, or WebP/);
});

test('admin application update rejects unsupported status before database access', async () => {
  const response = await fetch(`${origin}/api/admin/applications/1`, {
    method: 'PUT',
    headers: adminHeaders,
    body: JSON.stringify({ status: 'Deleted' })
  });
  assert.equal(response.status, 400);
});

test('admin travel update rejects unsupported status before database access', async () => {
  const response = await fetch(`${origin}/api/admin/travel/AIR-1`, {
    method: 'PUT',
    headers: adminHeaders,
    body: JSON.stringify({ status: 'Anything' })
  });
  assert.equal(response.status, 400);
});
