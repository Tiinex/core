import test from 'node:test';
import assert from 'node:assert/strict';
import { buildArtifactCreationContract, validateArtifactCreationResult } from '../src/schemas/creation.contracts.js';
import { renderArtifactCreationDraftMarkdown } from '../src/schemas/creation.renderer.js';

const BASE_VALUES = Object.freeze({
  'Name': 'Bounded Orientation',
  'Version': '1',
  'Canonical Identifier': 'example.bounded.orientation.v1',
  'Purpose': 'Establish the initial context needed to enter a bounded subject.',
  'In Scope': 'initial preparation and orientation',
  'Out Of Scope': 'occurrence evidence or authority',
  'Entry Target': 'a bounded subject',
  'Required Context': 'the declared subject and required context',
  'Preparation Method': 'recover required context and preserve unresolved uncertainty',
  'Method': 'establish the bounded current picture before ordinary activity proceeds',
  'Readiness Boundary': 'required context is sufficiently established to proceed',
  'Does Not Establish': 'an occurrence, authority, ownership, transfer, acceptance, or completion',
  'Must Not Be Inferred': 'that nearby material is controlling merely because it is available',
  'Portable Semantics': 'establish sufficient initial orientation before proceeding',
  'Environment Assumptions': 'required context can be accessed or absence can remain explicit',
  'Non-Portable Details': 'software, provider, host, interface, storage, or physical venue'
});

function render(schemaId, values) {
  const contract = buildArtifactCreationContract({ schemaId, transitionType: 'create-artifact' });
  assert.equal(contract.status, 'ready', JSON.stringify(contract.findings));
  const markdown = renderArtifactCreationDraftMarkdown(contract, {
    values,
    title: 'Bounded Orientation',
    summary: 'Bounded Orientation',
    authors: 'Axiom',
    createdAt: '2026-10-01T19:00:00Z'
  });
  const validation = validateArtifactCreationResult({ schemaId, status: 'local', sourceMode: 'local-test', markdown }, {}, { contract, expectedAuthors: 'Axiom' });
  assert.equal(validation.status, 'valid', JSON.stringify(validation.findings));
  return markdown;
}

test('generic creation omits optional-only sections when no optional input is supplied', () => {
  const markdown = render('tiinex.entry.v1', BASE_VALUES);
  assert.doesNotMatch(markdown, /^## Presentation And Interaction$/m);
});

test('generic creation renders and preserves supplied optional scalar and declaration sections', () => {
  const markdown = render('tiinex.entry.session.v1', {
    ...BASE_VALUES,
    'Presentation Guidance': 'Lead with the current participant-relevant picture.',
    'Grounding Material': [
      {
        name: 'Governing process',
        fields: {
          Reference: '[Process](../process.trace.md)',
          Purpose: 'Establish the process boundary for the session.'
        }
      }
    ]
  });
  assert.match(markdown, /^## Presentation And Interaction$/m);
  assert.match(markdown, /- Presentation Guidance: Lead with the current participant-relevant picture\./);
  assert.match(markdown, /^## Grounding Material$/m);
  assert.match(markdown, /- Governing process\n  - Reference: \[Process\]\(\.\.\/process\.trace\.md\)\n  - Purpose: Establish the process boundary for the session\./);
});
