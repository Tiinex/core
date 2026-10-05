import test from 'node:test';
import assert from 'node:assert/strict';
import { nativeEntryMarkdown, nativeEntryByName, nativeEntryContentSource } from './helpers/native-entry-fixtures.mjs';
import { currentSchemaMarkdown } from './helpers/current-schema-targets.mjs';
import { projectPortableEntryCatalog } from '../src/tooling/portable/entry/entry.catalog.js';
import { canonicalC14nV2SelfState, sealC14nV2Self } from '../src/integrity/integrity.c14nV2.js';


function carriedEntryFixture({ name = 'Team Start', canonicalIdentifier = 'example.entry.team-start.v1', version = '1', parentTrace = '' } = {}) {
  const source = nativeEntryByName('start');
  assert.ok(source);
  let markdown = source
    .replace('# Start\n', `# ${name}\n`)
    .replace('- Name: Start\n', `- Name: ${name}\n`)
    .replace('- Version: 1\n', `- Version: ${version}\n`)
    .replace('- Canonical Identifier: tiinex.core.entry.start.v1\n', `- Canonical Identifier: ${canonicalIdentifier}\n`)
    .replace('- Entry Family: tiinex.guided-entry.native.v1\n', '- Entry Family: example.entry.family.v1\n')
    .replace('- Human Label: Start\n', `- Human Label: ${name}\n`)
    .replace(/  - Value:[^\n]*/, '  - Value: ');
  if (parentTrace) markdown = markdown.replace('- Current\n', `- Parent\n  - Parent Schema: tiinex.entry.session.v1\n  - Created At: 2026-10-01 00:00:00\n  - Trace: [Parent](${parentTrace})\n  - Origin:\n    - [relative](${parentTrace})\n- Current\n`);
  const sealed = sealC14nV2Self(markdown);
  assert.equal(sealed.state, 'sealed');
  return `${sealed.markdown}\n`;
}

function sessionEntryWithGrounding({ schemaId = 'tiinex.entry.session.v1', canonicalIdentifier = 'example.entry.session-grounding.v1' } = {}) {
  const source = nativeEntryByName('start');
  assert.ok(source);
  let markdown = source
    .replace('  - Current Schema: tiinex.entry.session.v1\n', `  - Current Schema: ${schemaId}\n`)
    .replace('# Start\n', '# Grounded Session\n')
    .replace('- Name: Start\n', '- Name: Grounded Session\n')
    .replace('- Canonical Identifier: tiinex.core.entry.start.v1\n', `- Canonical Identifier: ${canonicalIdentifier}\n`)
    .replace('- Human Label: Start\n', '- Human Label: Grounded Session\n')
    .replace('\n## Interpretation Limits\n', `\n## Grounding Material\n\n- Ownership boundary\n  - Reference: https://example.invalid/ownership\n  - Purpose: Establish which domain owns the relevant capability before session work begins.\n\n- Participant preference\n  - Reference: https://example.invalid/participant\n  - Purpose: Establish participant-facing presentation preferences without granting participant authority.\n\n## Interpretation Limits\n`)
    .replace(/  - Value:[^\n]*/, '  - Value: ');
  const sealed = sealC14nV2Self(markdown);
  assert.equal(sealed.state, 'sealed');
  return `${sealed.markdown}\n`;
}

function targetEntryFixture({ label = 'Example Web', canonicalIdentifier = 'example.entry.target.web.v1', targetIdentifier = 'example.web' } = {}) {
  const source = nativeEntryByName('start');
  assert.ok(source);
  let markdown = source
    .replace(/  - Current Schema: \[tiinex\.entry\.session\.v1\]\([^\n]+\)\n/, '  - Current Schema: [tiinex.entry.target.v1](tiinex.entry.target.v1.schema.md)\n')
    .replace('# Start\n', `# ${label}\n`)
    .replace('- Name: Start\n', `- Name: ${label}\n`)
    .replace('- Canonical Identifier: tiinex.core.entry.start.v1\n', `- Canonical Identifier: ${canonicalIdentifier}\n`)
    .replace('- Entry Family: tiinex.guided-entry.native.v1\n', '- Entry Family: example.target-entry.v1\n')
    .replace('- Human Label: Start\n', `- Human Label: ${label}\n`)
    .replace('- Purpose: Establish an initial qualified working orientation from the available carried material before substantive work begins.\n', '- Purpose: Augment a purpose Entry with one example web execution environment.\n')
    .replace('\n## Interpretation Limits\n', `\n## Target Identity\n\n- Target Handle: example-web\n- Target Kind: interactive-web-host\n- Canonical Target Identifier: ${targetIdentifier}\n- Provider: Example\n- Host: Example Web\n- Human Label: ${label}\n\n## Target Capabilities\n\n- Provides: file upload, conversation branching\n- Limitations: finite context, host-local state\n\n## Target Compatibility\n\n- Compatible Entry Families: tiinex.guided-entry.native.v1\n- Compatibility Notes: Example compatibility restriction for discovery tests.\n\n## Target Material\n\n- Example host guidance\n  - Reference: https://example.invalid/process\n  - Purpose: Supply host-specific continuity guidance.\n\n## Interpretation Limits\n`)
    .replace(/  - Value:[^\n]*/, '  - Value: ');
  const sealed = sealC14nV2Self(markdown);
  assert.equal(sealed.state, 'sealed');
  return `${sealed.markdown}\n`;
}

function customEntryChildSchema() {
  return `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Parent\n  - Parent Schema: tiinex.entry.session.v1\n  - Created At: 2026-10-01 00:00:00\n  - Trace: tiinex.entry.session.v1.schema.md\n  - Origin:\n    - relative\n- Current\n  - Current Schema: example.entry.session.review.v1\n  - Created At: 2026-10-01 00:00:00\n  - Summary: Example carried Session Entry specialization.\n\n---\n\n# Review Session Entry\n\n## Schema Validation Contract\n\n### Review Session Entry Scope\n\nApplies To\n\n- artifacts whose Current Schema is example.entry.session.review.v1\n\nRules\n\n- This child preserves inherited Session Entry grounding semantics.\n\n---\n\n# Continuity Integrity\n\n- sha256-base64url-c14n-v2\n  - Towards: self\n  - Value:\n`;
}

test('content-source Entry artifacts are qualified through the generic Entry contract', () => {
  const catalog = projectPortableEntryCatalog({ contentSources: [nativeEntryContentSource()] });
  assert.equal(catalog.status, 'ready');
  assert.deepEqual(catalog.entries.map((entry) => entry.canonicalIdentifier).sort(), [
    'tiinex.core.entry.explore.v1',
    'tiinex.core.entry.resume.v1',
    'tiinex.core.entry.start.v1'
  ]);
  assert.equal(catalog.contractAuthority?.schemaId, 'tiinex.entry.v1');
  assert.equal(catalog.contractAuthority?.publicationState, 'published-immutable-canonical');
  assert.ok(catalog.entrySchemaIds.includes('tiinex.entry.session.v1'));
  for (const entry of catalog.entries) {
    assert.equal(entry.sourceKind, 'content-source');
    assert.equal(entry.schemaId, 'tiinex.entry.session.v1');
    assert.deepEqual(entry.schemaLineage, ['tiinex.root.v1', 'tiinex.entry.v1', 'tiinex.entry.session.v1']);
    assert.equal(entry.representationQualification, 'valid');
    assert.equal(entry.readQualified, true);
  }
});

test('Target Entry descendants are discovered as WHERE entries with qualified target metadata', () => {
  const target = targetEntryFixture();
  const catalog = projectPortableEntryCatalog({
    contentSources: [nativeEntryContentSource()],
    inspection: {
      workspaces: [{
        workspaceId: 'interop-example',
        archive: { entries: [{ path: '.topics/.entries/where/example-web/001-example-web-target-entry.trace.md', data: new TextEncoder().encode(target) }] }
      }]
    }
  });
  assert.equal(catalog.status, 'ready');
  const projected = catalog.entries.find((entry) => entry.canonicalIdentifier === 'example.entry.target.web.v1');
  assert.ok(projected);
  assert.equal(projected.entryKind, 'target');
  assert.equal(projected.schemaId, 'tiinex.entry.target.v1');
  assert.ok(projected.schemaLineage.includes('tiinex.entry.target.v1'));
  assert.equal(projected.target.handle, 'example-web');
  assert.equal(projected.target.kind, 'interactive-web-host');
  assert.equal(projected.target.canonicalIdentifier, 'example.web');
  assert.deepEqual(projected.target.provides, ['file upload', 'conversation branching']);
  assert.deepEqual(projected.target.compatibleEntryFamilies, ['tiinex.guided-entry.native.v1']);
  assert.equal(projected.target.material.length, 1);
  assert.equal(projected.target.material[0].reference, 'https://example.invalid/process');
  assert.ok(catalog.entries.filter((entry) => entry.entryKind === 'purpose').length >= 3);
});

test('schema-valid Entry artifacts outside declared Entry surfaces do not shadow reusable content-source Entries', () => {
  const fixture = nativeEntryByName('start');
  assert.ok(fixture);
  const catalog = projectPortableEntryCatalog({
    contentSources: [nativeEntryContentSource()],
    inspection: {
      workspaces: [{
        workspaceId: 'core',
        archive: { entries: [{ path: 'test/fixtures/native-entries/start-entry.trace.md', data: new TextEncoder().encode(fixture) }] }
      }]
    }
  });
  const starts = catalog.entries.filter((entry) => entry.canonicalIdentifier === 'tiinex.core.entry.start.v1');
  assert.equal(starts.length, 1);
  assert.equal(starts[0].sourceKind, 'content-source');
  assert.notEqual(starts[0].artifactPath, 'test/fixtures/native-entries/start-entry.trace.md');
});

test('carried Entry artifacts win exact-byte duplicates from reusable content sources and .schemas never leaks as an Entry instance', () => {
  const carried = nativeEntryByName('start');
  assert.ok(carried);
  const catalog = projectPortableEntryCatalog({
    contentSources: [nativeEntryContentSource()],
    inspection: {
      workspaces: [{
        workspaceId: 'business',
        archive: { entries: [
          { path: '.topics/entries/team-start.trace.md', data: new TextEncoder().encode(carried) },
          { path: '.topics/.schemas/entry/tiinex.entry.v1.schema.md', data: new TextEncoder().encode(currentSchemaMarkdown('tiinex.entry.v1')) }
        ] }
      }]
    }
  });
  const carriedEntries = catalog.entries.filter((entry) => entry.sourceKind === 'carried');
  assert.equal(carriedEntries.length, 1);
  assert.equal(carriedEntries[0].workspaceId, 'business');
  assert.equal(carriedEntries[0].artifactPath, '.topics/entries/team-start.trace.md');
  assert.equal(carriedEntries[0].canonicalIdentifier, 'tiinex.core.entry.start.v1');
  assert.equal(catalog.entries.filter((entry) => entry.canonicalIdentifier === 'tiinex.core.entry.start.v1').length, 1);
  assert.ok(!catalog.entries.some((entry) => entry.artifactPath.includes('/.schemas/')));
});

test('Entry schema and reusable Entry fixtures carry valid self integrity', () => {
  assert.equal(canonicalC14nV2SelfState(currentSchemaMarkdown('tiinex.entry.v1')).state, 'verified');
  assert.equal(canonicalC14nV2SelfState(currentSchemaMarkdown('tiinex.entry.session.v1')).state, 'verified');
  for (const [, markdown] of nativeEntryMarkdown) assert.equal(canonicalC14nV2SelfState(markdown).state, 'verified');
});

test('carried Entry discovery projects only current semantic lineage leaves', () => {
  const parentPath = '.topics/entries/001-team-start.entry.md';
  const childPath = '.topics/entries/001-1-team-start.entry.md';
  const parent = carriedEntryFixture({ name: 'Team Start', version: '1' });
  const child = carriedEntryFixture({ name: 'Team Start', version: '2', parentTrace: '001-team-start.entry.md' });
  const catalog = projectPortableEntryCatalog({
    inspection: {
      workspaces: [{
        workspaceId: 'business',
        archive: { entries: [
          { path: parentPath, data: new TextEncoder().encode(parent) },
          { path: childPath, data: new TextEncoder().encode(child) }
        ] }
      }]
    }
  });
  assert.equal(catalog.status, 'ready');
  assert.deepEqual(catalog.entries.map((entry) => entry.artifactPath), [childPath]);
  assert.equal(catalog.entries[0].version, '2');
  assert.equal(catalog.entries[0].currentLeaf, true);
});


test('Session Entry grounding material is projected as required grounding obligations', () => {
  const markdown = sessionEntryWithGrounding();
  const catalog = projectPortableEntryCatalog({
    inspection: {
      workspaces: [{
        workspaceId: 'business',
        archive: { entries: [{ path: '.topics/entries/grounded-session.trace.md', data: new TextEncoder().encode(markdown) }] }
      }]
    }
  });
  assert.equal(catalog.status, 'ready');
  assert.equal(catalog.entries.length, 1);
  const entry = catalog.entries[0];
  assert.equal(entry.schemaId, 'tiinex.entry.session.v1');
  assert.equal(entry.groundingMaterial.length, 2);
  assert.deepEqual(entry.groundingMaterial.map((item) => item.name), ['Ownership boundary', 'Participant preference']);
  assert.equal(entry.groundingMaterial.every((item) => item.requiredForEntryGrounding), true);
  assert.match(entry.groundingMaterial[0].purpose, /which domain owns/i);
});

test('carried Entry descendant schemas participate in discovery without leaking schema artifacts as Entries', () => {
  const schema = customEntryChildSchema();
  const markdown = sessionEntryWithGrounding({ schemaId: 'example.entry.session.review.v1', canonicalIdentifier: 'example.review.session.v1' });
  const catalog = projectPortableEntryCatalog({
    inspection: {
      workspaces: [{
        workspaceId: 'business',
        archive: { entries: [
          { path: '.topics/.schemas/entry/review/example.entry.session.review.v1.schema.md', data: new TextEncoder().encode(schema) },
          { path: '.topics/entries/review-session.trace.md', data: new TextEncoder().encode(markdown) }
        ] }
      }]
    }
  });
  assert.equal(catalog.status, 'ready');
  assert.ok(catalog.entrySchemaIds.includes('example.entry.session.review.v1'));
  assert.equal(catalog.entries.length, 1);
  assert.equal(catalog.entries[0].schemaId, 'tiinex.entry.session.v1');
  assert.deepEqual(catalog.entries[0].schemaLineage, ['tiinex.root.v1', 'tiinex.entry.v1', 'tiinex.entry.session.v1']);
  assert.equal(catalog.entries[0].groundingMaterial.length, 2);
  assert.ok(!catalog.entries.some((entry) => entry.artifactPath.endsWith('.schema.md')));
});
