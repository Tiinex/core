# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/9ef3c2caed38152b1948c93cb45c985786660d91/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-10-14 23:14:32
  - Trace: [001-4-1-1-1-1-1-first-use-evidence-informed-entry-v2-and-matched-bootstrap-prefl.trace.md](001-4-1-1-1-1-1-first-use-evidence-informed-entry-v2-and-matched-bootstrap-prefl.trace.md)
  - Origin:
    - [relative](001-4-1-1-1-1-1-first-use-evidence-informed-entry-v2-and-matched-bootstrap-prefl.trace.md)
- Current
  - Current Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/9ef3c2caed38152b1948c93cb45c985786660d91/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-10-15 00:04:41
  - Authors: Anchor
  - Why: Reduce duplicate unqualified outer cold-start instructions while preserving qualified package authority and explicit session selections.
  - Summary: Bounded Core route-less transport simplification preserving Start and bootstrap replacement intent.
  - Status: ready/local

---

# First-Use Transport — Keep Start Authoritative

## Supported Claim Or Question

- Supported Claim Or Question: Does Core's route-less Package V1 transport duplicate cold-start safety, runtime-reuse and authority instructions already carried by Start, and can transport be shortened without losing a qualified Entry/Target selection or an operator-requested bootstrap-replacement intent?
- Evidence Role: Bounded local source inspection, focused regression and transport projection tests, proposed full-carrier receiver test; not a fresh independent ChatGPT Web behavioral test.

## Provenance

- Known Source: qualified 17-Workspace `tiinex-042-1-1-1.handoff-package.zip` and its Start; Core `carrierProjection.js`, `workspaceEntryProjection.js`, existing tests; 012's separate authorized prototype checkpoint/recovery observation and Sigma's approval of simplifying duplicated transport after the diagnostic test.
- Preservation Basis: the exact Core Workspace snapshot was extracted from the qualified carrier, with original 16 other Workspace snapshots preserved; changes are limited to Core's route-less human transport projection plus matching regression tests and this Evidence.
- Provenance Limits: the original 012 test used the longer transport, so its observed LLM behavior cannot independently establish whether shortened transport changes recipient behavior.

## Evidence Material

- start-source
  - Material: carrier Start artifact in the parent package and canonical Package V1 Start generator.
  - Material Kind: qualified carrier Start
  - Description: declares pointerless/route-less semantics, direct bootstrap extraction, optional `version --json` and `composition.sha256` identity comparison, exact semantic `orient`, and non-upgrade of authority. Transport repeated these instructions before the selected Entry/Target material.
- bounded-implementation
  - Material: Core module route-less transport projection
  - Material Kind: small Core implementation candidate
  - Description: preserve the shared outside-ZIP `Handoff package attached`, direct Start locator and bounded extraction warning. Remove route-less Workspace and bootstrap-only copies of Start's rules. Preserve a concise explicit *operator intent* for bootstrap replacement because its special purpose is not established by the ordinary bootstrap-only package role.
- regression
  - Material: four existing Core regression test modules
  - Material Kind: focused local tests
  - Description: new assertions require direct Start handling, prohibit redundant runtime-reuse text for route-less carriers, retain route and explicit Entry selection boundaries, and retain the special bootstrap replacement intent. Three selected suites passed 26/26. Extended package tests and receiver replay remain separate gates.

## Preservation And Fidelity

- Preservation State: candidate Core-only change; no changes to Docs, Native, Interop, schemas, Workspace boundary rules or established 012 Entry/Target definitions.
- Fidelity Notes: route-less and routed Handoff transport remain distinct. A selected Entry or Target is always explicit, never inferred by a carrier label. Start is the authority for cold-start mechanics.
- Known Losses: absent external controlled A/B on two fresh LLM recipients, so token reduction and absence of textual duplication are confirmed but behavioral equivalence remains a hypothesis until independent use.

## Interpretation Limits

- Does Not Prove: that a short prompt always induces first-pass cold grounding, that all hosts display attachments equivalently, that 012 was caused solely by Entry v2, or that one green suite proves semantic correctness.
- Must Not Be Treated As: permission to drop Start, inline a new bootstrap contract, omit separately selected guided Entry/Target intent, or treat replacement as an ordinary Handoff/work-authority transfer.
- Not Yet Used As: a reason to modify accepted 012 carrier bytes or overwrite Sigma-accepted material.
- Next Qualification: build carrier with the current Core candidate, replay a fresh bootstrap and inspect generated ordinary, selected Entry/Target and replacement transports, then ask for independent behavioral testing only if it adds useful evidence.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-4-1-1-1-1-1-first-use-evidence-informed-entry-v2-and-matched-bootstrap-prefl.trace.md](001-4-1-1-1-1-1-first-use-evidence-informed-entry-v2-and-matched-bootstrap-prefl.trace.md)
  - Value: _psH35fyci9AgxO8GWDAvCO72mRs6veVysHxvyQlqEo

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: CYzk-h4CqUxgFZ5KzZoQt55Ewe6ptBD1UhbGo3jsvpU