# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: tiinex.evidence.v1
  - Created At: 2026-09-20 18:22:06
  - Trace: [003-multi-handoff-carrier-continuation-projection-qualification.trace.md](../evidence/003-multi-handoff-carrier-continuation-projection-qualification.trace.md)
  - Origin:
    - [relative](../evidence/003-multi-handoff-carrier-continuation-projection-qualification.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-20 18:22:40
  - Authors: Loom
  - Why: Return the bounded Core implementation to Anchor for reconciliation and downstream Kodax adoption without widening semantic authority.
  - Summary: Loom return of the qualified shared Core carrier-continuation projection, failure classification, and host-consumption contract.
  - Status: ready/local

---

# Multi-Handoff Carrier Allocation Projection → Anchor

## Handoff Parties

- Purpose: return the bounded qualified Core implementation that projects ordinary outgoing carrier continuation/allocation from qualified parent route topology so hosts can stop matching outgoing Handoff semantic Parent paths to carrier routes.
- From: Loom
- From Kind: role
- From Reference: [Loom Canonical Holder Cutover Role](business::.topics/roles/001-3-1-loom-canonical-holder-cutover-role.trace.md)
- To: Anchor
- To Kind: role
- To Reference: [Anchor Canonical Holder Cutover Role](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)

## Transfers

- shared-carrier-continuation-projection-complete
  - Transfer Kind: work-and-responsibility
  - Description: Core now exports singular `projectHandoffCarrierContinuation`, accepting qualified parent orientation/inspection plus an explicit selected parent route Pointer or id and optional multiple outgoing route inputs. It reports `qualified`, `selection-required`, `invalid-parent-route`, `unresolved`, or `explicit-major` as applicable, with ordinary child dimension derived solely from qualified carrier route topology.
  - Controlling Artifact: [Multi-Handoff Carrier Allocation And Route Continuation Projection](../001-2-multi-handoff-carrier-allocation-and-route-continuation-projecti.trace.md)
  - Boundary: mechanical carrier topology/allocation only; no semantic Parent, participant, holder, recipient, current-work, filename, adjacency, or sibling semantic authority is created.

- allocation-engine-convergence
  - Transfer Kind: work
  - Description: the pure browser-safe projection owns `deriveHandoffSiblingAllocation` and `deriveHandoffConsolidationAllocation`; the existing Node/CLI sibling-allocation adapter imports and re-exports those same functions while retaining reservation-side Node behavior. Manufacture and host-facing projection therefore share one allocation engine instead of duplicating carrier math.
  - Controlling Artifact: [Multi-Handoff Carrier Allocation And Route Continuation Projection](../001-2-multi-handoff-carrier-allocation-and-route-continuation-projecti.trace.md)
  - Boundary: existing allocation rules are preserved: one selected Pointer derives `-1`; parallel qualified Pointers derive dense local ordinals in Pointer order; consolidation remains explicit; different carrier prefixes remain independent.

- sigma-failure-classification
  - Transfer Kind: work
  - Description: the exact two-Handoff Core shape is reproduced by regression: a qualified incoming parent with two Handoff routes, selected route B, and two outgoing Handoffs remains mechanically qualified even when the outgoing Handoffs carry semantic Parent paths that do not match the incoming carrier routes. The observed VS Code blocker is therefore host-preflight drift plus a missing host-facing projection surface; Core manufacture already contained the underlying allocation truth, so no second allocation engine was needed.
  - Controlling Artifact: [Multi-Handoff Carrier Continuation Projection Qualification](../evidence/003-multi-handoff-carrier-continuation-projection-qualification.trace.md)
  - Boundary: this classification does not validate any outgoing semantic Parent path and does not mutate VS Code source.

- host-consumption-contract
  - Transfer Kind: work-and-responsibility
  - Description: hosts should submit exact qualified parent topology and explicit route selection to `projectHandoffCarrierContinuation` instead of deriving carrier dimensions from outgoing draft Parent paths. Multiple outgoing route inputs may be supplied for context without becoming route-selection authority. Selection is exact qualified parent-route membership only; ambiguous duplicate ids require selection, and non-parent selectors fail as `invalid-parent-route`.
  - Controlling Artifact: [Multi-Handoff Carrier Allocation And Route Continuation Projection](../001-2-multi-handoff-carrier-allocation-and-route-continuation-projecti.trace.md)
  - Boundary: host UX and choice presentation remain host responsibilities; the projection does not choose a route when exact selection is unresolved.

- qualification-complete
  - Transfer Kind: work
  - Description: focused carrier-continuation regressions pass 8/8; all 27 standard Core test files were exercised in bounded batches with zero failures, including the heavy blank-workspace suite in name-filtered slices and package-surface under the real npm CLI binding. `npm run test:portable` passes; `npm run test:bootstrap` is `embedded-qualified` with 515 runtime files / 5,805,732 bytes; `npm pack --dry-run` succeeds for `@tiinex/core@0.1.1` with 550 files.
  - Controlling Artifact: [Multi-Handoff Carrier Continuation Projection Qualification](../evidence/003-multi-handoff-carrier-continuation-projection-qualification.trace.md)
  - Boundary: local Core qualification does not itself authorize Anchor integration, Kodax host adoption, Sigma human acceptance, or publication.

## Required Context

- core-workspace
  - Material: complete changed Core source containing the carrier-continuation projection, shared allocation-engine refactor, public/package exports, and focused regressions.
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: exact implementation Workspace for Anchor reconciliation and later Kodax consumption after acceptance.
  - Availability: available

## Reference Context

- controlling-task
  - Material: [Multi-Handoff Carrier Allocation And Route Continuation Projection](../001-2-multi-handoff-carrier-allocation-and-route-continuation-projecti.trace.md)
  - Purpose: exact Done Criteria, scope, exclusions, and acceptance boundary.
  - Availability: available

- inbound-anchor-handoff
  - Material: [Multi-Handoff Carrier Allocation Projection → Loom](007-multi-handoff-carrier-allocation-projection-loom.trace.md)
  - Purpose: delegated work, live failure shape, retained host responsibilities, and return expectation.
  - Availability: available

- qualification-evidence
  - Material: [Multi-Handoff Carrier Continuation Projection Qualification](../evidence/003-multi-handoff-carrier-continuation-projection-qualification.trace.md)
  - Purpose: exact source hashes, failure classification, regression result, and portable/bootstrap/package qualification.
  - Availability: available

## Retained Responsibilities

- integration-and-acceptance
  - Retained By: Anchor
  - Retained By Reference: [Anchor Canonical Holder Cutover Role](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)
  - Responsibility: reconcile this exact returned Core source against the delegated base and current Anchor frontier, independently qualify the result, and decide whether it becomes current.
  - Boundary: Loom's local qualification and return carrier do not auto-accept integration.

- vscode-host-adoption
  - Retained By: Kodax
  - Retained By Reference: [Kodax Canonical Holder Cutover Role](business::.topics/roles/001-6-1-kodax-canonical-holder-cutover-role.trace.md)
  - Responsibility: consume the accepted Core projection in VS Code, remove host-owned carrier-lineage/path-matching inference, and restore the bounded participant/progress operator flow without making host presentation authoritative.
  - Boundary: Loom changed no VS Code source.

- human-live-gate
  - Retained By: Sigma
  - Retained By Reference: [Sigma Canonical Holder Cutover Role](business::.topics/roles/001-4-1-sigma-canonical-holder-cutover-role.trace.md)
  - Responsibility: replay the real two-Handoff Pack flow after integrated Core/host adoption and decide the human acceptance gate.
  - Boundary: machine qualification is not human acceptance.

## Exclusions And Dependencies

- vscode-source
  - Kind: excluded-scope
  - Description: no Extension VS Code source or UI was modified.
  - Responsible Party Or Role: Kodax

- semantic-redesign
  - Kind: excluded-scope
  - Description: no Handoff, Participant, Session, Meeting, artifact Parent, recipient, holder, current-work, or filename semantics were added or widened.
  - Responsible Party Or Role: Axiom/Docs if a separately demonstrated semantic gap requires it

- route-guessing
  - Kind: excluded-scope
  - Description: the projection does not guess route selection from outgoing Handoff semantic Parent paths, filenames, path adjacency, participant state, or duplicate ids.
  - Responsible Party Or Role: caller/host must provide exact qualified selection when required

- release-and-remote-mutation
  - Kind: excluded-scope
  - Description: no npm/GitHub publication, remote mutation, Reduction cleanup, or unrelated Tooling refactor occurred.
  - Responsible Party Or Role: Anchor / later bounded work

## Completion Expectation

- Signal Kind: return
- Signal Meaning: reconcile this exact Core return; if accepted, provide the singular carrier-continuation projection to Kodax so VS Code can remove host-owned carrier-dimension/path matching, then route the integrated candidate to Sigma for the live gate.
- Return To: Anchor
- Return To Reference: [Anchor Canonical Holder Cutover Role](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)

## Interpretation Limits

- Does Not Mean: carrier route topology validates outgoing semantic Parent lineage, Core chooses operator UX, multiple outgoing Handoffs select an incoming route, successful manufacture closes the Major, or a local green suite establishes host/live acceptance.
- Must Not Be Used To Claim: filename/path matching is authority, participant/holder/recipient/current-work state controls carrier allocation, carrier dimensions change artifact Parent semantics, Loom modified VS Code, or this return authorizes publication.
- Authority Limits: bounded Core mechanical carrier-continuation/allocation implementation and qualification under the controlling Task only.
- Transport Limits: the return carrier transports qualified local implementation/evidence; Anchor retains integration authority and downstream lanes retain host/human acceptance.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [003-multi-handoff-carrier-continuation-projection-qualification.trace.md](../evidence/003-multi-handoff-carrier-continuation-projection-qualification.trace.md)
  - Value: NWwrVmmAoOOF2ex1ji0gdISj9BsblnPoR8cOtPgAC84

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: lZtWpOi7dfSkGclIQv7YNUSWupD-EKgOlPLIZXqdrBM