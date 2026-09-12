# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-12 08:06:35
  - Trace: [002-1-1-core-major-007-per-field-schema-reference-authority-enforcement.trace.md](002-1-1-core-major-007-per-field-schema-reference-authority-enforcement.trace.md)
  - Origin:
    - [relative](002-1-1-core-major-007-per-field-schema-reference-authority-enforcement.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-12 11:45:35
  - Authors: Anchor
  - Why: Fresh Anchor strict-isolation failed because a complete Business Workspace carried prior answers; existing bounded manufacture projects scope correctly but recipient-v2 closure currently fails.
  - Summary: Make canonical bounded Workspace Representation fully usable in Handoff-carrier recipient-v2 manufacture so isolation-sensitive carriers can exclude unrelated Workspace entries without losing route/root/Parent qualification.
  - Status: ready/local

---

# Core Major 008 — Bounded Handoff Carrier Isolation And Recipient Closure

## Objective

Make the already-canonical bounded Workspace Representation mechanism fully usable by Handoff-carrier manufacture so isolation-sensitive carriers can expose an explicit subset of one Workspace without carrying unrelated answer/history artifacts, while preserving qualified route continuity, detached Parent recovery and recipient-v2 provider authority.

## Reproduction

The current fresh-successor isolation harness attempted to manufacture a Handoff carrier with `business` as a `bounded` Workspace scope and an explicit exact entry set. Baseline manufacture enumerated and projected the bounded scope successfully, but recipient-v2 qualification then failed with errors including:

- `portable.handoff-v2-phase1.source-surface-unready`
- `portable.handoff-v2-surface.cache.material-unowned`
- package root / READ-BEFORE / route / Workspace surface unresolved after that failure

The bounded scope itself reported `qualified` with `explicit-bounded-entry-selection-v1`; the failure is therefore in Handoff-carrier recipient closure/ownership integration, not a request to weaken bounded representation semantics.

## Done Criteria

- A Handoff carrier may use one or more explicitly selected `coverage: bounded` Workspace scopes through existing `--workspace-scopes` input.
- The selected Handoff route inside a bounded Workspace remains independently qualified.
- Required Context that points to the bound Workspace may resolve through the explicit bounded Workspace Representation without promoting it to complete coverage.
- Detached Parent/recovery bytes required outside the bounded entry set are carried under qualified recovery/cache ownership and do not become representation members.
- Recipient-v2 package root, READ-BEFORE, endpoint Role pointers, selected route, Workspace Representation, External Payload and roundtrip inspection all qualify.
- Omitted Workspace entries remain `outside-representation-not-absent-from-workspace`; manufacture must never reinterpret omission as deletion or whole-Workspace absence.
- A regression reproduces the successor-isolation case: governing Business artifacts are included, prior completed successor answer artifacts are excluded, and the resulting carrier validates/orients/grounds to the Tiinex organization root.
- Complete Workspace manufacture behavior and existing complete-carrier tests remain unchanged.
- Full relevant Core test/portable/bootstrap qualification passes.

## Scope

Core portable Handoff manufacture, bounded Workspace Representation integration, material/route closure, recipient-v2 cache ownership and focused tests only.

## Dependencies

- Canonical `tiinex.workspace.representation.v1` bounded coverage semantics from Docs.
- Current bounded manufacture projection and detached Parent-boundary closure implementation.
- Business selector-isolated successor acceptance process as the concrete dogfood case.

## Exclusions

- No canonical schema redesign.
- No Business acceptance-policy rewrite beyond consuming the already-authored process.
- No VS Code/App/Site implementation change.
- No remote mutation, release or publication.

## Acceptance Boundary

The Core result proves the generic bounded Handoff-carrier mechanism. It does not itself close Fresh Anchor successor acceptance; retained Anchor must manufacture a new answer-isolated carrier and run a new cold successor afterward.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [002-1-1-core-major-007-per-field-schema-reference-authority-enforcement.trace.md](002-1-1-core-major-007-per-field-schema-reference-authority-enforcement.trace.md)
  - Value: Fhgix461yciWBfK4v8JJjHnHcMpdxZ_WXknN9YGyOJs

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: i_Mrj1SzJlwICR0bcqUXHwFnpIaLkK7KIYJWRA_IuF8