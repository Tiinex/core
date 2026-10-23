import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { discoverCarrierFrontier } from '../src/tooling/portable/adapters/node/carrierFrontier.discovery.js';
import { runPortableCli } from '../src/tooling/portable/adapters/cli/cli.run.js';
import { manufactureHandoffPackageV1Direct } from '../src/tooling/portable/handoff/handoffPackageV1.manufacture.js';
import { handoffPackageV1ZipBytes } from '../src/tooling/portable/handoff/handoffPackageV1.zip.js';
import { finalizeFile } from '../src/export/package.fileMap.js';
import { sealC14nV2Self } from '../src/integrity/integrity.c14nV2.js';
import { C14N_V2_VALIDATOR_TARGET } from '../src/integrity/integrity.methodReference.js';
import { currentSchemaTarget } from './helpers/current-schema-targets.mjs';
const rootSchema = currentSchemaTarget('tiinex.root.v1');
const wsSchema = currentSchemaTarget('tiinex.workspace.v1');
const taskSchema = currentSchemaTarget('tiinex.task.v1');
const seal = (text) => sealC14nV2Self(text).markdown;
const ws = (id) => seal(`# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${rootSchema})\n- Current\n  - Current Schema: [tiinex.workspace.v1](${wsSchema})\n  - Created At: 2026-09-24 01:00:00\n  - Authors: Fixture\n  - Summary: ${id} Workspace.\n  - Status: active/local\n\n---\n\n# ${id}\n\n## Workspace Entrypoints\n\n### Source\n\n- Source Kind: local-directory\n- Repository: Example/${id}\n- Root Path: .\n- Repo Files Discovery: on\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: \n`);
const task = (id, time) => seal(`# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${rootSchema})\n- Current\n  - Current Schema: [tiinex.task.v1](${taskSchema})\n  - Created At: ${time}\n  - Authors: Fixture\n  - Summary: ${id} Task.\n  - Status: ready/local\n\n---\n\n# ${id}\n\n## Objective\n\nInspect currentness without inventing it.\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: \n`);

test('carrier frontier reads qualified Workspace archives, sorts leaves but does not infer currentness', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'tiinex-carrier-frontier-'));
  try {
    const targets=[];const materializations=[];
    for(const [id,time] of [['one','2026-10-17 10:00:00'],['two','2026-10-19 10:00:00']]) {
      const wp = `.topics/.workspaces/tiinex-${id}.workspace.md`;
      targets.push({workspaceId:id,path:wp});
      materializations.push({id,entries:[
        finalizeFile({path:wp,mediaType:'text/markdown',content:ws(id)}),
        finalizeFile({path:`.topics/tasks/001-${id}.trace.md`,mediaType:'text/markdown',content:task(id,time)})
      ]});
    }
    const assembled = manufactureHandoffPackageV1Direct({carrierMode:'workspace',carrierLineage:{dimension:'012-1',parentDimension:'012',checkpointKind:'progression'},workspaceMaterializations:materializations,workspaceTargets:targets,additionalTransportFiles:[finalizeFile({path:'runtime/tools/tiinex-portable.mjs',mediaType:'text/javascript',content:'export {};\n'})],requirements:{},handoffRoutes:[]});
    assert.equal(assembled.status,'ready',JSON.stringify(assembled.findings));
    const carrier=path.join(dir,'test.handoff-package.zip');
    await writeFile(carrier,handoffPackageV1ZipBytes(assembled.bundle));
    assert.equal((await discoverCarrierFrontier({carrier,scope:'WRONG'})).reason,'scope-invalid');
    assert.equal((await discoverCarrierFrontier({carrier,limit:0})).reason,'limit-invalid');
    assert.equal((await discoverCarrierFrontier({carrier,limit:'abc'})).reason,'limit-invalid');
    const result=await discoverCarrierFrontier({carrier,limit:10});
    assert.equal(result.summary.qualifiedWorkspaces,2);
    assert.equal(result.feed.total, result.summary.selectedTopologicalLeaves);
    assert.equal(result.feed.hasMore, false);
    assert.equal(result.feed.candidateKindCounts.task, 2);
    assert.equal(result.candidates[0].artifactKind, 'task');
    assert.equal(result.candidates[0].focusArg, 'two/.topics/tasks/001-two.trace.md');
    assert.equal(result.summary.unresolvedCurrentness,4);
    assert.equal(result.candidates[0].workspaceId,'two');
    assert.equal(result.candidates[0].currentness,'unresolved');
    assert.equal(result.candidates[0].classification,'topological-leaf-only');
    assert.equal(result.latestCandidateByWorkspace.length, 2);
    assert.deepEqual(result.latestCandidateByWorkspace.map((entry) => entry.workspaceId), ['one','two']);
    assert.equal(result.latestCandidateByWorkspace[0].latestCandidate.currentness, 'unresolved');
    const bounded=await discoverCarrierFrontier({carrier,limit:1});
    assert.equal(bounded.candidates.length, 1);
    assert.equal(bounded.latestCandidateByWorkspace.length, 2);
    assert.equal(bounded.latestCandidateByWorkspace[0].latestCandidate.workspaceId, 'one');
    assert.equal(bounded.feed.hasMore, true);
    const secondPage = await discoverCarrierFrontier({carrier, limit:1, cursor:bounded.feed.nextCursor});
    assert.equal(secondPage.feed.hasMore, true);
    assert.equal(secondPage.feed.offset, 1);
    assert.notEqual(secondPage.candidates[0].path, bounded.candidates[0].path);
    assert.equal(secondPage.latestCandidateByWorkspace.length, 2);
    assert.equal((await discoverCarrierFrontier({carrier, scope:'all', cursor:bounded.feed.nextCursor})).reason,'cursor-invalid-or-stale');
    assert.equal((await discoverCarrierFrontier({carrier, cursor:'invalid@'})).reason,'cursor-invalid-or-stale');
    assert.equal((await discoverCarrierFrontier({carrier, cursor:bounded.feed.nextCursor, full:true})).reason,'cursor-with-full-invalid');
    const stdout = [];
    const io = { log: (line) => stdout.push(line), error: (line) => stdout.push(line) };
    assert.equal(await runPortableCli(['discover-carrier-frontier',carrier,'--foucs','two/.topics/tasks/001-two.trace.md'],io),2);
    assert.equal(JSON.parse(stdout.at(-1)).reason,'cli-arguments-invalid');
    assert.equal(await runPortableCli(['discover-carrier-frontier',carrier,'--focus'],io),2);
    assert.equal(JSON.parse(stdout.at(-1)).reason,'cli-arguments-invalid');
    assert.equal(result.boundaries.source,'read-only; no extraction of Workspace trees or remote access');
    const all=await discoverCarrierFrontier({carrier,scope:'all',limit:1});
    assert.equal(all.summary.shown,1);
    assert.ok(all.summary.selectedTopologicalLeaves>=result.summary.selectedTopologicalLeaves);
    assert.equal(result.status,'ready');
    assert.equal(result.chronology.modifiedAt,'unavailable-without-a-qualified-version-or-source-comparison');
    const focus=await discoverCarrierFrontier({carrier,focus:'two/.topics/tasks/001-two.trace.md'});
    assert.equal(focus.focusNeighborhood.status,'ready');
    assert.equal(focus.focusNeighborhood.summary.focusResolved,1);
    assert.equal((await discoverCarrierFrontier({carrier,focus:'two/.topics/tasks/not-found.trace.md'})).reason,'focus-unresolved');
    const compared=await discoverCarrierFrontier({carrier,compareCarrier:carrier,limit:1});
    assert.equal(compared.carrierComparison.summary.byteIdentical,2);
    assert.equal(compared.carrierComparison.summary.changed,0);
    assert.equal((await discoverCarrierFrontier({carrier,compareCarrier:'/file/absent.zip'})).status,'blocked');
  } finally {await rm(dir,{recursive:true,force:true});}
});

test('carrier frontier fails closed on missing or invalid sources', async () => {
  assert.equal((await discoverCarrierFrontier()).status,'blocked');
  assert.equal((await discoverCarrierFrontier({carrier:'/path/which/does/not/exist.zip'})).status,'blocked');
  assert.equal((await discoverCarrierFrontier({scope:'WRONG'})).reason,'carrier-path-required');
});

test('focused lineage reports Parent integrity mismatches separately from relation findings', async () => {
  const dir=await mkdtemp(path.join(tmpdir(),'tiinex-frontier-integrity-'));
  try {
    const parentPath='.topics/tasks/001-parent.trace.md';
    const childPath='.topics/tasks/001-1-child.trace.md';
    const parent=task('Parent','2026-10-17 10:00:00');
    const child=seal(`# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${rootSchema})\n- Parent\n  - Parent Schema: [tiinex.task.v1](${taskSchema})\n  - Created At: 2026-10-17 10:00:00\n  - Trace: [Parent](001-parent.trace.md)\n  - Origin:\n    - [relative](001-parent.trace.md)\n- Current\n  - Current Schema: [tiinex.task.v1](${taskSchema})\n  - Created At: 2026-10-19 10:00:00\n  - Authors: Fixture\n  - Summary: Child with historical mismatched parent reference\n  - Status: ready/local\n\n---\n\n# Child\n\n## Objective\n\nFixture only.\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: [Parent](001-parent.trace.md)\n  - Value: ${'a'.repeat(43)}\n\n- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: \n`);
    const wp='.topics/.workspaces/tiinex-one.workspace.md';
    const assembled=manufactureHandoffPackageV1Direct({carrierMode:'workspace',carrierLineage:{dimension:'013-1',parentDimension:'013',checkpointKind:'progression'},workspaceMaterializations:[{id:'one',entries:[
      finalizeFile({path:wp,mediaType:'text/markdown',content:ws('one')}),
      finalizeFile({path:parentPath,mediaType:'text/markdown',content:parent}),
      finalizeFile({path:childPath,mediaType:'text/markdown',content:child})
    ]}],workspaceTargets:[{workspaceId:'one',path:wp}],additionalTransportFiles:[finalizeFile({path:'runtime/tools/tiinex-portable.mjs',mediaType:'text/javascript',content:'export {};\n'})],requirements:{},handoffRoutes:[]});
    assert.equal(assembled.status,'ready',JSON.stringify(assembled.findings));
    const carrier=path.join(dir,'test.handoff-package.zip');
    await writeFile(carrier,handoffPackageV1ZipBytes(assembled.bundle));
    const focused=await discoverCarrierFrontier({carrier,focus:`one/${childPath}`});
    assert.ok(focused.integrityFindings.some((f)=>f.code==='lineage.parent.integrityMismatch'),JSON.stringify(focused));
    assert.ok(focused.focusIntegrityFindings.some((f)=>f.nodeId===`one/${childPath}`));
    assert.equal(focused.focusNeighborhood.status,'ready');
    const unfocused=await discoverCarrierFrontier({carrier});
    assert.equal(unfocused.focusIntegrityFindings,null);
  } finally {await rm(dir,{recursive:true,force:true});}
});
