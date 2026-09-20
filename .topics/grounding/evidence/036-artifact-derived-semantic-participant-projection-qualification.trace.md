# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-19 11:48:46
  - Trace: [029-artifact-derived-semantic-participant-projection.trace.md](../029-artifact-derived-semantic-participant-projection.trace.md)
  - Origin:
    - [relative](../029-artifact-derived-semantic-participant-projection.trace.md)
- Current
  - Current Schema: tiinex.evidence.v1
  - Created At: 2026-09-19 18:29:57
  - Authors: Loom
  - Why: Close Core Task 029 with exact implementation and regression evidence.
  - Summary: Qualify ordinary ground positive participant projection from exact current-work declaration plus exact Role material while preserving carriage-only non-participation.
  - Status: ready/local

---

# Artifact-Derived Semantic Participant Projection Qualification

## Supported Claim Or Question

- Supported Claim Or Question: does ordinary public `ground` derive a bounded semantic participant map from one closed explicit current-work participant declaration plus exact qualified Role material, while Role/cache carriage, participant grounding pointers, Handoff endpoints, filenames, transport, user identity, and chat identity remain non-participant by themselves
- Evidence Role: implementation and regression qualification evidence for Core Task `029-artifact-derived-semantic-participant-projection.trace.md`

## Provenance

- Known Source: exact continued Core Workspace materialized by qualified `ground --continue` from package SHA256 `cb0a8cea4d684ef8105cebef13c579af4babe555399ebca35193e03c8b811e31`, selected route `001-4-1-1-1-handoff-pointer.trace.md`, plus deterministic local Core test execution.
- Preservation Basis: implementation was performed only inside the qualified carried Core Workspace; accepted Axiom Decision `docs::.topics/grounding/020-axiom-decision-participant-authority-from-role-cache-presence.trace.md` and exact Sigma Role `business::.topics/roles/001-4-1-sigma-canonical-holder-cutover-role.trace.md` were consumed as selected-route Required Context rather than rewritten or inferred.
- Provenance Limits: this Evidence qualifies the bounded Core implementation and tests only; it does not perform Anchor's retained Pilot/Sigma behavioral acceptance or succession decision.
- Source Artifact: `core/.topics/grounding/029-artifact-derived-semantic-participant-projection.trace.md`
- Relation: implementation qualification of Task `029`, delegated by `core/.topics/grounding/handoffs/059-anchor-to-loom-artifact-derived-semantic-participant-projection.trace.md`
- Capture Time: 2026-09-19

## Evidence Material

- Material: Core now projects participant authority through a dedicated artifact-derived authority seam. It accepts only a closed Objective sentence of the form `<Role> is an explicitly required [human ]participant in this current work[ because <reason>].`; the declaration must occur on exact qualified current Task material, and the named Role must resolve to exactly one exact qualified `tiinex.party.role.v1` artifact from selected-route bounded endpoint, grounding-pointer, or Required Context material. The Role material qualifies an already-declared Role and never creates participation by carriage. Qualified projections preserve both declaration Task provenance and exact Role source provenance; ambiguous duplicate declarations, missing/ambiguous Role material, near-match/free prose, and cardinality above the bounded maximum fail closed. Multiple qualified declarations are ordered deterministically by normalized Role label rather than package placement.
- Material Kind: exact source implementation plus focused positive/negative integration and full Core regression qualification
- Description: `src/tooling/portable/grounding/grounding.participantArtifactAuthority.js` SHA256 `f57a08c28205e787d176a438b5818db6c4f321224c6508e45134d779c090b7dc`; `grounding.capsule.js` SHA256 `a0428453f5d7302b89f2c4b3a0bfc90f639687d3583de074aefc67e8f4a2ec5c`; `grounding.participantContext.js` SHA256 `2d30b088a7a23a4e5ba42c93ec984756b5623b8306b15bb27c8b0dbd5970a1b4`; focused test files SHA256 `675e2c409149bb72ecf6ec12519f41614a61c33abdb0952cf6148b58de6509da` and `dfe81560820f299ade68a0ccca66e5b0bea65d95a0b6922ca60e38319059f8ea`.
- Sample Reference: ordinary-ground integration establishes exactly `Sigma` with `participantMapState = explicit-bounded-map`; Axiom's participant Role grounding pointer and Handoff endpoints remain `semanticParticipant = false`. Removing the closed current-work Sigma declaration while retaining exact Sigma Required Context Role material produces no semantic participant. Unit negatives independently cover Role-only Required Context carriage, grounding-pointer-only, endpoint-only, missing Role material, duplicate declaration ambiguity, and near-match prose.
- External Payload: focused participant projection `32/32` pass; ordinary blank-workspace/cache grounding `11/11` pass; complete `test/*.test.mjs` regression was exercised in bounded batches after the host command-duration ceiling interrupted the monolithic invocation, yielding `188` pass / `0` fail with one environment-gated package-surface case skipped only because direct `node` lacked `npm_execpath`; that exact package-surface case was rerun under npm and passed `1/1`, leaving all test cases exercised with no failures. `npm run test:portable` passes. `npm run test:bootstrap` reports `embedded-qualified`, manifest SHA256 `711eeae10dc9a99bbe0198829457009f5c14a26d5edb4be111838ea335b463b2`, representation SHA256 `5ab3a29ff8705ddeed924753f1f9aeba08c9cc62fb5f6af1d819c3d36701a8a9`, `514` runtime files, `5737013` runtime bytes.

## Preservation And Fidelity

- Preservation State: qualified local Evidence derived from exact continued Workspace source bytes and deterministic Core test receipts.
- Fidelity Notes: source SHA256 values identify the exact implementation/test bytes used for the final focused qualification; test outcomes are recorded by command and count without converting Role carriage into semantic authority.
- Known Losses: raw TAP/console streams are summarized rather than embedded in full; the monolithic `npm test` process exceeded the host execution ceiling, so the identical complete test-file set was run in bounded batches and the sole environment-gated package-surface case was then exercised under npm.
- Representation Limits: passing Core tests prove the stated implementation behavior under the covered fixtures; they are not a substitute for Anchor's retained real Pilot/Sigma sanity.

## Interpretation Limits

- Does Not Prove: that Sigma or any other Role participates in unrelated work, that Role/cache carriage itself is participant authority, or that Pilot/Sigma behavioral sanity and succession have passed.
- Not Yet Used As: Anchor acceptance of Task `029`, second-specialist behavioral acceptance, or succession authority.
- Must Not Be Treated As: permission to infer participant membership from participant Role pointers, Handoff endpoints, Required Context inventory, filenames, package location, transport, user identity, chat identity, or Role labels without the exact closed current-work declaration and exact qualified Role material.
- Authority Limits: bounded Core ordinary-ground participant authority projection, provenance, fail-closed ambiguity handling, deterministic bounded multi-participant behavior, and the stated regression gates only.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [029-artifact-derived-semantic-participant-projection.trace.md](../029-artifact-derived-semantic-participant-projection.trace.md)
  - Value: 8eK0NzGgHL1X14bu7Qx4bNCv7h95ASEahUZ719SR2iQ

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: OpNJ-_xrZ1TPLf_Q0yD8OFYCHefMk1T6nkoJ2cTOFOI