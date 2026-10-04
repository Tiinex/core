import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { discoverLocalTiinexContentSource } from '../src/tooling/portable/adapters/node/contentSource.discovery.js';
import { projectPortableEntryCatalog } from '../src/tooling/portable/entry/entry.catalog.js';
import { projectPortableProcessCatalog } from '../src/tooling/portable/process/process.catalog.js';
import { projectPortableScaffoldCatalog } from '../src/scaffolds/scaffold.catalog.js';
import { nativeEntryByName } from './helpers/native-entry-fixtures.mjs';
import { sealC14nV2Self } from '../src/integrity/integrity.c14nV2.js';

async function write(target, content='') { await mkdir(path.dirname(target), { recursive: true }); await writeFile(target, content); }

test('one discovered content source feeds Entry, Process, and Scaffold catalogs without creating applicability', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'tiinex-content-catalog-'));
  try {
    await write(path.join(root, 'package.json'), JSON.stringify({ name: '@example/catalog', version: '1.0.0' }));
    const entryMarkdown = nativeEntryByName('start');
    await write(path.join(root, '.topics', 'session', '.entries', 'start-entry.trace.md'), entryMarkdown);
    await write(path.join(root, '.topics', 'session', '.processes', 'grounding-process.trace.md'), qualifiedProcess());
    await write(path.join(root, '.topics', 'workspace', '.scaffolds', 'workspace-scaffold.trace.md'), qualifiedScaffold());

    const source = await discoverLocalTiinexContentSource({ root });
    assert.equal(source.status, 'ready');

    const entries = projectPortableEntryCatalog({ contentSources: [source] });
    assert.equal(entries.status, 'ready');
    assert.equal(entries.entries.length, 1);
    assert.equal(entries.entries[0].canonicalIdentifier, 'tiinex.core.entry.start.v1');
    assert.equal(entries.entries[0].sourceKind, 'content-source');

    const processes = projectPortableProcessCatalog({ contentSources: [source] });
    assert.equal(processes.status, 'ready');
    assert.equal(processes.processes.length, 1);
    assert.equal(processes.processes[0].title, 'Portable Test Process');
    assert.match(processes.boundary, /does not create a Process schema type, applicability/i);

    const scaffolds = projectPortableScaffoldCatalog({ contentSources: [source] });
    assert.equal(scaffolds.status, 'ready');
    assert.equal(scaffolds.scaffolds.length, 1);
    assert.equal(scaffolds.scaffolds[0].handle, 'example.workspace.v1');
    assert.match(scaffolds.boundary, /does not make the Scaffold applicable/i);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

function qualifiedProcess() {
  const prepared = `# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.topic.v1
  - Created At: 2026-10-04 00:00:00
  - Summary: reusable test process guidance
  - Status: ready/local

---

# Portable Test Process

## When This Process Applies

Use only when explicitly selected.

## Process

Ground before acting.

---

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: `;
  return sealC14nV2Self(prepared).markdown;
}

function qualifiedScaffold() {
  const prepared = `# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.scaffold.v1
  - Created At: 2026-10-04 00:00:00
  - Summary: reusable test scaffold

---

# Example Workspace Scaffold

## Scaffold Identity

- Scaffold Handle: example.workspace.v1
- Scaffold Name: Example Workspace
- Scaffold Kind: workspace
- Version: 1

## Target Boundary

- Target Kind: workspace-root
- Target Root Meaning: selected workspace root
- Root Binding Policy: explicit-invocation

## Structural Entries

- Topics
  - Path: .topics
  - Entry Kind: directory
  - Presence: required
  - Entry Role: topics-root

## Composition

- Composition Policy: additive
- Duplicate Entry Policy: exact-duplicate-allowed

## Conflict Policy

- Existing Compatible Material: no-op
- Existing Conflicting Material: block
- Unknown Existing Material: preserve
- Deletion Policy: never

## Generation Bindings

- none

## Validation Boundary

- Qualification Rule: exact bytes qualify
- Planning Rule: read-only
- Apply Rule: separately authorized
- Failure Policy: fail-closed

## Interpretation Limits

- Does Not Establish: applicability or target identity
- Must Not Be Used To Claim: mutation authority

---

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: `;
  return sealC14nV2Self(prepared).markdown;
}
