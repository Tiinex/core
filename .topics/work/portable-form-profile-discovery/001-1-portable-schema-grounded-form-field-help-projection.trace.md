# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-08 20:50:44
  - Trace: [001-qualify-portable-form-profile-discovery-core-task.trace.md](001-qualify-portable-form-profile-discovery-core-task.trace.md)
  - Origin:
    - [relative](001-qualify-portable-form-profile-discovery-core-task.trace.md)
- Current
  - Current Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-10-08 21:07:10
  - Authors: Anchor
  - Why: Complete independent source-linked field-help foundation without introducing a competing Forms semantic authority.
  - Summary: Read-only Core form-field-help operation with qualified schema provenance, source lines and 506 passing tests.
  - Status: ready/local

---

# Portable Schema-Grounded Form Field Help Projection

## Supported Claim Or Question

- Supported Claim Or Question: Can Core expose exact source-linked, host-neutral field help for existing Evidence and Handoff creation contracts, without qualifying nonexistent Form Profiles or moving schema semantics into VS Code?
- Evidence Role: exact Core source implementation and tested behavior; does not imply Form Profile discovery or host UI acceptance.
- Review Context: following Native-first investigation, the field-help subset is already enabled by qualified existing schema content and needs no new Native semantics.

## Provenance

- Known Source: registered Native schema source and exact runtime schema Markdown from the qualified portable composition, Core creation bindings, and Core schema-document parser with line information.
- Preservation Basis: source files `src/tooling/portable/schema/form.fieldHelp.js`, public portable export, `form-field-help` operation descriptor/handler, and `test/form.fieldHelp.test.mjs` in the Core Workspace snapshot.
- Provenance Limits: field help gives a confirmed field occurrence within the schema's validation group, not an invented field-exclusive natural-language explanation. Group-context prose is explicitly labeled and may not be promoted to standalone field authority.

## Evidence Material

- Material Kind: bounded host-neutral functional change and tests.
- Material: `projectPortableFormFieldHelp({schemaId, field?})` resolves exact registered schema Markdown plus the Core creation input binding; verifies the requested schema ID, returns the schema source repository/commit/path/checksum, source group heading/line and exact `- Field` line when available, plus bounded source group excerpt. Unmapped/unavailable fields return `unresolved` or `unavailable` with null source and no guessed guidance. The additive read-only `form-field-help` portable operation exposes the same projection to hosts and LLM adapters, without materialization/validation authority, and the public portable index exports it for consumers.
- Checks: `form.fieldHelp.test.mjs` has six passing focused tests for Evidence Material, Handoff Purpose, unknown schema/field, whole-field projection, registered operation, and unresolved Presentation Surface creation binding. With exact Native and Business workspace source roots, the complete Core test suite passed 506/506, 0 failures. A first run without selected Business content failed only because its test fixture path was absent (`ENOENT`); that environmental source mismatch was corrected through the exact carried Business snapshot before reporting full PASS.
- Semantic Boundary: the operation does not install `.forms` discovery, assert applicability, infer default values or define a Form Profile.

## Preservation And Fidelity

- Preservation State: exact changed Core source and this Evidence in the next canonical Handoff Package.
- Fidelity Notes: schema group prose is explicitly marked `schema-validation-group`; exact field declarations are distinguished by source line, and missing mappings remain unresolved.
- Known Losses: no Windows/Viewer field-help integration yet, no automatic synthetic field-specific explanation from free schema prose, and no per-material Evidence schema evolution.

## Interpretation Limits

- Not Yet Used As: Core Form Profile discovery PASS, VS Code/UI acceptance or product release gate.
- Does Not Prove: that every Core schema has field-specific prose or that every authoring input is an exact ordinary-field binding.
- Must Not Be Treated As: schema-generated validation defaults or a substitute for the qualified Native Form Profile task.
- Need For Review: Core owner should review the public operation shape and source/provenance fidelity. Then VS Code/Viewer may present it as a tooltip/panel on the existing form while preserving the default right-click/create flow. Proceed with `.forms` candidate discovery only after Native's qualified profile schema and attachment semantics exist.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-qualify-portable-form-profile-discovery-core-task.trace.md](001-qualify-portable-form-profile-discovery-core-task.trace.md)
  - Value: T_GZ3gQAhw-JvuKxrRfBUhDQD1_XwgtgDymRu-HGgw8

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: c9SQ1QekZzSiijXIzwTqcRBIL8by5V6BY01-mjY_vpY