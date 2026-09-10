import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateDocumentDataUrl, validateImageDataUrl } from '../src/server/uploadValidation.js';

test('image validation rejects SVG data URLs', () => {
  assert.match(
    validateImageDataUrl('data:image/svg+xml;base64,PHN2Zz48L3N2Zz4='),
    /JPEG, PNG, or WebP/
  );
});

test('document validation rejects SVG data URLs', () => {
  assert.match(
    validateDocumentDataUrl('data:image/svg+xml;base64,PHN2Zz48L3N2Zz4='),
    /PDF, JPEG, or PNG/
  );
});

test('document validation accepts a PDF with matching magic bytes', () => {
  const pdf = `data:application/pdf;base64,${Buffer.from('%PDF-1.7\n').toString('base64')}`;
  assert.equal(validateDocumentDataUrl(pdf), null);
});

test('image validation rejects payloads over the configured limit', () => {
  const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const payload = Buffer.concat([pngHeader, Buffer.alloc(32)]).toString('base64');
  assert.match(validateImageDataUrl(`data:image/png;base64,${payload}`, 16), /smaller/);
});
