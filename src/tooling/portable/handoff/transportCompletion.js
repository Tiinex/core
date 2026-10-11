import { inspectHandoffPackageV1 } from './handoffPackageV1.inspect.js';
import { projectHandoffCarrierOutputFromPackage } from './carrierProjection.js';
import { projectWorkspaceCarrierEntry } from './workspaceEntryProjection.js';
import { projectOperatorTargetGuide } from './operatorTargetGuide.js';

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
  if (targetId && !entryId && !output.normalInlineRouting?.continueFrom) return blocked('target-requires-purpose-entry');
  if (entryId || targetId) {
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
    if (!augmentation.startsWith(entryId ? 'Entry intent: ' : 'Target intent: ')) return blocked('entry-augmentation-unqualified');
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
  // The companion is presented only in the human-facing receipt. It must not
  // enter the already-qualified clipboard/transport projection.
  const operatorGuide = target ? projectOperatorTargetGuide({ inspection, targetDefinition: target }) : null;
  const route = output.selectedRoute || null;
  const filename = output.primary.filename;
  // A human-friendly suggestion only, never a semantic identifier or part of
  // the recipient's clipboard. Derive it from the short Tiinex prefix and the
  // already-qualified Handoff recipient, never from the full carrier slug.
  const projectTitle = suggestedProjectTitle(filename, route);
  const targetName = entry?.targetOption?.label || 'your chosen platform';
  const nextActions = [
    `Attach the unchanged package \`${filename}\` through ${targetName}'s regular upload interface.`,
    'Paste the exact text above into the receiving conversation and send it yourself.',
    'Keep this human guide separate from the text for the receiving assistant.'
  ];
  const markdown = [
    '# Send your Tiinex package', '',
    '## At a glance', '',
    `- **Send to:** ${route?.parties?.to || 'The receiving conversation you choose'}`,
    `- **Use:** ${targetName}`,
    ...(projectTitle ? [`- **Suggested project title:** \`${inlineCode(projectTitle)}\` — copy this as the project name, not the long ZIP filename.`] : []),
    `- **File to attach:** \`${inlineCode(filename)}\``, '',
    ...(operatorGuide?.status === 'ready' ? [
      '## Get ready', '',
      'These instructions help **you**, the person sending the package. They are not included in the text you will paste into the chat.', '',
      operatorGuide.markdown, ''
    ] : [
      '## Get ready', '',
      'Use the receiving platform’s normal file attachment and message controls. No platform-specific guide has been qualified for this selection.', ''
    ]),
    '## Exact text to paste into the chat', '',
    'Copy this text without rewriting it, alongside the unchanged ZIP package.', '',
    codeFence(text), '',
    '## Final check', '',
    ...nextActions.map(value => `- ${value}`), '',
    '## Technical details (optional)', '',
    `- Handoff route: ${route ? `\`${inlineCode(route.id)}\`` : 'None (informal entry)'}`,
    `- Purpose: ${entryId ? (entry?.modeDefinition?.label || 'Guided Entry') : (route ? 'Defined by the Handoff Pointer' : 'Generic')}`,
    `- Target: ${entry?.targetOption?.label || 'None'}`,
    ...(operatorGuide?.status === 'ready' && operatorGuide.reviewState !== 'accepted'
      ? ['- Guide status: proposed. Check the linked provider instructions for current settings and rules.'] : []), ''
  ];
  if (source) markdown.push('### Target source', '',
    `- Identifier: \`${inlineCode(source.canonicalIdentifier)}\``,
    `- Source: \`${inlineCode(`${source.sourceKind}:${source.workspaceId || source.sourceId}::${source.artifactPath}`)}\``,
    '- Linked material is supporting context, not an activated procedure or permission.',
    ...(source.hostMethod ? ['', '### Technical platform method', '', source.hostMethod] : []),
    ...(source.presentationGuidance ? ['', '### Technical presentation guidance', '', source.presentationGuidance] : []),
    ...source.materials.map(material => `- ${material.name}: ${material.reference} — ${material.purpose}`));
  if (target && operatorGuide?.reasonCode && operatorGuide.reasonCode !== 'not-declared') markdown.push('',
    '### Human guide unavailable', '',
    `No guide was displayed (${operatorGuide.reasonCode}). No instructions were guessed from filenames or unrelated annotations.`);
  markdown.push('', '### What this preview does not do', '',
    'This preview does not upload files, send messages, change who receives the handoff, or authorize actions on another platform.', '');
  return Object.freeze({
    schema: TRANSPORT_COMPLETION_SCHEMA_ID, status: 'ready',
    carrier: Object.freeze({ filename, kind: output.primary.kind, routeId: output.primary.routeId || '', selectedRoute: route, startPath: output.primary.startPath }),
    clipboardText: text, canonicalTransportText: output.normalInlineRouting.content,
    targetSource: source, operatorGuide, entryId: entry?.entryId || '',
    markdown: markdown.join('\n'), nextActions: Object.freeze(nextActions),
    clipboardStatus: 'not-performed', uploadStatus: 'not-performed',
    boundary: 'Read-only, source-qualified projection. The selected exact route and carrier are unchanged. Target Entry selection is environment adaptation only.'
  });
}

function suggestedProjectTitle(filename, route) {
  const prefix = String(filename || '').match(/^(tiinex-\d+)(?=-|\.|$)/i)?.[1] || '';
  const recipient = String(route?.parties?.to || '').trim();
  if (!prefix || !recipient || !/^[\p{L}\p{N}][\p{L}\p{N} ._-]{0,48}$/u.test(recipient)) return '';
  return `${prefix} (${recipient})`;
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
