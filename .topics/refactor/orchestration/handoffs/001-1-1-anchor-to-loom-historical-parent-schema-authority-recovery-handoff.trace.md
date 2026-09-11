# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-11 17:21:46
  - Trace: [001-1-historical-parent-schema-authority-recovery-for-role-continuation-task.trace.md](../001-1-historical-parent-schema-authority-recovery-for-role-continuation-task.trace.md)
  - Origin:
    - [relative](../001-1-historical-parent-schema-authority-recovery-for-role-continuation-task.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-11 17:21:46
  - Authors: Anchor
  - Why: Shared Tooling must support truthful lineage continuation without schema-copy hacks, while remaining fail closed and semantics-neutral.
  - Summary: Transfer the common-author historical Parent schema-authority recovery blind spot to Loom.
  - Status: ready/local

---

# Anchor to Loom — Historical Parent schema-authority recovery

## Handoff Parties

- Purpose: fix the shared common-author blind spot that currently blocks truthful Role continuation from older qualified artifacts with a bare schema id.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Role](business::.topics/roles/001-3-loom-role.trace.md)

## Transfers

- reproduce-parent-schema-authority-gap
  - Transfer Kind: work-and-responsibility
  - Description: reproduce `portable.cli.author.parent.schema-authority.required` when authoring a direct child of Business `001-8-playthings-role.trace.md` with current common-path Tooling.
  - Controlling Artifact: [Historical Parent Schema-Authority Recovery For Role Continuation](../001-1-historical-parent-schema-authority-recovery-for-role-continuation-task.trace.md)
  - Boundary: the failure is currently correct to fail closed; repair the evidence path, not the safety boundary.
- implement-qualified-authority-recovery
  - Transfer Kind: work
  - Description: allow exact parent schema authority to be recovered from already-qualified canonical bootstrap/schema material when the schema id and material identity match exactly, while rendering a durable resolvable child reference and preserving ambiguity failure.
  - Boundary: no local schema-copy workaround and no semantic inference from filename/repository placement.
- regression-and-return
  - Transfer Kind: work
  - Description: add focused regression coverage and return exact before/after evidence plus any remaining semantic dependency to Anchor.
  - Boundary: do not author or choose the Prism Role lineage itself.

## Required Context

- core-workspace
  - Material: Complete current Core Workspace.
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: Owning shared Tooling implementation.
  - Availability: available
- business-workspace
  - Material: Current Business Workspace including the exact historical Role Parent sample.
  - Material Reference: [Business Workspace](business::.topics/.workspaces/tiinex-business.workspace.md)
  - Purpose: Reproduction source only; Business semantics are not redefined here.
  - Availability: available
- docs-workspace
  - Material: Current canonical Docs Workspace.
  - Material Reference: [Docs Workspace](docs::.topics/.workspaces/tiinex-docs.workspace.md)
  - Purpose: Exact schema authority and read-only semantic boundary.
  - Availability: available

## Reference Context

- axiom-parallel-audit
  - Material: Axiom is being asked in parallel to disposition Role Parent-vs-Relation semantics.
  - Purpose: Loom must keep the implementation semantics-neutral and avoid baking one semantic choice into recovery mechanics.
  - Availability: available

## Retained Responsibilities

- semantic-disposition
  - Retained By: Axiom
  - Retained By Reference: [Axiom Role](business::.topics/roles/001-2-axiom-role.trace.md)
  - Responsibility: determine correct Role continuity semantics.
  - Boundary: Loom repairs exact-authority mechanics only.
- integration
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: merge qualified Core return and apply it to actual Role lineage only after semantic disposition.
  - Boundary: no automatic Business mutation from Loom.

## Exclusions And Dependencies

- permissive-fallback
  - Kind: excluded-scope
  - Description: Do not accept unresolved or merely same-id schema material as authority.
  - Responsible Party Or Role: excluded.
- business-role-edit
  - Kind: excluded-scope
  - Description: Do not edit Business Role artifacts in this Handoff.
  - Responsible Party Or Role: Anchor after Axiom/Loom reconciliation.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Return a bounded Core implementation with focused regression evidence, exact fail-closed behavior, and a normal Handoff to Anchor.
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Interpretation Limits

- Does Not Mean: bare schema ids become globally authoritative, canonical bootstrap identity can be guessed, or Tooling chooses Role semantics.
- Must Not Be Used To Claim: successful authoring proves a proposed Parent is semantically correct.
- Authority Limits: shared authoring mechanics only.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-1-historical-parent-schema-authority-recovery-for-role-continuation-task.trace.md](../001-1-historical-parent-schema-authority-recovery-for-role-continuation-task.trace.md)
  - Value: jDBEoIgtQBGmoUOEJTFyZTIseS1czGTOKkVNDNW_6RA

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 3VRALYulwizEistR_p4Kkg_mYdd0tCYmCtGKmGFU7z8