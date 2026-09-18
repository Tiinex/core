# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-17 11:57:14
  - Trace: [026-1-1-carrier-sibling-ordinal-and-prefix-preservation-mechanics.trace.md](../026-1-1-carrier-sibling-ordinal-and-prefix-preservation-mechanics.trace.md)
  - Origin:
    - [relative](../026-1-1-carrier-sibling-ordinal-and-prefix-preservation-mechanics.trace.md)
- Current
  - Current Schema: tiinex.evidence.v1
  - Created At: 2026-09-17 12:18:49
  - Authors: Loom
  - Why: Record exact Loom qualification evidence for the delegated carrier correction and retained no-manual-holder grounding requirement.
  - Summary: Qualify deterministic carrier route/consolidation ordinals, prefix preservation and exact selected-Handoff holder assignment.
  - Status: ready/local

---

# Carrier Sibling Ordinal, Prefix Preservation, And Recipient Holder Qualification

## Supported Claim Or Question

- Supported Claim Or Question: can Core preserve the exact sent carrier prefix, derive ordinary return siblings only from qualified selected Handoff Pointer order, derive batch consolidation as N+1 from the common pre-batch frontier, and let a fresh selected Handoff bind its exact recipient Role through canonical `handoff` Assignment Mode without manual `--holder-role`
- Evidence Role: qualifies Loom's bounded implementation for Task `026-1-1` together with the still-open holder-projection requirement retained by parent Task `026-1`

## Provenance

- Known Source: exact Core Workspace materialized by the received carrier's declared Tiinex bootstrap runtime from carrier dimension `003`, selected route `.topics/grounding/handoffs/039-anchor-to-loom-carrier-sibling-ordinal-prefix-preservation.trace.md`, with the bounded consuming session explicitly bound to Loom during bootstrap takeover
- Controlling Task: `.topics/grounding/026-1-1-carrier-sibling-ordinal-and-prefix-preservation-mechanics.trace.md`
- Parent Mechanics Task: `.topics/grounding/026-1-recipient-carrier-cache-and-grounding-mechanics.trace.md`
- Holder Projection Dependency: `.topics/grounding/026-qualified-handoff-recipient-holder-projection-mechanics.trace.md`
- Received Route: `.topics/grounding/handoffs/039-anchor-to-loom-carrier-sibling-ordinal-prefix-preservation.trace.md`
- Preservation Basis: Core alone was mutated; carried Business and Docs material remained read-only Required Context; no carrier input bytes, Business/Docs artifacts, remote source, release, publication or deployment were mutated
- Provenance Limits: Evidence qualifies only portable Core carrier allocation, cold-start holder binding, projections/help and deterministic regressions under the controlling Tasks; it does not create artifact Parent, participant, delegation, process, source, acceptance or completion authority

## Evidence Material

- Material: portable carrier sibling allocation/consolidation mechanics, selected-Handoff holder-binding projection, grounding readiness/provenance text, CLI help, and deterministic regression coverage
- Material Kind: host-neutral Core implementation and tests
- Ordinary Route Ordinal: exact qualified parent Handoff Pointer topology is canonicalized and the selected route receives dense sibling ordinal `1..N`; one route therefore returns as ordinal `1`
- Prefix Preservation: the child carrier dimension is the exact parent dimension plus only the selected route ordinal; retry count, local filesystem state, chat host, sender and artifact lineage do not alter the prefix
- Consolidation: `deriveHandoffConsolidationAllocation` requires qualified common-frontier route topology and derives consolidation sibling `N+1`; explicit conflicting values block and missing common-frontier topology fails closed
- Later Batch: subsequent route returns append their own ordinals to the consolidation frontier rather than to an arbitrary specialist return
- Major Boundary: explicit Major continuation remains separate through existing `advanceHandoffCarrierMajor`; no route count, retry, collision or artifact lineage infers a Major bump
- Retry Isolation: the existing `.tiinex-handoff-sibling-allocations` path remains legacy fallback only when qualified route topology is unavailable and an explicit advanced override is supplied; ordinary qualified route topology does not consume retry reservation state
- Collision Boundary: exact carrier output keeps byte-identical idempotency and divergent-byte collision failure unchanged
- Artifact-Lineage Boundary: carrier lineage remains transport/navigation projection only and is never copied into durable artifact Parent lineage by these mechanics
- Holder Binding Positive Source: normal grounding without explicit holder input may qualify a bounded holder binding only from exact selected Handoff consumption plus exact qualified recipient Role material whose canonical `Assignment Modes` authorizes `handoff`
- Holder Binding Provenance: the non-explicit source is `qualified-selected-handoff-consumption`; source detail carries the exact selected route pointer, Handoff artifact path/SHA-256, recipient Role artifact path/SHA-256/schema/label and assignment mode `handoff`; `qualifiedMaterialSource` is true and `inferredFromTransport` remains false
- Holder Binding Mode Isolation: explicit holder input remains independent; an explicit mismatching Role blocks and never falls back to selected-Handoff assignment, while a Role lacking canonical `handoff` authorization remains unresolved
- Orientation Boundary: package delivery/orientation alone does not bind a holder; the binding source is created only during exact selected-route grounding
- Durable Identity Boundary: selected-Handoff assignment establishes no durable identity, semantic participation, downstream delegate selection, process applicability, source authority, completion or broader Handoff acceptance

## Implementation Delta

- Updated: `src/tooling/portable/adapters/cli/cli.handoff-sibling-allocation.js` — added qualified N+1 common-frontier consolidation allocation and preserved ordinary route-topology allocation/legacy explicit fallback isolation
- Updated: `src/tooling/portable/adapters/cli/cli.handoff-manufacture.js` — added explicit `--package-consolidation` handling, Major/consolidation conflict protection and common-frontier topology requirement
- Updated: `src/tooling/portable/handoff/coldStartQualification.materials.js` — carries the exact selected route pointer path into grounded Handoff evidence
- Updated: `src/tooling/portable/handoff/coldStartQualification.grounding.js` — qualifies bounded selected-Handoff recipient holder assignment through canonical `handoff` authorization while preserving explicit mismatch hard-failure and anti-transport inference
- Updated: `src/tooling/portable/grounding/grounding.readiness.authority.js` — projects selected-Handoff holder provenance separately from explicit-session provenance
- Updated: `src/tooling/portable/grounding/grounding.readiness.js` — readiness/next-action text now recognizes either qualified selected-Handoff assignment or explicit authorized holder binding
- Updated: `src/tooling/portable/grounding/grounding.participantAuthority.js` — participant authority boundary now describes qualified explicit or selected-Handoff holder binding without promoting chat identity
- Updated: `src/tooling/portable/adapters/cli/cli.help.js` — documents automatic authorized Handoff assignment and explicit common-frontier consolidation while retaining fail-closed boundaries
- Updated: `test/lineage-safety-hardening.test.mjs` — covers N+1 consolidation, later-batch prefix preservation, explicit Major separation and fail-closed consolidation topology/override behavior
- Updated: `test/blank-workspace-role-cache-grounding.test.mjs` — proves fresh selected-Handoff grounding without `--holder-role`, explicit Role mismatch blocking, and no auto-binding when the exact recipient Role lacks `handoff`
- Updated: `test/bounded-handoff-carrier.test.mjs` — exercises normal bounded carrier grounding through selected-Handoff assignment
- Updated: `test/thin-lineage-grounding-projection.test.mjs` — preserves unresolved-holder behavior when no qualified binding source exists and keeps assignment authorization separate from binding evidence

## Adversarial Regression Boundary

- One Route: a single qualified Pointer derives route ordinal `1`
- Three Routes: canonical Pointer order derives dense ordinals `1`, `2`, `3` independent of input array order
- Retry Before Success: ordinary route allocation does not consume the legacy local sibling reservation ledger
- Out-Of-Order Returns: arrival order does not change route-derived ordinal identity
- Consolidation: three-route common frontier derives sibling `4`, producing `002-1-4` from `002-1`
- Second Batch: a later route 2 return from that consolidation frontier produces `002-1-4-2`
- Explicit Major: an explicit Major from the consolidation carrier produces a separate Major checkpoint and preserves the consolidation carrier as its parent dimension
- Filename Collision: identical-byte exact output remains idempotent and divergent bytes at the same exact output path fail closed
- Artifact-Lineage Independence: route/consolidation dimensions are transport-only and do not rewrite semantic Parent lineage
- Holder Positive: manufactured fresh recipient carrier grounds through exact selected Handoff + exact Role `handoff` authorization with no explicit holder input
- Holder Negative — Explicit Mismatch: explicit Anchor assertion against a selected Loom recipient blocks with `portable.cold-start.holder-binding.role-mismatch`
- Holder Negative — Missing Mode: exact selected Loom Handoff plus qualified Loom Role permitting only `explicit-session` leaves holder binding unresolved and does not infer from transport
- Focused Qualification: `node --test test/lineage-safety-hardening.test.mjs test/blank-workspace-role-cache-grounding.test.mjs test/bounded-handoff-carrier.test.mjs` passed 20/20 with 0 failures
- Holder/Readiness Qualification: `node --test test/thin-lineage-grounding-projection.test.mjs` passed 30/30 with 0 failures
- Full Core Regression: `npm test` passed 163/163 with 0 failures, 0 skipped and 0 cancelled
- Portable Smoke: `npm run test:portable` passed with `portable node surface imports`
- Embedded Bootstrap Qualification: `npm run test:bootstrap` returned `embedded-qualified`, manifest SHA-256 `ed8222845005fab1aa05491aebf4314487729cb8d24b7b32168fd25bc3e59bbb`, representation SHA-256 `2226f8d00ec7882746d03e93ef7e29eb75f78c25207fa710da3434606f86de71`, 509 runtime files and 5,671,114 runtime bytes

## Received Carrier Runtime Boundary

- Declared Bootstrap Runtime: the received `003` carrier's own qualified bootstrap runtime successfully oriented, grounded and materialized this turn and remains the authority for that received carrier
- Source-Runtime Re-ground Observation: after implementation, the materialized source-tree CLI rejects that already-received carrier before holder projection because the source contract expects three newer package-v1 transport projection fields (`Generic Transport Rule`, `Route Transport Rule`, `Recipient Projection Rule`) that are absent from the older received carrier surface
- Disposition: no received carrier byte was rewritten and no compatibility inference was used to bypass that contract mismatch; fresh no-manual-holder qualification is therefore established by newly manufactured-carrier regressions under the current source contract, while return manufacture remains bound to the received carrier's declared bootstrap/continuation runtime
- Blocker State: no blocker to the delegated Core implementation or qualified return; the version boundary is recorded so Anchor does not misread a source-runtime re-ground failure as a holder-projection regression

## Preservation And Fidelity

- Preservation State: parent cache/participant grounding mechanics, endpoint authority, route selection, explicit holder mode isolation, output collision protection and embedded bootstrap qualification remain green
- Known Losses: none in the delegated source surface; ordinary retry-reservation state is intentionally no longer visible carrier identity when qualified route topology exists
- Prefix Fidelity: each return keeps the exact sent carrier dimension as prefix and appends only its deterministic route ordinal unless an explicit Major checkpoint creates a new prefix
- Consolidation Fidelity: N+1 is derived only from the common pre-batch route topology and never from a specialist branch arrival
- Holder Fidelity: exact selected Handoff assignment is a bounded session binding source only when independently authorized by the exact recipient Role; it remains distinct from route delivery/orientation and from explicit-session input
- Semantic Fidelity: carrier navigation, cache availability and holder binding do not create participant/delegate/process/source/acceptance semantics
- Fidelity Notes: deterministic transport ordinals stay local to one exact qualified parent carrier; holder assignment stays local to one exact selected Handoff plus exact Role authorization and remains non-transport-inferred

## Interpretation Limits

- Not Yet Used As: Anchor reconciliation, Business/Docs acceptance, publication, release, deployment or fresh external-role acceptance
- Does Not Prove: Anchor reconciliation, Business/Docs acceptance, publication, release, deployment, durable identity, semantic participation, downstream specialist execution or completion
- Must Not Be Used To Claim: retry count, filenames, artifact lineage, chat/provider identity, cache inventory or unselected sibling Handoffs can choose carrier ordinals or bind a Role
- Must Not Be Treated As: permission to rewrite the received carrier, weaken current package-v1 contract qualification, introduce a global cross-prefix allocator, infer a Major bump or copy carrier lineage into artifact Parent lineage
- Authority Limit: bounded Core implementation and local qualification under Tasks `026-1-1`, `026-1` and retained holder-projection dependency `026`

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [026-1-1-carrier-sibling-ordinal-and-prefix-preservation-mechanics.trace.md](../026-1-1-carrier-sibling-ordinal-and-prefix-preservation-mechanics.trace.md)
  - Value: UEn1EdhKu6_zDQI6_lta2d_35rdQgog4SYfuVCQ6iCc

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: hB6qN_Z4N_NW7bcbut9GgEif6l9G2GcCGihGxjHvclI