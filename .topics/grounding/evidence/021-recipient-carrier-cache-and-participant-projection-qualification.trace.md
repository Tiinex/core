# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-17 11:35:17
  - Trace: [026-1-recipient-carrier-cache-and-grounding-mechanics.trace.md](../026-1-recipient-carrier-cache-and-grounding-mechanics.trace.md)
  - Origin:
    - [relative](../026-1-recipient-carrier-cache-and-grounding-mechanics.trace.md)
- Current
  - Current Schema: tiinex.evidence.v1
  - Created At: 2026-09-17 14:46:21
  - Authors: Loom
  - Why: Record exact Loom qualification evidence for the remaining Task 026-1 cache and participant projection criteria.
  - Summary: Qualify bounded cache selection, participant-first pointer topology, shared-route ancestor closure and fresh selected-Handoff grounding.
  - Status: ready/local

---

# Recipient Carrier Cache And Participant Projection Qualification

## Supported Claim Or Question

- Supported Claim Or Question: can the recipient-facing carrier project only route-necessary bounded external material, place qualified participant Role Pointers before deterministic From/To endpoint Role Pointers, keep every selected route independently ancestor-complete, share one Workspace-scoped cache across sibling routes, and ground fresh selected-Handoff recipients without manual holder input while refusing sibling/proximity authority
- Evidence Role: qualifies Loom's bounded Core implementation for the remaining done criteria of Task `026-1`

## Provenance

- Known Source: exact Core Workspace materialized from carrier dimension `003-2` by the received carrier's declared Tiinex bootstrap runtime, selected route `.topics/grounding/handoffs/041-anchor-to-loom-recipient-carrier-cache-participant-projection-completion.trace.md`, with selected-Handoff consumption binding the bounded session to Loom through the exact qualified Loom Role `handoff` Assignment Mode
- Controlling Task: `.topics/grounding/026-1-recipient-carrier-cache-and-grounding-mechanics.trace.md`
- Received Route: `.topics/grounding/handoffs/041-anchor-to-loom-recipient-carrier-cache-participant-projection-completion.trace.md`
- Accepted Prior Evidence: `.topics/grounding/evidence/020-carrier-sibling-ordinal-prefix-preservation-and-recipient-holder.trace.md`
- Preservation Basis: Core alone was mutated; the received carrier bytes and carried Business/Docs material remained read-only; no remote source, release, publication or deployment was mutated
- Provenance Limits: this Evidence qualifies only the bounded Core cache, route-closure, Role-pointer, holder-projection and regression mechanics under Task `026-1`; it does not create participant, delegation, process, source, acceptance, completion, or artifact-lineage authority

## Evidence Material

- Material: recipient-v2 cache selection/topology, shared-route required-context qualification, participant/endpoint Role-pointer projection, cold grounding and deterministic regressions
- Material Kind: host-neutral Core implementation and tests
- No-Cache Route: when the selected route closure is wholly satisfied by one qualified complete Workspace representation, no Cache artifact is emitted
- Bounded Cache: detached external material is included only when it is required by the selected route closure or bounded Workspace recovery; cache carriage remains availability-only
- Shared Cache: sibling Handoff routes owned by the same Workspace share one Workspace-scoped cache while each route retains its own Handoff Pointer branch
- Participant-First Topology: route lineage is `Workspace -> [Cache] -> [qualified participant Role Pointer(s)] -> From Role Pointer -> To Role Pointer -> Handoff Pointer`
- Endpoint Ordering: endpoint Role Pointers are deterministic and preserve Handoff authority as navigation only: From precedes To in the ancestor chain and pointer placement never establishes endpoint semantics
- Participant Selection Boundary: participant pointers are emitted only from explicit route participant requirements; cache inventory, endpoint status, sibling routes and nearby Role/Process material cannot create semantic participation
- Participant/Endpoint Overlap: the same exact Role may be independently projected once as an explicit participant and once as a Handoff endpoint without either projection widening the other's authority
- Ancestor-Only Closure: every mandatory pre-Handoff projection is reachable through the selected Handoff Pointer's own Parent ancestors; removing a required participant ancestor invalidates the route even when sibling material remains present
- Shared-Route Requirement Binding: secondary-route Required Context may resolve a materialized descriptor entry only through exact target plus either exact requirement id or exact route-scoped `(source requirement id, route Workspace, route path)` binding; sibling or nearby matches are not eligible
- Ambiguity Boundary: multiple route-scoped Role materials matching one requirement fail closed rather than borrowing one by package order or proximity
- Holder Binding: fresh Loom and Anchor selected-Handoff grounding remains qualified without explicit `--holder-role` when the exact recipient Role authorizes canonical `handoff`; explicit mismatch and missing-mode negatives remain hard failures
- Availability Versus Applicability: carried Role/Process/context material remains qualified availability evidence only; process applicability and semantic participation require independent upstream authority

## Implementation Delta

- Updated: `src/tooling/portable/handoff/recipientV2.topology.js` — participant Role Pointer chain now precedes endpoint Role Pointer chain on each legacy/multi-route recipient branch
- Updated: `src/tooling/portable/handoff/recipientV2.packageV1.build.js` — package-v1 single-route construction uses the same participant-before-endpoint lineage order
- Updated: `src/tooling/portable/handoff/recipientV2.endpointRolePointers.js` — endpoint Role requirements are deterministically ordered From then To before pointer construction
- Updated: `src/tooling/portable/handoff/carrierProjection.routeQualification.js` — shared-route Required Context resolves scoped material by exact route-scoped source requirement identity instead of assuming the primary route's unscoped requirement id
- Updated: `src/tooling/portable/handoff/recipientV2.inspect.projection.js` — removed an invalid undeclared route-qualification reference from endpoint Role projection
- Updated: `test/blank-workspace-role-cache-grounding.test.mjs` — adds complete no-cache, multiple-participant, participant/endpoint-overlap, shared-cache sibling-route, ancestor-only negative and route-scoped ambiguity coverage; also proves Anchor selected-Handoff grounding without explicit holder input

## Adversarial Regression Boundary

- Complete No-Cache: one complete Core route with two explicit participants emits zero caches, two participant pointers, and deterministic From/To endpoint pointers
- Participant/Endpoint Overlap: Loom can be both explicitly selected participant and To endpoint without participant inference from endpoint status
- Shared Cache: two Core sibling routes with detached Business material share exactly one Core cache
- No-Participant Route: one sibling route intentionally declares no participant pointers while still carrying its exact endpoint and Required Context material
- Sibling Isolation: deleting route one's own participant ancestor invalidates that carrier; route two or cache inventory cannot repair it
- Route-Scoped Ambiguity: two exact materials for one scoped participant requirement return `ambiguous` and do not select by ordering
- Nearby Material: unselected cached Role/Process material remains availability-only and cannot become participant/process authority
- Holder Positive: fresh selected-Handoff Loom/Anchor grounding qualifies without explicit holder input through exact Role `handoff` authorization
- Holder Negative: explicit recipient mismatch blocks and missing canonical `handoff` mode does not auto-bind

## Qualification

- Focused Qualification: `node --test test/blank-workspace-role-cache-grounding.test.mjs` passed `6/6`
- Full Core Regression: `npm test` passed `166/166`
- Portable Smoke: `npm run test:portable` passed (`portable node surface imports`)
- Embedded Bootstrap: `npm run test:bootstrap` passed with status `embedded-qualified`, runtime files `509`, runtime bytes `5672244`, manifest SHA-256 `dd86bae1242bf6b95a5ec0684861b7ac12b7fddf68ae78f8bd1e58199a0f9f6c`, representation SHA-256 `3262ec1fb58b4ea28f2de2a925597e376bbd2bf5e2b8d3a44506b1933ecbfe63`
- End-To-End Manufacture Coverage: the no-cache and two-sibling shared-cache regression specimens both manufacture `ready` and pass physical recipient roundtrip verification under the current source runtime
- Received Carrier Grounding: the `003-2` carrier oriented and grounded to act through its declared bootstrap runtime before Workspace materialization; no native reading of its continuation pointer was used


## Preservation And Fidelity

- Preservation State: exact current Core Workspace source bytes were edited only in the declared implementation/test files and this Evidence is authored from the resulting qualified local state; received carrier and external Business/Docs context remain unchanged
- Fidelity Notes: qualification statements above are bounded to observed current-runtime test/manufacture/ground behavior and exact command results; transport/cache projections are described at their implemented authority strength only
- Known Losses: none known for the qualified Core implementation/test state represented here; this Evidence does not embed external Business/Docs source bytes beyond what the received carrier already qualified

## Interpretation Limits

- Does Not Prove: cache material is semantically current because it is carried; participant pointer placement creates participation; pointer ordering creates endpoint authority; a sibling route may satisfy another route's mandatory closure; carrier lineage is artifact lineage; or Anchor has accepted/integrated this return
- Not Yet Used As: Anchor acceptance, program-level completion, Major carrier completion, release/deployment approval, or remote integration evidence
- Must Not Be Treated As: authority for cached Roles/Processes/Decisions, filenames, package placement, transport topology, chat/provider identity or holder projection to establish semantic participant, delegate, process, source, mutation, acceptance or completion state

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [026-1-recipient-carrier-cache-and-grounding-mechanics.trace.md](../026-1-recipient-carrier-cache-and-grounding-mechanics.trace.md)
  - Value: qUmfFdL2S-deGs5deVJRIGQCLb8CpQ-1u8Xc85B7D_k

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: wokAby5H1ToFM-jMFo9SinzLE1WW9n_Kro-Jvsyxavo