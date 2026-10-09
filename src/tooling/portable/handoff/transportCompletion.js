import { inspectHandoffPackageV1 } from './handoffPackageV1.inspect.js';
import { projectHandoffCarrierOutputFromPackage } from './carrierProjection.js';
import { projectWorkspaceCarrierEntry } from './workspaceEntryProjection.js';

export const TRANSPORT_COMPLETION_SCHEMA_ID = 'tiinex.portable.transport-completion.v1';

// Read-only. The qualified package projection and the selected What/Where Entry
// own the transport text. This formatter does not reconstruct routes, select a
// recipient, interpret a Process, or make any transport side effects.
export function projectPortableTransportCompletion(input = {}) {
  const inspection = input.inspection || inspectHandoffPackageV1(input.bundle || input.package || input);
  if (inspection?.status !== 'valid') return blocked('carrier-invalid', inspection?.findings || []);
  let output;
  try { output = projectHandoffCarrierOutputFromPackage({
    inspection,
    route: input.route || input.routeId || '',
    filename: input.filename || input.transportFilename || '',
    collisionInstance: input.collisionInstance || 1
  }); } catch { return blocked('carrier-filename-invalid'); }
  if (output.status !== 'ready' || !output.primary?.filename || !output.normalInlineRouting?.content) {
    const selectableRoutes = (output.routes || []).map(route => ({ routeId: route.routeId, recipient: route.to || '', pointerPath: route.pointerPath, transportText: route.transportText }));
    const selectionRequired = output.status === 'selection-required';
    const basename = String(input.filename || input.transportFilename || '').trim();
    const markdown = selectionRequired ? [
      '# Tiinex transport instructions — route selection required', '',
      `Carrier: \`${inlineCode(basename || '(qualified carrier)')}\``, '',
      'This carrier contains multiple qualified Handoff routes. Select one exact route in Transport before copying text. No recipient was selected automatically.', '',
      ...selectableRoutes.map(r => `- \`${inlineCode(r.routeId)}\` — To ${r.recipient}; pointer \`${inlineCode(r.pointerPath)}\``), '',
      'This is an informational view. No transport has been performed.', ''
    ].join('\n') : '';
    return blocked(selectionRequired ? 'route-selection-required' : `carrier-output-${output.status || 'unavailable'}`, output.findings || [], {
      routes: selectableRoutes, markdown,
      nextAction: 'Select one exact qualified route; do not infer a primary recipient.'
    });
  }

  const entryId = String(input.entryId || input.entry || input.mode || '').trim();
  const targetId = String(input.targetEntryId || input.target || input.where || '').trim();
  let entry = null;
  let text = output.normalInlineRouting.content;
  if (targetId && !entryId) return blocked('target-requires-purpose-entry');
  if (entryId) {
    entry = projectWorkspaceCarrierEntry({
      inspection,
      contentSources: input.contentSources || input.sources || [],
      entryId, targetEntryId: targetId, route: input.route || input.routeId || '',
      customInstruction: input.customInstruction || '',
      primaryRole: input.primaryRole || null, participants: input.participants || []
    });
    if (entry.status !== 'ready' || entry.state !== 'rendered' || !entry.transportText) {
      return blocked(`entry-${entry.reasonCode || entry.status || 'unqualified'}`, entry.findings || [], {
        nextAction: 'Qualify the exact purpose Entry and compatible Target Entry before projecting recipient instructions.'
      });
    }
    // Reuse only the qualified Entry's semantic augmentation and the exact
    // canonical carrier shell. The older Guided Entry's pointerless shell is
    // intentionally not authoritative when the carrier projector changes.
    const augmentation = String(entry.entryAugmentationText || '').trimEnd();
    if (!augmentation.startsWith('Entry intent: ')) return blocked('entry-augmentation-unqualified');
    text = `${output.normalInlineRouting.content.trimEnd()}\n\n${augmentation}\n`;
  }
  const target = entry?.targetDefinition || null;
  const source = target ? Object.freeze({
    id: target.id, sourceKind: target.sourceKind, sourceId: target.sourceId || '',
    workspaceId: target.workspaceId || '', artifactPath: target.artifactPath || '',
    canonicalIdentifier: target.canonicalIdentifier || '',
    materialSourceKind: 'qualified-target-entry',
    hostMethod: String(target.method?.Method || '').trim(),
    presentationGuidance: String(target.presentation?.['Presentation Guidance'] || '').trim(),
    materials: Object.freeze((target.target?.material || []).map(material => Object.freeze({
      name: material.name, reference: material.reference, purpose: material.purpose,
      qualificationNotes: material.qualificationNotes
    })))
  }) : null;
  const route = output.selectedRoute || null;
  const filename = output.primary.filename;
  const nextActions = [
    `Attach the unmodified carrier named ${filename} to the intended recipient or transport surface.`,
    output.primary.routeId ? 'Copy the exact selected route text below alongside the carrier. A different route requires a fresh qualified projection.' : 'Use the generic Start text below; no recipient or Handoff route is implied.',
    target ? 'After bootstrap, qualify the declared Target Material before following any host-specific procedure. Referenced Process material is not automatically applicable.' : 'No target-specific procedure has been qualified. Select a compatible Target Entry if host-specific instructions are needed.',
    'The clipboard operation, upload and recipient acceptance are not established by this projection.'
  ];
  const markdown = [
    '# Tiinex transport instructions', '',
    `Carrier: \`${inlineCode(filename)}\``,
    `Mode: ${output.primary.kind}`,
    `Route: ${route ? `\`${inlineCode(route.id)}\`` : 'None (pointerless)'}`,
    `Recipient: ${route?.parties?.to || 'Not declared'}`,
    `Entry: ${entry?.modeDefinition?.label || 'Generic (no Entry selected)'}`,
    `Target: ${entry?.targetOption?.label || 'Generic (no Target Entry selected)'}`,
    '', '## Exact clipboard text', '', codeFence(text), '',
    '## Operator next steps', '', ...nextActions.map(value => `- ${value}`)
  ];
  if (source) markdown.push('', '## Qualified Target Entry source', '',
    `- Identifier: \`${inlineCode(source.canonicalIdentifier)}\``,
    `- Source: \`${inlineCode(`${source.sourceKind}:${source.workspaceId || source.sourceId}::${source.artifactPath}`)}\``,
    '- Referenced material is context, not an activated Process or execution grant.',
    ...(source.hostMethod ? ['', '### Environment-specific method (declared by Target Entry)', '', source.hostMethod] : []),
    ...(source.presentationGuidance ? ['', '### Presentation guidance (declared by Target Entry)', '', source.presentationGuidance] : []),
    ...source.materials.map(material => `- ${material.name}: ${material.reference} — ${material.purpose}`));
  markdown.push('', '## Qualification boundary', '', 'This view does not alter carrier bytes, recipient Role, Handoff route, operator approval, file state, or transport completion.', '');
  return Object.freeze({
    schema: TRANSPORT_COMPLETION_SCHEMA_ID, status: 'ready',
    carrier: Object.freeze({ filename, kind: output.primary.kind, routeId: output.primary.routeId || '', selectedRoute: route, startPath: output.primary.startPath }),
    clipboardText: text, canonicalTransportText: output.normalInlineRouting.content,
    targetSource: source, entryId: entry?.entryId || '',
    markdown: markdown.join('\n'), nextActions: Object.freeze(nextActions),
    clipboardStatus: 'not-performed', uploadStatus: 'not-performed',
    boundary: 'Read-only, source-qualified projection. The selected exact route and carrier are unchanged. Target Entry selection is environment adaptation only.'
  });
}

function codeFence(value) {
  const max = Math.max(3, ...Array.from(String(value).matchAll(/`+/g), x => x[0].length + 1));
  const fence = '`'.repeat(max);
  return `${fence}text\n${value.replace(/\n$/, '')}\n${fence}`;
}
function inlineCode(value) { return String(value || '').replaceAll('`', ''); }
function blocked(reasonCode, findings = [], extra = {}) {
  return Object.freeze({ schema: TRANSPORT_COMPLETION_SCHEMA_ID, status: 'blocked', reasonCode,
    findings: Object.freeze([...findings]), ...extra,
    boundary: 'Fail-closed read-only projection: no transport side effects or invented routing.' });
}
