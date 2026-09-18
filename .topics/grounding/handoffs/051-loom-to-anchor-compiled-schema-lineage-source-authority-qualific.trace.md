# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: tiinex.evidence.v1
  - Created At: 2026-09-18 19:44:33
  - Trace: [028-compiled-schema-lineage-source-authority-qualification.trace.md](../evidence/028-compiled-schema-lineage-source-authority-qualification.trace.md)
  - Origin:
    - [relative](../evidence/028-compiled-schema-lineage-source-authority-qualification.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-18 19:45:19
  - Authors: Loom
  - Why: Task 027 requires one Loom-to-Anchor return Handoff after qualification Evidence and full Core/portable/bootstrap validation are green.
  - Summary: Return the qualified Core source-authority repair for Task 027 with six carried contradictions preserved fail-closed until exact historical Parent authority is independently available.
  - Status: ready/local

---

# Loom To Anchor — Compiled Schema Lineage Source-Authority Qualification

## Handoff Parties

- Purpose: return the bounded Core repair for compiled schema-lineage source-authority coherence, with exact qualification evidence and the six carried contradictions preserved as fail-closed until exact historical Parent authority is available.
- From: Loom
- From Kind: role
- From Reference: [Loom Role — Canonical Holder Cutover Continuation](business::.topics/roles/001-3-1-loom-canonical-holder-cutover-role.trace.md)
- To: Anchor
- To Kind: role
- To Reference: [Anchor Role — Canonical Holder Cutover Continuation](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)

## Transfers

- compiled-schema-lineage-source-authority-coherence
  - Transfer Kind: work-and-responsibility
  - Description: return the Task `027` Core source delta and qualification result. Core now separates leaf structural schema qualification from exact compiled inheritance source authority and withholds exact runtime validation unless each inherited Parent source is source-coherent with the child declaration.
  - Controlling Artifact: [Compiled Schema Lineage Source-Authority Qualification](../evidence/028-compiled-schema-lineage-source-authority-qualification.trace.md)
  - Boundary: bounded Core Tooling/schema runtime mechanics only; no Business or Docs historical bytes were rewritten and no current schema material was relabeled as historical authority.

## Required Context

- qualification-evidence
  - Material: exact Loom Evidence qualifying the implementation, six-item registered contradiction inventory, positive exact-match case, negative source-substitution case, full Core regression, portable smoke, and embedded-bootstrap qualification.
  - Material Reference: [Compiled Schema Lineage Source-Authority Qualification](../evidence/028-compiled-schema-lineage-source-authority-qualification.trace.md)
  - Purpose: controlling return evidence and acceptance record for the bounded repair.
  - Availability: available

- controlling-core-task
  - Material: exact Core Task defining the source-authority coherence objective, Done Criteria, exclusions, and acceptance boundary.
  - Material Reference: [Compiled Schema Lineage Source-Authority Coherence](../027-compiled-schema-lineage-source-authority-coherence.trace.md)
  - Purpose: verify that the returned source delta stays inside the delegated scope.
  - Availability: available

- inbound-reproduction-evidence
  - Material: Anchor Evidence that reproduced the original organization warning and exact six registered runtime source-authority mismatches before repair.
  - Material Reference: [Compiled Schema Lineage Source-Authority Reproduction](../evidence/027-compiled-schema-lineage-source-authority-reproduction.trace.md)
  - Purpose: compare the returned mechanical boundary against the original defect inventory without rewriting historical evidence.
  - Availability: available

## Reference Context

- inbound-anchor-to-loom-handoff
  - Material: delegation that assigned Task `027` to Loom and retained semantic schema revision and final integration with Anchor/Axiom.
  - Material Reference: [Anchor To Loom — Compiled Schema Lineage Source-Authority Coherence](050-anchor-to-loom-compiled-schema-lineage-source-authority-coherenc.trace.md)
  - Purpose: delegation provenance and retained-responsibility boundary.
  - Availability: available

- implementation-delta
  - Material: `src/schemas/schema.lineageAuthority.js`, `src/schemas/schema.source.js`, `src/tooling/portable/schema/qualifiedLocalRoot.runtime.js`, and `test/schema-lineage-source-authority.test.mjs` in the returned Core Workspace.
  - Material Reference: [Compiled Schema Lineage Source-Authority Qualification](../evidence/028-compiled-schema-lineage-source-authority-qualification.trace.md)
  - Purpose: Evidence-bound exact bounded implementation and regression surface returned for Anchor integration.
  - Availability: available

## Retained Responsibilities

- acceptance-and-integration
  - Retained By: Anchor
  - Responsibility: review and integrate the returned Core source delta, preserve separation from Task `026-1-3`, and establish the next accepted Core recovery frontier.
  - Boundary: Loom qualifies this bounded implementation; Anchor owns integration and broader recovery acceptance.

- historical-parent-source-resolution
  - Retained By: Anchor / Axiom / Docs semantic owner
  - Responsibility: provide independently qualified exact historical Parent material for any of the six contradictory chains, or deliberately revise canonical schema declarations under separate semantic authority if those declarations are defective.
  - Boundary: this return does not infer historical source equivalence and does not authorize Loom/Core to rewrite Docs declarations.

## Exclusions And Dependencies

- no-historical-rewrite
  - Kind: excluded-scope
  - Description: Business and Docs historical artifacts remain untouched; linter or runtime warning reduction is not a reason to mutate them.
  - Responsible Party Or Role: Anchor / Loom / Axiom

- no-validation-weakening
  - Kind: excluded-scope
  - Description: exact runtime validation remains unavailable when compiled inheritance source authority is unresolved or contradictory; same schema id, same path, current registry material, or newer commit does not qualify substitution.
  - Responsible Party Or Role: Core Tooling / Anchor

- six-contradictions-remain-truthful
  - Kind: unresolved-dependency
  - Description: the carried package does not contain independently qualified exact historical Parent material for the six registered contradictions, so they intentionally remain fail-closed after this repair rather than being silently re-bound.
  - Responsible Party Or Role: Anchor / Axiom / Docs semantic owner

- open-grounding-repair-remains-separate
  - Kind: excluded-scope
  - Description: Task `026-1-3` return-recipient Role closure symmetry is not changed or absorbed by this work.
  - Responsible Party Or Role: Anchor

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Loom has completed the bounded Task `027` implementation and qualification: exact compiled inheritance source authority is checked before runtime validation projection, exact source matches qualify, source substitution remains rejected, the six registered contradictions remain truthfully fail-closed because exact historical Parent material is unavailable, historical artifacts remain untouched, all 184 Core tests pass, portable smoke passes, and embedded bootstrap is qualified.
- Return To: Anchor
- Return To Reference: [Anchor Role — Canonical Holder Cutover Continuation](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)

## Interpretation Limits

- Does Not Mean: the six historical schema chains are now exact-authority-qualified; current or newer Docs bytes supersede child-declared historical Parent revisions; historical Business artifacts are invalid; or warnings may be suppressed.
- Must Not Be Used To Claim: schema-id equality, path equality, repository adjacency, newer chronology, current package carriage, or byte similarity establish version-bearing Parent source authority.
- Authority Limits: bounded Core schema runtime source qualification and exact validation-authority mechanics for Task `027`; semantic Docs revision and final recovery integration remain outside Loom's returned authority.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [028-compiled-schema-lineage-source-authority-qualification.trace.md](../evidence/028-compiled-schema-lineage-source-authority-qualification.trace.md)
  - Value: KkYFbFZp8UT-uyjcFz0QQ5B422rG7JUWUbWoOBk2Thw

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 0JxMI-Nf6XFKmn-CeAQsznb1avmguuoIMal1JNQRqRA