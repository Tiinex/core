# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-17 11:57:14
  - Trace: [026-1-1-carrier-sibling-ordinal-and-prefix-preservation-mechanics.trace.md](../026-1-1-carrier-sibling-ordinal-and-prefix-preservation-mechanics.trace.md)
  - Origin:
    - [relative](../026-1-1-carrier-sibling-ordinal-and-prefix-preservation-mechanics.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-17 12:19:26
  - Authors: Loom
  - Why: The delegated Core carrier correction and retained no-manual-holder grounding requirement are implemented and qualified for Anchor reconciliation.
  - Summary: Return qualified carrier route/consolidation ordinals, prefix preservation and selected-Handoff recipient holder projection to Anchor.
  - Status: ready/local

---

# Loom To Anchor — Carrier Sibling Ordinal And Prefix Preservation Return

## Handoff Parties

- Purpose: return the qualified Core implementation that derives visible carrier siblings from exact route topology, adds common-frontier N+1 consolidation, preserves sent prefixes, and completes the retained exact selected-Handoff recipient holder projection without manual `--holder-role`.
- From: Loom
- From Kind: role
- From Reference: [Loom Role — Canonical Holder Cutover Continuation](business::.topics/roles/001-3-1-loom-canonical-holder-cutover-role.trace.md)
- To: Anchor
- To Kind: role
- To Reference: [Anchor Role — Canonical Holder Cutover Continuation](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)

## Transfers

- carrier-sibling-ordinal-prefix-preservation-result
  - Transfer Kind: work-and-responsibility
  - Description: Core ordinary return allocation remains route-topology-derived, now includes qualified common-frontier consolidation ordinal `N+1`, preserves the exact sent carrier prefix across returns/later batches, isolates legacy retry reservation from visible identity, and keeps explicit Major/collision/artifact-lineage boundaries intact.
  - Controlling Artifact: [Carrier Sibling Ordinal, Prefix Preservation, And Recipient Holder Qualification](../evidence/020-carrier-sibling-ordinal-prefix-preservation-and-recipient-holder.trace.md)
  - Boundary: carrier lineage is transport/navigation only and does not become artifact Parent or semantic authority.

- selected-handoff-recipient-holder-projection-result
  - Transfer Kind: work-and-responsibility
  - Description: normal grounding can now establish a bounded non-explicit holder binding from exact qualified selected-Handoff consumption only when the exact recipient Role authorizes canonical Assignment Mode `handoff`; explicit Role mismatch remains blocking and Roles lacking `handoff` remain unresolved.
  - Controlling Artifact: [Carrier Sibling Ordinal, Prefix Preservation, And Recipient Holder Qualification](../evidence/020-carrier-sibling-ordinal-prefix-preservation-and-recipient-holder.trace.md)
  - Boundary: the binding is not inferred from transport/orientation/chat identity and establishes no durable identity, participant, delegation, process, source, acceptance or completion semantics.

## Required Context

- core-workspace
  - Material: current Core Workspace containing the qualified implementation, tests, Evidence 020 and this return Handoff.
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: exact integration source for Anchor reconciliation and follow-on validation.
  - Availability: available

- carrier-correction-task
  - Material: exact controlling carrier sibling ordinal and prefix preservation Task.
  - Material Reference: [Carrier Sibling Ordinal And Prefix Preservation Mechanics](../026-1-1-carrier-sibling-ordinal-and-prefix-preservation-mechanics.trace.md)
  - Purpose: controls route ordinal, consolidation, prefix, retry, Major, collision and artifact-lineage done criteria.
  - Availability: available

- parent-cache-grounding-task
  - Material: parent recipient carrier cache and grounding mechanics Task retained by this tranche.
  - Material Reference: [Recipient Carrier Cache And Grounding Mechanics](../026-1-recipient-carrier-cache-and-grounding-mechanics.trace.md)
  - Purpose: preserves the accepted cache/participant mechanics and no-manual-holder grounding requirement.
  - Availability: available

- qualification-evidence
  - Material: Loom's exact implementation and regression qualification Evidence.
  - Material Reference: [Carrier Sibling Ordinal, Prefix Preservation, And Recipient Holder Qualification](../evidence/020-carrier-sibling-ordinal-prefix-preservation-and-recipient-holder.trace.md)
  - Purpose: implementation delta, positive/negative regressions, validation results, runtime-boundary note and interpretation limits.
  - Availability: available

## Reference Context

- holder-projection-dependency
  - Material: earlier Core Task defining exact selected-Handoff recipient holder projection semantics and negatives.
  - Material Reference: [Qualified Handoff Recipient Holder Projection Mechanics](../026-qualified-handoff-recipient-holder-projection-mechanics.trace.md)
  - Purpose: retained bounded holder-assignment contract completed by this implementation.
  - Availability: available

- received-runtime-boundary
  - Material: Evidence 020 section recording that the received `003` carrier is consumed by its declared bootstrap runtime while the materialized source runtime now expects three newer package-v1 transport projection fields absent from that older carrier surface.
  - Material Reference: [Carrier Sibling Ordinal, Prefix Preservation, And Recipient Holder Qualification](../evidence/020-carrier-sibling-ordinal-prefix-preservation-and-recipient-holder.trace.md)
  - Purpose: prevent Anchor from interpreting source-runtime re-ground incompatibility as a holder-projection regression or rewriting the received carrier to fit a newer contract.
  - Availability: available

## Retained Responsibilities

- integration-and-reconciliation
  - Retained By: Anchor
  - Responsibility: reconcile the returned Core Workspace, inspect/disposition Evidence 020, and decide the next accepted checkpoint.
  - Boundary: Loom returns qualified implementation and evidence but does not declare Anchor acceptance.

- fresh-recipient-validation
  - Retained By: Anchor
  - Responsibility: run any desired fresh external-role black-box acceptance after integration, including return/consolidation sequences under the integrated runtime.
  - Boundary: Loom's manufactured-carrier regressions qualify Core mechanics; they do not substitute for Anchor's optional broader acceptance workflow.

- semantic-ownership
  - Retained By: Anchor / Axiom / semantic owners as applicable
  - Responsibility: retain ownership of Handoff, Role, participant, process, source, acceptance and artifact-lineage semantics beyond the delegated Core mechanics.
  - Boundary: carrier topology and cache/holder projections remain non-authoritative for those semantics.

## Exclusions And Dependencies

- no-retry-visible-lineage
  - Kind: excluded-scope
  - Description: manufacture retries or local `.tiinex-handoff-sibling-allocations` attempts must not consume visible ordinary carrier sibling ordinals when qualified route topology exists.
  - Responsible Party Or Role: Core Tooling.

- no-cross-prefix-global-allocation
  - Kind: excluded-scope
  - Description: carrier prefixes remain independent; no global sibling allocator or reverse discovery across carriers is introduced.
  - Responsible Party Or Role: Core Tooling.

- no-artifact-lineage-mirroring
  - Kind: excluded-scope
  - Description: carrier route/consolidation dimensions are not copied into durable artifact Parent lineage unless independently true under artifact authority.
  - Responsible Party Or Role: Core Tooling / semantic owners.

- no-automatic-major
  - Kind: excluded-scope
  - Description: route count, retries, collisions and chain length do not infer a Major checkpoint; Major remains explicit.
  - Responsible Party Or Role: authorized checkpoint owner.

- no-transport-holder-inference
  - Kind: excluded-scope
  - Description: package placement, orientation, chat/provider/model identity, unselected siblings and Role cache inventory cannot bind the recipient holder.
  - Responsible Party Or Role: Core Tooling.

- received-carrier-version-boundary
  - Kind: unresolved-dependency
  - Description: the already-received `003` carrier's declared bootstrap runtime accepts and materializes that carrier, while the materialized source runtime enforces three newer package-v1 transport projection fields absent from the received surface; no received byte was rewritten and return manufacture remains bound to the qualified continuation/bootstrap runtime.
  - Responsible Party Or Role: Anchor to disposition only if cross-version source-runtime replay of the old carrier becomes a separate requirement.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Anchor receives one qualified carrier containing the Core route/consolidation ordinal correction, exact prefix-preservation mechanics, completed selected-Handoff holder-binding projection, Evidence 020, 163/163 full Core regression pass, portable smoke pass and embedded-bootstrap qualification.
- Return To: Anchor

## Interpretation Limits

- Does Not Mean: Anchor has accepted/integrated the return, fresh external-role acceptance has completed, Business/Docs were mutated, or carrier topology/cache/holder projection creates participant/delegation/process/source/artifact-lineage authority.
- Must Not Be Used To Claim: retries, filenames, local allocation state, artifact numbering, chat/provider identity, cache inventory or sibling Handoffs can choose a route ordinal, consolidation parent, Major checkpoint or holder binding.
- Authority Limits: bounded Core implementation and qualification under Tasks `026-1-1`, `026-1` and retained holder-projection dependency `026`; Anchor retains reconciliation and any broader acceptance decision.
- Must Not Be Treated As: permission to rewrite the received carrier for source-runtime compatibility, introduce a global allocator, infer semantic lineage from carrier dimensions, or bypass exact selected-route/Role qualification.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [026-1-1-carrier-sibling-ordinal-and-prefix-preservation-mechanics.trace.md](../026-1-1-carrier-sibling-ordinal-and-prefix-preservation-mechanics.trace.md)
  - Value: UEn1EdhKu6_zDQI6_lta2d_35rdQgog4SYfuVCQ6iCc

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: OTwJGyT_lBdJ6fF2HAw2yyAiKl4cEqNjA0cfqKIj9WE