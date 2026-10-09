import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';
import { projectPortableFormFieldHelp } from '../src/tooling/portable/schema/form.fieldHelp.js';
import { runPortableOperation } from '../src/tooling/portable/operation.catalog.js';

test('Evidence field help is sourced from an exact qualified schema section', () => {
  const help = projectPortableFormFieldHelp({ schemaId: 'tiinex.evidence.v1', field: 'Material' });
  assert.equal(help.status, 'qualified');
  assert.equal(help.fields.length, 1);
  const material = help.fields[0];
  assert.equal(material.status, 'qualified');
  assert.equal(material.group, 'Evidence Material');
  assert.equal(material.field, 'Material');
  assert.equal(material.source.contextScope, 'schema-validation-group');
  assert.match(material.source.excerpt, /- Material Kind/);
  assert.ok(material.source.fieldLine > material.source.groupLine);
  assert.equal(material.source.publicationState, 'qualified-local-unpublished');
  assert.equal(material.source.commit, '');
  assert.match(material.source.checksum, /^[a-f0-9]{64}$/);
  assert.ok(material.source.schemaPath.endsWith('tiinex.evidence.v1.schema.md'));
});

test('Ordinary Evidence group children inherit only their own exact schema provenance', () => {
  const result = projectPortableFormFieldHelp({ schemaId: 'tiinex.evidence.v1' });
  for (const key of ['Supported Claim Or Question', 'Evidence Role']) {
    const child = result.fields.find((item) => item.input === key && item.field === key);
    assert.equal(child?.status, 'qualified', key);
    assert.equal(child?.group, 'Supported Claim Or Question');
    assert.ok(child?.source?.fieldLine > child?.source?.groupLine);
    assert.match(child?.source?.fieldRule || '', new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  const single = projectPortableFormFieldHelp({ schemaId: 'tiinex.evidence.v1', field: 'Evidence Role' });
  assert.equal(single.fields.length, 1);
  assert.ok(single.fields[0].source.fieldRule.includes('Evidence Role'));
  const unknown = projectPortableFormFieldHelp({ schemaId: 'tiinex.evidence.v1', field: 'Not a field' });
  assert.deepEqual(unknown.fields, []);
});

test('Handoff schema fields preserve their separate binding and provenance', () => {
  const help = projectPortableFormFieldHelp({ schemaId: 'tiinex.handoff.v1', field: 'Purpose' });
  assert.equal(help.status, 'qualified');
  assert.equal(help.fields[0].source.contextScope, 'schema-validation-group');
  assert.ok(help.fields[0].source.fieldLine > 0);
});

test('Unknown inputs never inherit unrelated help and missing schema is unavailable', () => {
  const unknown = projectPortableFormFieldHelp({ schemaId: 'tiinex.evidence.v1', field: 'not-a-field' });
  assert.equal(unknown.status, 'unavailable');
  assert.deepEqual(unknown.fields, []);
  const missing = projectPortableFormFieldHelp({ schemaId: 'tiinex.not.real.v1' });
  assert.equal(missing.status, 'unavailable');
  assert.deepEqual(missing.fields, []);
});

test('Whole projection reports unresolved mappings instead of fabricating source authority', () => {
  const all = projectPortableFormFieldHelp({ schemaId: 'tiinex.evidence.v1' });
  assert.equal(all.counts.projected + all.counts.unresolved, all.fields.length);
  assert.ok(all.fields.some((f) => f.input === 'Material' && f.status === 'qualified'));
  assert.ok(all.fields.every((f) => f.status === 'qualified' ? f.source?.schemaId === all.schemaId : f.source === null));
});

test('portable operation makes the same qualified field help available to host/LLM consumers', async () => {
  const result = await runPortableOperation('form-field-help', { schemaId: 'tiinex.evidence.v1', field: 'Material Kind' });
  assert.equal(result.operation, 'form-field-help');
  assert.equal(result.fields?.length, 1);
  assert.equal(result.fields?.[0]?.status, 'qualified');
  assert.equal(result.fields?.[0]?.source?.contextScope, 'schema-validation-group');
});

test('unmapped Presentation Surface creation fields stay explicitly unresolved', () => {
  const projection = projectPortableFormFieldHelp({ schemaId: 'tiinex.presentation.surface.v1', field: 'Surface Id' });
  assert.equal(projection.status, 'partial');
  assert.equal(projection.fields.length, 1);
  assert.equal(projection.fields[0].status, 'unresolved');
  assert.equal(projection.fields[0].source, null);
  assert.deepEqual(projection.findings, ['Surface Id:exact-schema-field-unavailable']);
});

// CLI is the same portable boundary that VS Code/other hosts consume.
test('CLI form-field-help returns field/line provenance without external material input', () => {
  const executable = fileURLToPath(new URL('../tools/tiinex-portable.mjs', import.meta.url));
  const receipt = JSON.parse(execFileSync(process.execPath, [executable, 'form-field-help', '--schema', 'tiinex.evidence.v1', '--field', 'Material', '--compact'], { encoding: 'utf8' }));
  assert.equal(receipt.operation, 'form-field-help');
  assert.equal(receipt.fields.length, 1);
  assert.equal(receipt.fields[0].status, 'qualified');
  assert.ok(receipt.fields[0].source.fieldLine > 0);
  assert.equal(receipt.fields[0].source.commit, '');
  assert.equal(receipt.fields[0].source.publicationState, 'qualified-local-unpublished');
});

test('portable CLI unresolved field reports a structured finding, never a character-expanded string', () => {
  const executable = fileURLToPath(new URL('../tools/tiinex-portable.mjs', import.meta.url));
  const receipt = JSON.parse(execFileSync(process.execPath, [executable, 'form-field-help', '--schema', 'tiinex.presentation.surface.v1', '--field', 'Surface Id', '--compact'], { encoding: 'utf8' }));
  assert.equal(receipt.status, 'partial');
  assert.equal(receipt.fields[0].status, 'unresolved');
  assert.equal(receipt.findings[0].code, 'portable.form-field-help.source-unresolved');
  assert.match(receipt.findings[0].message, /Surface Id:exact-schema-field-unavailable/);
  assert.equal(Object.hasOwn(receipt.findings[0], '0'), false);
});
