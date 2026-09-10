const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const DOCUMENT_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png']);

function decodeDataUrl(value) {
  if (!value || !String(value).startsWith('data:')) return null;
  const match = String(value).match(/^data:([^;,]+);base64,([A-Za-z0-9+/]+={0,2})$/);
  if (!match) return { error: 'File must be a valid base64 data URL.' };
  return { mimeType: match[1].toLowerCase(), buffer: Buffer.from(match[2], 'base64') };
}

function matchesMagicBytes(mimeType, buffer) {
  if (mimeType === 'image/jpeg') return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mimeType === 'image/png') {
    return buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }
  if (mimeType === 'image/webp') {
    return buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
  }
  if (mimeType === 'application/pdf') return buffer.length >= 5 && buffer.toString('ascii', 0, 5) === '%PDF-';
  return false;
}

function validateDataUrl(value, allowedTypes, maxBytes, typeError, sizeError) {
  const decoded = decodeDataUrl(value);
  if (!decoded) return null;
  if (decoded.error || !allowedTypes.has(decoded.mimeType)) return typeError;
  if (decoded.buffer.length === 0 || decoded.buffer.length > maxBytes) return sizeError;
  if (!matchesMagicBytes(decoded.mimeType, decoded.buffer)) return 'File content does not match its declared type.';
  return null;
}

export function validateImageDataUrl(value, maxBytes = 3 * 1024 * 1024) {
  return validateDataUrl(
    value,
    IMAGE_TYPES,
    maxBytes,
    'Photo must be a JPEG, PNG, or WebP image.',
    'Photo must be 3 MB or smaller.'
  );
}

export function validateDocumentDataUrl(value, maxBytes = 5 * 1024 * 1024) {
  return validateDataUrl(
    value,
    DOCUMENT_TYPES,
    maxBytes,
    'Document must be a PDF, JPEG, or PNG file.',
    'Document must be 5 MB or smaller.'
  );
}
