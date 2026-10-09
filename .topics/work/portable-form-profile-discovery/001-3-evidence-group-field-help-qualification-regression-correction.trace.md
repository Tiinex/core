# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-10-08 21:53:49
  - Authors: Anchor
  - Why: Sigma observed missing field help for grouped Evidence fields despite a Core schema source projection.
  - Summary: Exact Native group-field sources and named rules for readable Evidence form help, keeping creation authority unchanged.
  - Status: ready/local

---

# Evidence Group Field Help Qualification Regression Correction

## Supported Claim Or Question

- Supported Claim Or Question: Why does the installed Evidence authoring UI say `No human meaning supplied by the Core schema guide` and `Exact field source not available from Core` for its first required group fields, despite a previously qualified form-field-help operation?
- Evidence Role: directly supported Windows screenshot regression, Core projection change and tested limit; not a host UX PASS.
- Review Context: Sigma reports unusable helper text after normal Incoming → Replace → Build → Reload, and material references remaining one shared field.

## Provenance

- Known Source: user's two direct Windows screenshots preserved in the VS Code Workspace; exact Core `src/tooling/portable/schema/form.fieldHelp.js`; `test/form.fieldHelp.test.mjs`; latest carried Native `tiinex.evidence.v1.schema.md` with Schema Validation Contract.
- Preservation Basis: owner-scoped Core source snapshot and qualified Evidence in one canonical 17-Workspace Tiinex Handoff Package. No loose patch or duplicated semantic source.
- Provenance Limits: no claim that a `presentation.surface` Form Profile or Native Evidence individual-material schema has been implemented.

## Evidence Material

- Material Kind: exact Core schema-binding regression, source projection and native rule context.
- Material: Native/Core creation contract exposes the group `Supported Claim Or Question` as a single ordinary-group input, but VS Code draws its named required fields `Supported Claim Or Question` and `Evidence Role` separately. The earlier Core help projected the group as one entry with no `fieldLine`, so the strict host matcher correctly declined to invent provenance for either field.
- Correction: for each Core-owned ordinary-group creation binding, project its explicitly declared required/optional children as *presentation/provenance records only*. Require an exact field-list line in Native's Schema Validation Contract; never create new creation inputs, implicit values or materialization rules. Expose a `fieldRule` only for an exact named list rule in that same qualified group. Whole Core response still distinguishes group context from field rules.
- Verification: `form.fieldHelp.test.mjs` passes 9/9 with exact Native runtime; genuine portable CLI returns qualified `Evidence Role` field provenance at line 100 and its explicit rule. Full Core suite with correct Native/Business test roots: 509 PASS, 0 FAIL, 1 SKIP (510 total). Regressions separately assert unknown inputs remain unavailable and no cross-schema provenance leaks.

## Preservation And Fidelity

- Preservation State: exact source and relevant test carried as Core Workspace; no Native schema files changed in this repair.
- Fidelity Notes: every displayed field rule is a literal source-derived exact named Native rule; no generic LLM explanation is promoted to authority.
- Known Losses: the installed Windows host still requires Sigma acceptance after the qualified carrier is applied.

## Interpretation Limits

- Not Yet Used As: complete forms/Quick Form/Evidence multi-material implementation, Windows PASS or Marketplace permission.
- Does Not Prove: that all schema groups expose exact prose for every field; Core returns empty fieldRule when they do not.
- Must Not Be Treated As: permission to turn all array-like file references into individually described Evidence material entries.
- Need For Review: Sigma first checks the two top-level Evidence fields for readable exact source-linked help, then Evidence `Material`, `Material Kind` and another Handoff field; incorrect/missing guidance is a blocker to this scoped help gate.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: tIhUISB-dMPUu41ht256tJ7-p2nYIEubikSa0WqArUk