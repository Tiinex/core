# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-15 22:43:04
  - Trace: [001-2-7-5-1-2-1-1-1-1-2-canonical-holder-legacy-removal-and-cutover-completion.trace.md](business::.topics/initiatives/001-2-7-5-1-2-1-1-1-1-2-canonical-holder-legacy-removal-and-cutover-completion.trace.md)
  - Origin:
    - [relative](business::.topics/initiatives/001-2-7-5-1-2-1-1-1-1-2-canonical-holder-legacy-removal-and-cutover-completion.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-15 22:43:26
  - Authors: Anchor
  - Summary: Remove temporary legacy holder authorization after complete canonical active Role migration.
  - Status: ready/local

---

# Canonical Holder Legacy Removal Mechanics

## Objective

Remove the temporary legacy holder-assignment authorization surface from Core now that Anchor has qualified the complete active Role migration to direct canonical `Assignment Modes`.

Canonical Role material must become the only current holder-assignment authority consumed by Core. Historical Roles remain immutable audit evidence, but no exact legacy mapping, prose interpretation, Role-name/path exception or compatibility branch may authorize current holder binding after this Task completes.

## Done Criteria

- Verify the exact eight canonical active Role artifacts declared by Business before removing temporary migration support.
- Delete `LEGACY_ROLE_MAPPINGS` and any semantically equivalent legacy-positive authorization path from active runtime code.
- Delete or invert legacy-positive tests so historical pre-cutover Role artifacts no longer qualify as current holder-assignment authority merely because they were formerly mapped.
- Preserve direct canonical Assignment Modes as the only positive current authorization basis.
- Keep Holder State prose non-authoritative and unparsed.
- Fail closed when canonical Assignment Modes are absent, unsupported, malformed, or carried by unqualified current Role material.
- Cover Anchor, Axiom, Loom, Sigma, Glimmer, Kodax, Pilot and Prism through generic canonical-mode regressions without Role-specific production branches.
- Preserve human-first/executor-neutral semantics: no ChatGPT, LLM, provider, model, chat, host or repository-specific holder semantics are introduced.
- Preserve historical Role bytes and provenance; cleanup changes runtime acceptance, not history.
- Full Core suite, portable smoke and embedded bootstrap qualification remain green.
- Return exact qualification Evidence and one Loom-to-Anchor Handoff for Anchor reconciliation.

## Scope

Core holder-assignment authorization cleanup and focused canonical-only regressions. No new Role schema semantics, no Business mutation, no delegation/process/source-authority redesign, no general authoring UX work and no unrelated refactor.

## Dependencies

- Business `Canonical Holder Legacy Removal And Cutover Completion` Task.
- Business `Canonical Holder Active Role Migration Disposition` with the exact eight active Role identities and digests.
- Existing canonical holder mechanics and identifier-only historical Parent authoring correction.

---

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-2-7-5-1-2-1-1-1-1-2-canonical-holder-legacy-removal-and-cutover-completion.trace.md](business::.topics/initiatives/001-2-7-5-1-2-1-1-1-1-2-canonical-holder-legacy-removal-and-cutover-completion.trace.md)
  - Value: KEFIwQD1P-87uD2mgR7WOCQhSLTpBakbPs8Q6tE9p7c

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: CwaNvK8RitWUUPgjgjNZXv2FtjdkrncitheKjFNOJlI