# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-11 17:21:46
  - Trace: [001-1-historical-parent-schema-authority-recovery-for-role-continuation-task.trace.md](../001-1-historical-parent-schema-authority-recovery-for-role-continuation-task.trace.md)
  - Origin:
    - [relative](../001-1-historical-parent-schema-authority-recovery-for-role-continuation-task.trace.md)
- Current
  - Current Schema: tiinex.evidence.v1
  - Created At: 2026-09-11 20:20:00
  - Authors: Loom
  - Why: Preserve exact before/after, fail-closed, regression, and source-boundary evidence for the bounded Loom Core return.
  - Summary: Exact qualification evidence for runtime-backed historical Parent schema-authority recovery.
  - Status: ready/local

---

# Historical Parent Schema-Authority Recovery Qualification

## Supported Claim Or Question

- Supported Claim Or Question: can common-path authoring continue from a qualified historical Parent whose Current Schema is a bare schema id by recovering exact schema authority from already-qualified runtime canonical material, without copying schema files into the child Workspace or accepting same-id/ambiguous material
- Evidence Role: qualifies the bounded Core implementation requested by the Anchor to Loom Handoff

## Provenance

- Known Source: exact Core, Business, and Docs Workspaces materialized from the received qualified Handoff carrier through Tiinex
- Preservation Basis: exact carried source bytes plus local deterministic test/authoring receipts; Business and Docs remained read-only and no remote reconstruction was used
- Provenance Limits: the isolated after-case proves Tooling mechanics only and does not establish semantic correctness of any proposed Role parentage
- Historical Parent Reproduction: Business `.topics/roles/001-8-playthings-role.trace.md` with bare `Current Schema: tiinex.party.role.v1`
- Canonical Schema Material: carried Docs `.topics/.schemas/party/role/tiinex.party.role.v1.schema.md`
- Source Boundary: Business and Docs were read-only reproduction/reference context; only Core source was modified
- Remote Mutation: none

## Evidence Material

- Material Kind: exact source comparison, deterministic common-author reproduction, focused regression tests, full Core validation, portable smoke, and embedded-bootstrap qualification
- Material: baseline failure, patched isolated Role authoring receipt, focused/full test receipts, and Tiinex two-way Core source-frontier comparison
- Baseline Reproduction: the received common author failed the exact historical Role case with `portable.cli.author.parent.schema-authority.required` and wrote no child artifact
- Implementation: common author now resolves missing Parent schema-reference authority only from runtime-supplied qualified canonical schema material, requires exact registered schema id plus byte identity plus source identity, and requires an explicit durable target supplied by runtime schema-source authority
- Durable Target: the exact carried Role case resolves to `docs::.topics/.schemas/party/role/tiinex.party.role.v1.schema.md`; the generated isolated child preserved that target in `Parent Schema`
- Same-Id Guard: the embedded Role bootstrap representation with the same schema id but non-matching bytes is rejected
- Ambiguity Guard: multiple equally-qualified disagreeing runtime representations fail closed
- Workspace Preservation: isolated end-to-end Role authoring produced no `src/schemas` or other schema-copy side effect in the child Workspace
- Focused Regression: `node --test test/lineage-safety-hardening.test.mjs` passed 7/7
- Full Core Regression: `npm test` passed 76/76
- Portable Smoke: `npm run test:portable` passed
- Embedded Bootstrap Qualification: `npm run test:bootstrap` returned `embedded-qualified` with 489 runtime files and 5,353,849 runtime bytes
- Source Frontier: Tiinex two-way comparison against the exact received Core snapshot was clean with three byte-changed source/test paths and no additions or removals before completion artifacts were authored

## Preservation And Fidelity

- Preservation State: received Core behavior outside the bounded recovery path remains covered by the complete passing validation surface; Business and Docs source bytes were not modified
- Fidelity Notes: Parent semantics are unchanged; same-id material alone remains insufficient; exact byte/source identity and an explicit durable target are required
- Parent Semantics: recovery does not decide whether one Role should semantically Parent another
- Target Truth: recovery does not fabricate a child-relative schema path; runtime authority must supply an explicit durable target, currently the qualified `docs::` traversal route
- Known Losses: none in the bounded Core source change; semantic Role disposition remains external to this Handoff

## Interpretation Limits

- Does Not Prove: that Playthings should semantically parent Prism or any other Role
- Not Yet Used As: authority to author or integrate the actual Prism Role lineage
- Must Not Be Treated As: permission to accept unresolved, stale, same-id-only, filename-derived, repository-name-derived, or ambiguous schema material
- Authority Limits: shared Core common-author schema-reference recovery only; no Business semantic rewrite, publication, or remote write authority

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-1-historical-parent-schema-authority-recovery-for-role-continuation-task.trace.md](../001-1-historical-parent-schema-authority-recovery-for-role-continuation-task.trace.md)
  - Value: jDBEoIgtQBGmoUOEJTFyZTIseS1czGTOKkVNDNW_6RA

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: W_-Vp_TiP_hON_XQRRXGNT1KYqBFJ0JImbvHVWqLcUE