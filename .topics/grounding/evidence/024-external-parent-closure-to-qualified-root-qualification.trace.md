# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-17 15:57:46
  - Trace: [026-1-2-external-parent-closure-to-qualified-root-mechanics.trace.md](../026-1-2-external-parent-closure-to-qualified-root-mechanics.trace.md)
  - Origin:
    - [relative](../026-1-2-external-parent-closure-to-qualified-root-mechanics.trace.md)
- Current
  - Current Schema: tiinex.evidence.v1
  - Created At: 2026-09-17 17:00:21
  - Authors: Loom
  - Why: Record Loom qualification evidence for Task 026-1-2 external Parent closure mechanics.
  - Summary: Qualify exact external cache Parent-chain traversal to root with bounded fail-closed stop.
  - Status: ready/local

---

# External Parent Closure To Qualified Root Qualification

## Supported Claim Or Question

- Supported Claim Or Question: can selected-route grounding continue an exact declared Parent chain when the first external ancestor is available only as qualified received-package cache material, reach a qualified root without search or authority widening, and fail closed when the next exact ancestor is unavailable
- Evidence Role: qualifies Loom's bounded Core implementation for Task `026-1-2` external Parent closure mechanics

## Provenance

- Known Source: exact Core Workspace materialized from carrier dimension `003-2-2-1-2-1` by the received carrier's declared Tiinex bootstrap runtime after the selected Anchor-to-Loom route grounded `grounded-to-act`
- Controlling Task: `.topics/grounding/026-1-2-external-parent-closure-to-qualified-root-mechanics.trace.md`
- Received Failure Evidence: `.topics/grounding/evidence/023-fresh-axiom-cold-start-cache-closure-failure.trace.md`
- Preservation Basis: Core implementation and focused tests only were changed; received carrier bytes and external Business/Docs material remained read-only
- Provenance Limits: this Evidence qualifies exact selected-route external Parent traversal and its regression boundary only; it creates no participant, delegation, process, source, acceptance, integration, release, or remote mutation authority

## Evidence Material

- Material: exact selected-route external Parent traversal across qualified received-package cache material, root qualification, and bounded missing-ancestor failure
- Material Kind: host-neutral Core implementation and deterministic regression specimens

## Reproduction And Truncation Point

- Reproduced Shape: a fresh Anchor-to-Axiom selected route reaches the external Business epic `business::.topics/001-2-7-thin-lineage-anchor-grounding-orchestration-epic.trace.md` through qualified received-package cache material while its declared Parent is `business::.topics/001-2-tooling-project.trace.md`
- Prior Truncation: `expandRouteParentBoundaryClosure` could create the first external parent-boundary dependency, but traversal stopped because subsequent Parent parsing was limited to `workspaceRuntimeById` enumeration; a cache-only ancestor therefore could not contribute its own declared Parent
- Failure Consequence: the selected route remained short of a qualified root even though the exact next ancestor bytes were already qualified as bounded received-package material

## Implementation Delta

- Updated: `src/tooling/portable/adapters/node/handoff.manufacture.scope.js` — external Parent traversal now resolves only an exact `(workspaceId, normalized path)` artifact source from the selected Workspace runtime first, then already-qualified manufacture materials, then the exact received-package material provider
- Updated: `src/tooling/portable/adapters/node/handoff.manufacture.scope.js` — detached exact candidates are accepted only when matching bytes collapse to one digest; ambiguous material returns no source and remains fail-closed
- Updated: `src/tooling/portable/adapters/node/handoff.manufacture.scope.js` — a cache-only ancestor may now be parsed for its own declared Parent and rebound as an exact `parent-boundary` material while retaining `semanticAuthority: none` and `sourceSelectionAuthority: false`
- Updated: `src/tooling/portable/adapters/node/handoff.manufacture.scope.js` — when a declared next Parent is unavailable, the exact dependency is still emitted and traversal stops so manufacture reports the unresolved dependency rather than pretending root closure
- Updated: `src/tooling/portable/adapters/node/handoff.manufacture.js` — route Parent-boundary expansion receives the already-qualified package-parent exact-material provider; no global source discovery or Workspace widening is introduced
- Updated: `test/blank-workspace-role-cache-grounding.test.mjs` — adds fresh Axiom external-cache Parent-to-root coverage and the missing-next-ancestor bounded-stop negative

## Authority And Boundedness

- Exact Addressing: continuation uses exact Workspace id plus normalized artifact path and exact bytes; no sibling, filename-proximity, package-order, or semantic search fallback is allowed
- Ancestor Only: traversal follows only the declared Parent chain required by the selected route and stops at its qualified root or first missing/ambiguous exact ancestor
- Cache Boundary: received-package cache remains read-only availability evidence; rebinding it as `parent-boundary` does not grant semantic, source-selection, participant, endpoint, process, or mutation authority
- Missing Parent Boundary: if an external ancestor declares another Parent whose exact material is not qualified, manufacture remains blocked with `portable.handoff-material.dependency.unresolved`
- Preservation: existing pointer topology, holder binding, participant-first projection, sibling-route cache behavior, carrier numbering, and prefix preservation remain under their prior qualified mechanics

## Adversarial Regression Boundary

- Fresh Axiom Positive: a Core-only child route whose Task Parent is the cached Business epic consumes exact source-carrier cache material, discovers the epic's Business tooling-project Parent, manufactures both ancestors as `parent-boundary`, passes physical roundtrip, and grounds `grounded-to-act` with continuity `qualified` and the tooling project as qualified root
- Bounded Stop Negative: with the epic qualified but the declared tooling-project Parent omitted from exact material, planning emits the tooling-project dependency, no material is synthesized, and manufacture blocks on the unresolved dependency
- Prior Regression Surface: no-cache participant overlap, shared sibling cache, route-scoped ambiguity, selected-Handoff holder binding, topology, manufacture/orient/ground, and carrier behavior remain green

## Qualification

- Focused Qualification: `node --test test/blank-workspace-role-cache-grounding.test.mjs` passed `8/8`
- Full Core Regression: `npm test` passed `168/168`
- Portable Smoke: `npm run test:portable` passed (`portable node surface imports`)
- Embedded Bootstrap: `npm run test:bootstrap` passed with status `embedded-qualified`, runtime files `509`, runtime bytes `5676625`, manifest SHA-256 `4a781f5e6e4fb39233bb70438429e4aa36d3e756981a495246a537956b6af921`, representation SHA-256 `306acb1502b58e457e1ca0ba804d2a40b4ac5fdb58c74ad7149a4e8893c69230`
- Received Carrier Grounding: carrier `003-2-2-1-2-1` oriented and grounded to Loom through its declared bootstrap runtime before Workspace materialization without native continuation-pointer reading
- Source-Control Note: the materialized continuation Workspace intentionally contains no Git metadata, so Git diff/status checks are not available there; qualification is based on exact carried Workspace material, Tiinex continuation state, focused/full regressions, portable smoke, and embedded-bootstrap verification

## Preservation And Fidelity

- Preservation State: received carrier bytes and external Workspace material remain unchanged; only the bounded Core implementation/test surface plus this Evidence are authored in the continuation Workspace
- Fidelity Notes: all claims above are bounded to observed current-runtime manufacture/ground/test behavior and exact qualified material sources
- Known Losses: none identified within the qualified Task `026-1-2` implementation surface

## Interpretation Limits

- Does Not Prove: cached material is semantically current merely because carried; an undeclared or unqualified ancestor may be searched for; carrier lineage is artifact lineage; Anchor has accepted this return; or any remote repository has been integrated
- Not Yet Used As: Anchor acceptance, program-level completion, release/deployment approval, or remote integration evidence
- Must Not Be Treated As: authority for external cached Roles/Processes/Decisions, participant/delegation/process state, source ownership, mutation rights, or completion beyond the exact bounded Core mechanics qualified here

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [026-1-2-external-parent-closure-to-qualified-root-mechanics.trace.md](../026-1-2-external-parent-closure-to-qualified-root-mechanics.trace.md)
  - Value: qysjTnMeFjMyQLunBsbs9fvHymA1UsbC5Zn7OjHgpJU

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 8r2jQ9efWqLPZ_HLEvFJZu6g6r04rhabQ8sP4qzySGI