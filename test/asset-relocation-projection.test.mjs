import test from 'node:test';
import assert from 'node:assert/strict';
import { projectPortableAssetRelocation as project, sanitizeSlug } from '../src/tooling/portable/lineage/asset.relocation.projection.js';
import { stableFingerprintBytes, sha256Hex } from '../src/export/package.bytes.js';
const make = (p, bytes = Buffer.from('binary\0content')) => ({ path:p, fingerprint:stableFingerprintBytes(bytes), sha256:sha256Hex(bytes), referencedBy:[] });
const base = (more={}) => ({workspaceId:'vscode',representationCoverage:'complete',referenceCoverage:'complete',targetDirectory:'.topics/work/test',lineageDimension:'001-1-1',targetDirectoryEntries:[],assets:[make('.topics/tmp/En fin bild.png'),make('.topics/tmp/En annan bild.png')],...more});
test('Core projects safe, deterministic, 01/02 suffixed asset placement without changing source bytes or semantic Parent',()=>{
  const p=project(base());assert.equal(p.status,'ready',JSON.stringify(p.findings));assert.equal(p.executable,true);
  assert.deepEqual(p.changes.map(x=>x.toPath),['.topics/work/test/001-1-1-en-fin-bild-01.png','.topics/work/test/001-1-1-en-annan-bild-02.png']);
  assert.equal(p.changes[0].sha256,make('.topics/tmp/En fin bild.png').sha256);
  assert.equal(p.boundary.filenameDimensionIsNotSemanticParent,true);
  assert.equal(project(base()).planFingerprint,p.planFingerprint);
});
test('multiple same-name assets receive deterministic numbering and never overwrite existing siblings',()=>{
  const input=base({assets:[make('.topics/a/photo.png'),make('.topics/b/photo.png')],targetDirectoryEntries:['.topics/work/test/001-1-1-photo-01.png']});
  assert.deepEqual(project(input).changes.map(x=>x.toPath),['.topics/work/test/001-1-1-photo-02.png','.topics/work/test/001-1-1-photo-03.png']);
});
test('Core blocks incomplete namespace and omitted reference qualifications and occupied asset relationships',()=>{
  for(const data of [{representationCoverage:'partial'},{referenceCoverage:'unknown'},{assets:[{...make('.topics/a/p.png'),referencedBy:undefined}]},{assets:[{...make('.topics/a/p.png'),referencedBy:['.topics/task.trace.md']}]},{assets:[make('.topics/a/p.trace.md')]},{assets:[make('.topics/a/links.md')]},{assets:[make('.topics/a/icon.svg')]},{lineageDimension:'001-0'},{targetDirectory:'../escape'},{targetDirectoryEntries:['../escape']}, {assets:[make('.topics/a/../p.png')]}]) {
   const p=project(base(data));assert.equal(p.status,'blocked',JSON.stringify(data));assert.equal(p.executable,false);
  }
});
test('asset filenames retain safe normalized slugs and do not fabricate unreadable references',()=>{
  assert.equal(sanitizeSlug('En fin bild ÅÄÖ 你好'),'en-fin-bild-aao');
  assert.equal(project(base({assets:[make('.topics/a/🤔.png')]})).status,'blocked');
});
