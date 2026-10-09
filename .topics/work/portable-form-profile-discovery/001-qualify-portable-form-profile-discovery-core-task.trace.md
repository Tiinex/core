# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-08 20:50:44
  - Authors: Anchor
  - Why: Avoid a second executable forms registry and preserve Core as the portable discovery and qualification authority.
  - Summary: Provide Core-qualified profile discovery, attachment, source help, fallback and host-neutral rendering inputs after Native schema qualification.
  - Status: ready/local

---

# Qualify Portable Form Profile Discovery And Projection

## Objective

Provide one Core-owned, host-neutral read-only discovery and qualification surface for Native-defined Form Profile candidates without duplicating schema logic or inferring authority from `.forms` folder names.

## Done Criteria

- Discover candidates from explicitly selected, qualified schema/content source boundaries; identify source provenance, schema binding and exact representation identity, not just filename/path pattern.
- Support optional schema-local `.forms/` while preserving a flat schema source layout; candidate discovery alone never means official attachment, execution, selection, completeness, validity, or recommended quick entry.
- When Native specifies an explicit attachment/companion contract, resolve its references exactly, fail closed on duplicate or contradictory registrations, and report distinction between discovered and attached profiles.
- Project host-neutral task intent, presentation order, field help with schema-rule provenance, qualified context value mapping, unknown/default behavior and generic Full Form fallback; never invent required values or weaken `inspect-creation-contract`/Core materialization.
- Test one Evidence profile across multiple source roots, unknown/corrupt profile, duplicate profile ID, mismatched schema reference, missing required input, unsupported host capability, source drift and no-profile fallback.
- No executable `forms.js` semantic authority or legacy Transition runtime duality is introduced.

## Scope

- Owner: Core, only after Native's actual schema/authoring contract is qualified.
- Native owns Form Profile semantics and schema declarations; VS Code/Viewer/CLI/LLM own their host controls and may defer unsupported interactions without inventing defaults.
- Avoid modifying `operatorTrees.ts` to implement form semantics.

## Dependencies

- [Native Form Profile qualification](native::.topics/work/portable-form-profiles/002-qualify-portable-form-profiles-native-task.trace.md) must first establish a valid artifact representation and its intended schema attachment meaning.
- The existing Core Transition catalog/semantic-package boundary is the discovery precedent, not a drop-in Form Profile semantic implementation.

## Execution Order

1. Consume the Native-qualified profile schema and authoring fixture.
2. Add additive, read-only Core discovery/projection tests with explicit authority provenance.
3. Expose source-linked help and host-independent effective creation contract.
4. Validate generic Full Form fallback and cross-host adapters before release integration.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: T_GZ3gQAhw-JvuKxrRfBUhDQD1_XwgtgDymRu-HGgw8