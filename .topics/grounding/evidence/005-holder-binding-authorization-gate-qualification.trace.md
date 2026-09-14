# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-14 18:30:25
  - Trace: [005-holder-binding-authorization-gate-task.trace.md](../005-holder-binding-authorization-gate-task.trace.md)
  - Origin:
    - [relative](../005-holder-binding-authorization-gate-task.trace.md)
- Current
  - Current Schema: tiinex.evidence.v1
  - Created At: 2026-09-14 18:53:46
  - Authors: Loom
  - Why: Anchor delegated the final Core gate required by the accepted post-Test-2 holder-binding reconciliation.
  - Summary: Qualify exact Role holder-assignment authorization gating without durable identity or semantic broadening.
  - Status: ready/local

---

# Holder Binding Authorization Gate Qualification

## Supported Claim Or Question

- Supported Claim Or Question: can Core require exact qualified Role holder-assignment authorization in addition to a matching explicit consuming-session Role assertion before Role-recipient bounded action readiness, without inferring durable holder identity or broadening source/participant/process authority
- Evidence Role: qualifies Loom's Core implementation and adversarial regression coverage for Holder Binding Authorization Gate

## Provenance

- Known Source: exact Core Workspace materialized from the received qualified Anchor-to-Loom Handoff carrier after Start-qualified Tiinex bootstrap and explicit `Loom` consuming-session Role binding
- Controlling Task: `.topics/grounding/005-holder-binding-authorization-gate-task.trace.md`
- Received Route: `.topics/grounding/handoffs/008-anchor-to-loom-holder-binding-authorization-gate.trace.md`
- Preservation Basis: exact selected-Handoff authority and Required Context remained controlling; Business Role material was consumed read-only; Business and Docs were not mutated; no remote source, connector, repository fetch, publication, release or deployment was used
- Provenance Limits: Evidence covers only the delegated Core holder-binding authorization mechanics, projections and tests plus the exact local/live-carrier qualification described below; it does not establish durable holder identity, wider orchestration authority, participant/process semantics, implementation-source permission or deployment state
- Semantic Authority Boundary: Core implements only the accepted assignment gate summarized by the controlling Task and preserves all unrecognized Holder State wording as unresolved rather than inventing allow/deny semantics

## Evidence Material

- Material: patched portable Role parsing, holder-binding authorization projection, readiness gate, common authority/capsule/CLI projections and executable regressions
- Material Kind: host-neutral Core implementation and deterministic tests
- Assertion Separation: `--holder-role` remains `operator-session-input` with authority class `session-binding-input-only`; matching explicit input alone no longer satisfies Role-recipient act-readiness
- Authorization Projection: holder binding now carries a separate `authorization` object with state, assignment mode, exact Holder State text, source, reason code and Role artifact/section/field provenance
- Exact Qualified Basis: authorization requires exact qualified recipient Role material and reads only `Holder Relationship` / `Holder State`; Handoff endpoint, transport identity, provider/chat position, filenames and package placement remain non-authoritative
- Accepted Assignment Forms: Core recognizes only three exact qualified Holder State forms as the same bounded explicit-session/Handoff assignment mode: `assignable per explicit session or Handoff`; `assignable per explicit session or Handoff; no permanent holder asserted`; and `assignable per explicit session, role invocation, or Handoff; no permanent holder asserted`. Other wording remains unresolved; no substring or similarity heuristic is used.
- Durable Identity Separation: holder binding projects durable holder identity as `not-established` even when assertion and assignment authorization are both qualified
- Live Loom Role Proof: patched `ground` against the received carrier with `--holder-role Loom` resolved exact Loom Role path `001-3-business.workspace.zip::.topics/roles/001-3-loom-role.trace.md`, Role SHA-256 `8e6afdac36d2596a6c63d1fb6b318260fff728b1a99c4aa29a7253fd36b4a457`, exact Holder State `assignable per explicit session, role invocation, or Handoff; no permanent holder asserted`, `authorization.state: qualified`, assignment mode `explicit-session-or-handoff`, and readiness `grounded-to-act`
- Non-Broadening Proof: the same live receipt keeps durable identity `not-established`, implementation-source authority unresolved, wider participant/capability map not established and process applicability not established
- Focused Qualification: `node --test test/thin-lineage-grounding-projection.test.mjs test/bounded-handoff-carrier.test.mjs` passed 20/20
- Full Core Regression: `npm test` passed 129/129 with 0 failures and 0 skips
- Portable Smoke: `npm run test:portable` passed with `portable node surface imports`
- Embedded Bootstrap Qualification: `npm run test:bootstrap` returned `embedded-qualified`, manifest SHA-256 `58479f88f9974f7ae612f449cd80dbc718c87938f8675b147e9f4d248bdffd3a`, representation SHA-256 `0803bc1e54309232ca13d7a18234aa35c340402f59d4f51a773cdaa9e09dafb2`, 505 runtime files and 5,568,091 runtime bytes

## Implementation Delta

- Added: `src/tooling/portable/grounding/grounding.holderBindingAuthorization.js`
- Modified: `src/tooling/portable/handoff/coldStartQualification.materials.js`
- Modified: `src/tooling/portable/handoff/coldStartQualification.grounding.js`
- Modified: `src/tooling/portable/grounding/grounding.readiness.js`
- Modified: `src/tooling/portable/grounding/grounding.readiness.authority.js`
- Modified: `src/tooling/portable/grounding/grounding.participantAuthority.js`
- Modified: `src/tooling/portable/grounding/grounding.capsule.js`
- Modified: `src/tooling/portable/adapters/cli/cli.common-output.js`
- Modified: `test/thin-lineage-grounding-projection.test.mjs`
- Modified: `test/bounded-handoff-carrier.test.mjs`

## Adversarial Regression Boundary

- Authorized Assignable Role Case: exact qualified Role Holder State authorizes explicit-session/Handoff assignment, a matching explicit session assertion is separately required, and bounded readiness may become `grounded-to-act`
- Exact Anchor Wording Case: the qualified current Anchor form `assignable per explicit session or Handoff; no permanent holder asserted` is accepted exactly and is regression-covered alongside the controlling Task canonical form and the current Loom/Axiom role-invocation form; no fuzzy matching is used
- Silent Or Unresolved Role Case: matching explicit session assertion with no recognized exact Role assignment authorization stays `grounded-to-discuss` and returns `resolve-session-holder-binding-authorization`
- Mismatch Case: an explicit holder Role mismatch remains blocking even when Role material authorizes the assignment mode
- No Assertion Case: exact Role assignment authorization without an explicit matching consuming-session Role assertion remains `grounded-to-discuss` and requests the explicit session binding
- Different Instrument Case: qualified Role Holder State that requires some other assignment instrument remains unresolved; Core does not reinterpret it into explicit-session authorization
- Durable Identity Case: no authorized bounded session assignment establishes a permanent Party/person/model holder identity

## Preservation And Fidelity

- Preservation State: delegated Core holder-binding authorization mechanics are implemented and locally qualified; existing source-authority, participant/process, bounded Workspace, Recovery and cold-start semantics remain preserved
- Known Losses: none in the delegated Core source surface; no prior Required Context, Parent continuity, bounded/complete carriage, Recovery or source-evidence gate was weakened
- Fidelity Notes: exact Role Holder State text and source artifact path/SHA are projected so consumers can distinguish assertion provenance from authorization provenance
- Authority Fidelity: only exact qualified Role material can authorize the bounded assignment mode; operator/session input, endpoint labels and transport never supply authorization
- Identity Fidelity: authorization is for the bounded current session assignment mode only and explicitly does not prove durable holder identity
- Source Fidelity: implementation-source authority behavior remains unchanged and unresolved absent exact upstream qualified semantic projection
- Orchestration Fidelity: `grounded-to-act` remains bounded to the selected route and does not establish whole-program participant/process understanding

## Interpretation Limits

- Not Yet Used As: durable holder identity, participant identity, process applicability, implementation-source allow/deny state, publication, release or deployment authority
- Must Not Be Treated As: proof that a matching `--holder-role` declaration alone is authorized, proof that any Holder State containing similar words is accepted, or proof that Role assignment authorization grants wider semantic authority
- Does Not Prove: a permanent human/model/Party holder, consent beyond the accepted Role assignment mode, wider participant/capability relations or source mutation authority
- Must Not Be Used To Claim: authority to mutate Business or Docs, infer authorization from transport/chat position, reinterpret unrecognized Holder State wording, or broaden bounded route readiness into whole-program orchestration readiness

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [005-holder-binding-authorization-gate-task.trace.md](../005-holder-binding-authorization-gate-task.trace.md)
  - Value: 2MuBKyYw-7p-LUSsNs7zKAubbanutpYol0_VeOAeOTY

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 03dAihicdhjUE2kBdpL_hcFuwVpW_sBGEsSYxedyxRY