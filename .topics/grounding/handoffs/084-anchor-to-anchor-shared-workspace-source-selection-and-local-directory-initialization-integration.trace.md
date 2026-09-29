# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/668753e47a281db060cb74ef957683f4f773b3a4/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/668753e47a281db060cb74ef957683f4f773b3a4/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-09-29 17:32:48
  - Trace: [053-shared-workspace-source-selection-and-local-directory-initialization-qualification.trace.md](../evidence/053-shared-workspace-source-selection-and-local-directory-initialization-qualification.trace.md)
  - Origin:
    - [relative](../evidence/053-shared-workspace-source-selection-and-local-directory-initialization-qualification.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/668753e47a281db060cb74ef957683f4f773b3a4/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-29 17:34:33
  - Authors: Anchor
  - Why: Transfer one qualified multi-workspace integration without duplicating Workspace semantics in the host.
  - Summary: Integrate shared Core Workspace source selection plus the thin Extension: VSCode host adaptation.
  - Status: ready/local

---

# Anchor To Anchor — Shared Workspace Source Selection And Local Directory Initialization Integration

## Handoff Parties

- Purpose: transfer the qualified Core and Extension: VSCode integration that makes ordinary directories first-class Tiinex Workspaces and centralizes repository-local `.gitignore` snapshot semantics in shared Core.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role — Canonical Holder Cutover Continuation](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)
- To: Anchor
- To Kind: role
- To Reference: [Anchor Role — Canonical Holder Cutover Continuation](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)

## Transfers

- shared-workspace-source-selection-integration
  - Transfer Kind: work-and-responsibility
  - Description: integrate the exact carried Core and Extension: VSCode deltas for local-directory initialization, native Workspace schema use, shared Git/.gitignore source selection, and thin host delegation.
  - Controlling Artifact: [Shared Workspace Source Selection And Local Directory Initialization](../027-1-1-1-1-1-1-shared-workspace-source-selection-and-local-directory-initialization.trace.md)
  - Boundary: Core owns Workspace source semantics; VS Code owns only directory selection, invocation, and presentation.

## Required Context

- qualification-evidence
  - Material: implementation and integration qualification for Task `027-1-1-1-1-1-1`.
  - Material Reference: [Shared Workspace Source Selection And Local Directory Initialization Qualification](../evidence/053-shared-workspace-source-selection-and-local-directory-initialization-qualification.trace.md)
  - Purpose: establish cross-host source-selection equivalence and non-regression.
  - Availability: available

- current-core-workspace
  - Material: exact full Core Workspace carried by this Handoff Package.
  - Material Reference: [Core Workspace](../../.workspaces/tiinex-core.workspace.md)
  - Purpose: Core commit target.
  - Availability: available

- current-vscode-workspace
  - Material: exact full Extension: VSCode Workspace carried by this Handoff Package.
  - Material Reference: [Extension VSCode Workspace](vscode::.topics/.workspaces/tiinex-vscode.workspace.md)
  - Purpose: VS Code commit target after review.
  - Availability: available

- prior-bootstrap-composition-integration
  - Material: Handoff 083 baseline.
  - Material Reference: [Anchor To Anchor — Bootstrap Runtime Composition Identity And Comparison Integration](083-anchor-to-anchor-bootstrap-runtime-composition-identity-and-comparison-integration.trace.md)
  - Purpose: preserve all previously qualified Core/bootstrap behavior.
  - Availability: available

## Reference Context

- native-schema-source-pack
  - Material: Task `027-1-1` native Schema Pack and deterministic schema authority.
  - Material Reference: [Native Schema Source Pack And Deterministic Docs-To-Core Sync](../027-1-1-native-schema-source-pack-and-deterministic-docs-to-core-sync.trace.md)
  - Purpose: provide offline `tiinex.workspace.v1` material for initialization.
  - Availability: available

## Retained Responsibilities

- integration-review
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role — Canonical Holder Cutover Continuation](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)
  - Responsibility: review and integrate only the carried Core and Extension: VSCode Workspaces and fail closed on unexpected divergence.
  - Boundary: Business/Role context carried for transport continuity is not a commit target.

## Exclusions And Dependencies

- no-host-ignore-fork
  - Kind: excluded-scope
  - Description: VS Code must not grow a parallel `.gitignore` or canonical Workspace enumeration implementation.
  - Responsible Party Or Role: Anchor

- no-bounded-landing-redesign
  - Kind: excluded-scope
  - Description: partial/bounded Workspace merge/replace semantics remain a separate VS Code tooling concern.
  - Responsible Party Or Role: Anchor

- no-remote-mutation
  - Kind: excluded-scope
  - Description: no GitHub mutation, commit, push, publication, release, or deployment is authorized by this Handoff.
  - Responsible Party Or Role: Anchor

## Completion Expectation

- Signal Kind: result
- Signal Meaning: the exact carried Core and Extension: VSCode Workspaces are integrated successfully, or one exact blocker is returned naming divergent bytes or failing qualification.
- Return To: Anchor
- Return To Reference: [Anchor Role — Canonical Holder Cutover Continuation](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)

## Interpretation Limits

- Does Not Mean: a local-directory Workspace has remote repository authority, ignored files are universally disposable, or timestamp/path presence establishes source truth.
- Must Not Be Used To Claim: authority to mutate Business, weaken tracked-file preservation, add a second ignore parser, or replace bounded Workspaces as if they were complete.
- Authority Limits: exact carried Task `027-1-1-1-1-1-1` Core + Extension: VSCode integration only.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [053-shared-workspace-source-selection-and-local-directory-initialization-qualification.trace.md](../evidence/053-shared-workspace-source-selection-and-local-directory-initialization-qualification.trace.md)
  - Value: 9fj-Zyq8QCJa1A8Z_PHnFLQV-djuXAOlrwy5sq3RHXI

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: ALpdnj7VVS81ZMTT9T-fn96FcfdwGG_Bf6w57tf-kPE