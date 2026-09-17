# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-16 20:10:03
  - Trace: [026-qualified-handoff-recipient-holder-projection-mechanics.trace.md](../026-qualified-handoff-recipient-holder-projection-mechanics.trace.md)
  - Origin:
    - [relative](../026-qualified-handoff-recipient-holder-projection-mechanics.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-16 20:12:00
  - Authors: Anchor
  - Why: Fresh Master and fresh Loom both required a self-supplied explicit-session bridge even though their exact recipient Roles authorize canonical handoff assignment.
  - Summary: Delegate the final fresh-cold-start holder-binding correction using existing canonical handoff assignment semantics.
  - Status: ready/local

---

# Anchor To Loom — Qualified Handoff Recipient Holder Projection Mechanics

## Handoff Parties

- Purpose: remove the remaining fresh-cold-start holder-binding friction by implementing the already-authorized canonical `handoff` assignment mode from exact selected qualified Handoff consumption, without a chat acknowledgement or self-supplied explicit-session bridge.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Role](business::.topics/roles/001-3-1-loom-canonical-holder-cutover-role.trace.md)

## Transfers

- qualified-handoff-holder-projection
  - Transfer Kind: work-and-responsibility
  - Description: implement and qualify the bounded Core projection defined by Task 026 so an exact selected qualified Handoff can establish the current bounded recipient Role through canonical `handoff` assignment authority when its exact Role authorizes that mode.
  - Controlling Artifact: [Qualified Handoff Recipient Holder Projection Mechanics](../026-qualified-handoff-recipient-holder-projection-mechanics.trace.md)
  - Boundary: preserve the semantic difference between route/Handoff qualification, Role assignment-mode authorization, bounded holder result, durable identity, semantic participation, delegation/process/source authority and completion/acceptance.

## Required Context

- core-workspace
  - Material: current Core Workspace including the qualified downstream-delegate correction returned by the previous fresh Loom run.
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: writable implementation and regression basis.
  - Availability: available

- business-holder-correction
  - Material: controlling Business Task for the qualified Handoff recipient holder projection correction.
  - Material Reference: [Qualified Handoff Recipient Holder Projection Correction](business::.topics/initiatives/001-2-7-5-1-5-1-1-qualified-handoff-recipient-holder-projection-correction.trace.md)
  - Purpose: exact organizational scope, desired human-first acceptance boundary and retained Anchor responsibilities.
  - Availability: available

- holder-assignment-semantics
  - Material: accepted Axiom canonical holder assignment-mode semantics defining `handoff` as bounded assignment through exact qualified Handoff-bounded assignment authority and forbidding endpoint/package-recipient inference by itself.
  - Material Reference: [Canonical Holder Assignment Mode Semantic Disposition](docs::.topics/grounding/013-canonical-holder-assignment-mode-semantic-disposition.trace.md)
  - Purpose: semantic authority; Core must implement this existing boundary rather than invent a new holder mechanism.
  - Availability: available

- current-role-schema
  - Material: current canonical Role schema with direct Assignment Modes and explicit Handoff-isolation rule.
  - Material Reference: [Current Party Role Schema](docs::.topics/.schemas/party/role/tiinex.party.role.v1.schema.md)
  - Purpose: exact current Role assignment-mode contract.
  - Availability: available

- latest-delegate-qualification
  - Material: latest fresh Loom qualification proving current recipient/holder and downstream delegate are now independently projected.
  - Material Reference: [Downstream Delegate Selection Projection Qualification](../evidence/019-downstream-delegate-selection-projection-qualification.trace.md)
  - Purpose: preserve the latest accepted Core baseline and prevent regression of the Axiom downstream-delegate fix.
  - Availability: available

## Reference Context

- fresh-cold-start-observation
  - Material: two independent fresh-role runs—Master Anchor and Loom—both recovered the correct frontier but normal unbound grounding remained discussion-only until the model self-supplied explicit-session holder binding.
  - Material Reference: [Downstream Delegate Selection Projection Correction](business::.topics/initiatives/001-2-7-5-1-5-1-downstream-delegate-selection-projection-correction.trace.md)
  - Purpose: real black-box reproduction basis; not additional semantic authority.
  - Availability: available

## Retained Responsibilities

- integration-and-black-box-acceptance
  - Retained By: Anchor
  - Responsibility: reconcile Loom's return, take Full Recovery and run the subsequent fresh Master/fresh acceptance Anchor/fresh specialist black-box sequence without hidden holder acknowledgements.
  - Boundary: Loom qualifies Core mechanics only and does not declare behavioral acceptance.

- semantic-ownership
  - Retained By: Axiom
  - Responsibility: retain ownership of the canonical holder assignment-mode semantics already expressed in Decision 013 and the current Role schema.
  - Boundary: if Loom finds that selected-route Handoff consumption cannot satisfy the existing exact Handoff-bounded assignment semantics without a new semantic claim, it must return that blocker rather than invent semantics locally.

- human-transport
  - Retained By: Sigma
  - Responsibility: transport qualified packages between isolated sessions without supplying a magic holder acknowledgement line.
  - Boundary: package transport does not itself create holder assignment; the selected qualified Handoff consumption path must own the bounded assignment evidence under canonical `handoff` mode.

## Exclusions And Dependencies

- no-endpoint-or-package-inference
  - Kind: excluded-scope
  - Description: a Role `To` endpoint, package delivery, cache presence, filename, provider/model/chat identity or transport recipient alone must not bind the holder.
  - Responsible Party Or Role: Loom

- no-new-holder-semantics
  - Kind: excluded-scope
  - Description: do not create a new holder schema family, durable identity system, Role-name whitelist, prose parser or legacy compatibility mapping.
  - Responsible Party Or Role: Loom

- semantic-insufficiency-fail-closed
  - Kind: excluded-scope
  - Description: do not invent or broaden holder semantics if the existing Axiom/Role/Handoff contract cannot support exact selected-Handoff consumption as the required bounded assignment evidence; in that case return the exact semantic blocker to Anchor.
  - Responsible Party Or Role: Loom / Anchor

## Completion Expectation

- Signal Kind: return
- Signal Meaning: return qualified Core evidence and one Loom-to-Anchor Handoff proving that fresh selected Handoff grounding can become holder-act-ready through canonical `handoff` assignment with no `--holder-role`, while all negative/isolation cases remain fail closed.
- Return To: Anchor

## Interpretation Limits

- Does Not Mean: package delivery or Handoff endpoint presence alone assigns a holder; durable holder identity is established; semantic participation is created; downstream delegation/process/source authority is implied; or fresh behavioral acceptance has already passed.
- Must Not Be Used To Claim: a Role without canonical `handoff` mode can be assigned through Handoff, that arbitrary sessions may assume Roles from files they discover, or that explicit-session semantics may be silently widened.
- Authority Limits: bounded Core implementation under Task 026 and the existing canonical Axiom/Role/Handoff semantics.
- Must Not Be Treated As: permission to mutate Business/Docs, bypass Role assignment modes, reintroduce legacy authorization, or solve the later Axiom delegation acceptance itself.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [026-qualified-handoff-recipient-holder-projection-mechanics.trace.md](../026-qualified-handoff-recipient-holder-projection-mechanics.trace.md)
  - Value: 4Nnw4pc2qgr2vlt6JQ5PKlpdptJHXVzgh3IUjbyHGUA

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 1mEldjVe_EaIy7jddN8zB6spPQYWhV9LOFtuoib3G2o