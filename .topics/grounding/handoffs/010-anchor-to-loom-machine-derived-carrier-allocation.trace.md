# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-14 21:13:57
  - Trace: [006-machine-derived-carrier-allocation-task.trace.md](../006-machine-derived-carrier-allocation-task.trace.md)
  - Origin:
    - [relative](../006-machine-derived-carrier-allocation-task.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-14 21:15:25
  - Authors: Anchor
  - Why: Fresh Anchor validation showed recipient roles can self-reserve sibling indices when Tooling requires external coordination; transport should derive ordinary non-Major allocation machine-side from qualified pointer order.
  - Summary: Delegate the remaining carrier-allocation tooling defect: dense ordinary sibling/return dimensions must derive from qualified pointer topology rather than prose/manual coordination.
  - Status: ready/local

---

# Anchor To Loom — Machine-Derived Carrier Allocation

## Handoff Parties

- Purpose: replace ordinary manual sibling reservation with deterministic qualified carrier allocation derived from package-local Handoff Pointer topology within each carrier prefix.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Role](business::.topics/roles/001-3-loom-role.trace.md)

## Transfers

- machine-derived-carrier-allocation
  - Transfer Kind: work-and-responsibility
  - Description: implement and qualify Machine-Derived Carrier Allocation in shared Core Tooling.
  - Controlling Artifact: [Machine-Derived Carrier Allocation](../006-machine-derived-carrier-allocation-task.trace.md)
  - Boundary: transport allocation must come from qualified carrier/pointer topology, not semantic Handoff prose or cross-prefix global coordination.

## Required Context

- core-workspace
  - Material: current complete Core Workspace containing holder/source grounding, bounded Workspace readiness and current handoff manufacture mechanics.
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: primary writable implementation and regression source.
  - Availability: available

- business-workspace
  - Material: carried Business Workspace containing the controlling thin-lineage grounding Epic and Anchor/Loom Role authority.
  - Material Reference: [Business Workspace](business::.topics/.workspaces/tiinex-business.workspace.md)
  - Purpose: read-only organizational lineage and Role authority; no Business mutation is delegated.
  - Availability: available

## Reference Context

- current-holder-gate-return
  - Material: accepted holder-binding authorization implementation and return state.
  - Material Reference: [Holder Binding Authorization Gate Return](009-loom-to-anchor-holder-binding-authorization-gate-return.trace.md)
  - Purpose: exact current Core baseline; this task must not regress grounding semantics.
  - Availability: available

## Retained Responsibilities

- carrier-topology-disposition
  - Retained By: Anchor
  - Responsibility: accept/reject the transport behavior against operator-visible dense carrier topology and integrate the return into Full Recovery.
  - Boundary: Loom implements shared transport mechanics but does not redefine Business or artifact semantics.

- business-integration
  - Retained By: Anchor
  - Responsibility: keep the transport work traceable to the controlling Business Epic and update Business/recovery after the return.
  - Boundary: Loom does not mutate Business.

## Exclusions And Dependencies

- no-semantic-allocation-field
  - Kind: excluded-scope
  - Description: do not add sibling reservation/index as a required semantic Handoff/Task field merely to satisfy transport manufacture.
  - Responsible Party Or Role: Loom.

- no-cross-prefix-global-counter
  - Kind: excluded-scope
  - Description: do not derive one global sibling sequence across independent carrier prefixes/discriminators.
  - Responsible Party Or Role: Loom.

- preserve-major-separation
  - Kind: unresolved-dependency
  - Description: Carrier Major allocation remains a separate explicit topology operation and must not be inferred from ordinary sibling/return progression.
  - Responsible Party Or Role: Loom / Anchor.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: return qualified Core implementation, regression Evidence and Loom-to-Anchor Handoff after ordinary non-Major carrier allocation is machine-derived from qualified pointer topology and no semantic markdown reservation is required.
- Return To: Anchor

## Interpretation Limits

- Does Not Mean: Tooling may redefine artifact lineage, Business lineage, Role authority, holder identity, process applicability or implementation-source authority.
- Must Not Be Used To Claim: global allocation across prefixes, automatic Carrier Major creation, or authority from numeric pathing alone.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [006-machine-derived-carrier-allocation-task.trace.md](../006-machine-derived-carrier-allocation-task.trace.md)
  - Value: OYgOPGisK-cO4LG8jL5myBD9og6_7CLT5Lw2Jn8-QzY

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: _6ljq6Q1pKRqrQUTmI4XlR25qyh9v4Zpbxl5EUyb0LU