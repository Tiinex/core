# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-18 19:28:38
  - Trace: [027-compiled-schema-lineage-source-authority-coherence.trace.md](../027-compiled-schema-lineage-source-authority-coherence.trace.md)
  - Origin:
    - [relative](../027-compiled-schema-lineage-source-authority-coherence.trace.md)
- Current
  - Current Schema: tiinex.evidence.v1
  - Created At: 2026-09-18 19:28:56
  - Authors: Anchor
  - Why: Sigma surfaced an editor warning that could indicate either weak artifacts or Core validation debt; the bounded reproduction shows a real compiled schema-lineage authority contradiction and preserves it for Loom repair.
  - Summary: Reproduce and inventory compiled Parent source-authority substitution that causes exact schema validation to fail closed.
  - Status: ready/local

---

# Compiled Schema Lineage Source-Authority Reproduction

## Supported Claim Or Question

- Supported Claim Or Question: does current Core exact validation correctly withhold child-schema validation when its compiled inheritance lineage substitutes a different Parent source revision than the child schema explicitly declares
- Evidence Role: exact reproduction and bounded inventory for the Core repair Task `027-compiled-schema-lineage-source-authority-coherence.trace.md`

## Provenance

- Known Source: Major 004 full-recovery Core, Business, and Docs Workspace bytes after the accepted VS Code/Core integration
- Preservation Basis: exact carried Workspace bytes plus deterministic local Core validation/authority projection against read-only Business and Docs material
- Provenance Limits: no Business or Docs artifact mutation, no remote fetch, no source rewrite, and no semantic claim that a newer schema revision supersedes a child-declared historical Parent revision
- Semantic Authority Boundary: this Evidence records mechanical source-authority incoherence only; it does not decide whether any Docs schema should be revised or republished

## Evidence Material

- Material: Business `.topics/001-tiinex.trace.md`, Core `portableRuntimeValidationAuthorityForRecord`, registered runtime schema projections, and exact mismatch inventory from Major 004
- Material Kind: deterministic local validation and compiled lineage source-authority audit
- Business Reproduction: `.topics/001-tiinex.trace.md` has verified c14n-v2 self-integrity and a qualified exact `Current Schema` target for `tiinex.party.organization.v1`
- Withheld Exact Validation: exact child validation is withheld with `audit.schema-authority.unqualified`, not because the Business artifact violates the child contract, but because the compiled schema lineage is source-incoherent
- Exact Organization Mismatch: `tiinex.party.organization.v1` declares Parent `tiinex.party.v1` at `Tiinex/docs@2a40646640f7468bcd250df6988b69e9f047f1bb/.topics/.schemas/party/tiinex.party.v1.schema.md`, while the compiled runtime lineage attributes that Parent to `Tiinex/docs@3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/party/tiinex.party.v1.schema.md`
- Registered Runtime Inventory: six registered runtime schema projections contain the same class of exact Parent-source substitution mismatch: `tiinex.party.organization.v1`, `tiinex.party.role.v1`, `tiinex.evidence.v1`, `tiinex.feedback.v1`, `tiinex.workspace.representation.v1`, and `tiinex.discovery.finding.v1`
- Historical Debt Separation: other audit warnings exist for preserved historical schema locators or unavailable registered compiled authority; those are distinct from this positive compiled-lineage contradiction and must not be collapsed into one repair
- Fail-Closed State: current Core refuses to claim exact child validation when the version-bearing schema authority or compiled inheritance lineage is unqualified; this behavior is correct evidence and must not be weakened merely to remove editor warnings

## Preservation And Fidelity

- Preservation State: Business and Docs evidence bytes remained read-only; only this Core Evidence artifact is newly authored
- Fidelity Notes: the reproduction uses the same Major 004 Core runtime that drives the VS Code diagnostics shown by Sigma
- Known Losses: exact historical Parent bytes for every mismatched commit were not reconstructed in this audit; the repair Task must qualify or fail closed rather than infer byte equivalence from schema id or later repository state

## Interpretation Limits

- Does Not Prove: that the Business organization artifact is invalid, that its body misses minimum fields, that the child schema Parent should be revised, or that a later Docs commit is semantically interchangeable with the declared Parent revision
- Not Yet Used As: authority to rewrite Business/Docs artifacts or regenerate runtime schema projections with substituted source identity
- Must Not Be Treated As: permission to downgrade exact source-authority checks, suppress the diagnostic, or treat same-schema-id material as the same version-bearing authority
- Authority Limits: Core Tooling/schema runtime compilation and validation-authority mechanics only

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [027-compiled-schema-lineage-source-authority-coherence.trace.md](../027-compiled-schema-lineage-source-authority-coherence.trace.md)
  - Value: xlXmVgz2680XcmIIem56VGQwUuTgFSZZMCvmQEJ4zGQ

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: MlBcp8tQz9kSzVXqSrKH-Is1efPNVt_UVoazd-RmIt0