export function schemaMaterialIdentitiesEquivalent(left = {}, right = {}) {
  const a = normalize(left);
  const b = normalize(right);
  if (a.schemaId && b.schemaId && a.schemaId !== b.schemaId) return false;
  const cryptographic = [];
  if (a.sha256 && b.sha256) cryptographic.push(a.sha256 === b.sha256);
  if (a.sourceBlobSha && b.sourceBlobSha) cryptographic.push(a.sourceBlobSha === b.sourceBlobSha);
  if (!cryptographic.length || cryptographic.some((match) => !match)) return false;
  if (a.bytes && b.bytes && a.bytes !== b.bytes) return false;
  return true;
}

function normalize(value = {}) {
  const bytes = Number(value?.bytes || value?.byteLength || 0);
  return Object.freeze({
    schemaId: String(value?.schemaId || '').trim(),
    sha256: String((typeof value?.sha256 === 'object' ? value?.sha256?.value : value?.sha256) || value?.checksum?.value || value?.checksum || value?.materialSha256 || '').trim().toLowerCase(),
    sourceBlobSha: String(value?.sourceBlobSha || value?.gitBlobSha || value?.blobSha || '').trim().toLowerCase(),
    bytes: Number.isFinite(bytes) && bytes > 0 ? bytes : 0
  });
}
