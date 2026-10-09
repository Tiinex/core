# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-09 11:43:37
  - Trace: [001-unify-scoped-topics-discovery-with-qualified-transition-applicab.trace.md](001-unify-scoped-topics-discovery-with-qualified-transition-applicab.trace.md)
  - Origin:
    - [relative](001-unify-scoped-topics-discovery-with-qualified-transition-applicab.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-09 12:11:51
  - Authors: Anchor
  - Why: Preserve Native/Core semantic ownership rather than creating an attractive but invalid host-only transition save button.
  - Summary: Core Transition Definition/Companion creation is blocked: schema-driven authoring mappings and renderer must precede VS Code Save as Transition.
  - Status: ready/local

---

# Qualify Portable Transition Definition And Companion Creation Contracts

## Objective

Enable a genuine schema-driven Core creation contract for `tiinex.transition.definition.v1` and its required `tiinex.schema.transition.companion.v1` attachment surface before VS Code exposes Save as Transition. The operator explicitly wants a second form seeded from partial source material, not a preset conversion shortcut. Native owns schema semantics; Core owns generic bound creation and validation; host only presents it.

## Observed Blocker

On the qualified current Native/Core baseline `buildArtifactCreationContract({schemaId:'tiinex.transition.definition.v1',transitionType:'create-artifact'})` returns `status: blocked` and `creation.renderer.missing`. It exposes 16 binding groups, several `unmapped`, including Input Roles, Output Roles, Lifecycle Effects, Relation Effects, Placement Intent. `tiinex.schema.transition.companion.v1` also returns `status: blocked` with `creation.renderer.missing`. Evidence-v1 itself returns ready. This is a real cross-owner creation-contract gap; no VS Code serializer is authorized to bypass it.

## Done Criteria

- Qualify Native semantic field/declaration mappings for the full Transition Definition and Schema Transition Companion, preserving v1 and exact source checksum provenance; do not invent roles, conditions, lifecycle effects, Parent effects or generation bindings from a partial Evidence form.
- Implement/extend a general Core renderer and input projection that represents required and optional ordinary groups, repeatable declarations, `none`, nested Destination Bindings and Output Placements, unknowns and user-supplied values without silent omission.
- Core creation preflight/Preview/Create/reopen/parse/validate/seal all pass for one minimal and one complex Transition Definition plus the necessary companion. Negative cases reject missing required declarations, malformed shapes, ambiguous attachment and stale schema bytes.
- Partial Evidence seed retains only exactly mapped input fields, and unsupported semantics are explicitly empty/unknown and editable in the **second** schema-backed form. Core validates the actual new Definition separately; not all source Evidence fields must be completed to trigger the second form.
- Saving to prospective working directory's `.transitions` is a default convenience only, not a discovery requirement; the saved definition must enter Core's qualified candidate index and become an applicable preset **only** with independently qualified companion, package participation, generation bindings and conditions.
- All changes remain in Native/Core owner Workspaces until host projection; create a portable capability usable by VS Code, Viewer and CLI/LLM integrations. The latter host interfaces belong to a parallel fork, so do not rewrite them here.

## Scope

Core schema-driven Transition Definition/companion creation and exact qualification; Native schema owner changes only through qualified Native authoring and Docs sync if needed. Never add semantic rules to `operatorTrees.ts`, shortcut compatibility v2 or replace canonical Tiinex Handoff transport with patches.

## Execution Path

1. Native/Core map current unmatched schema groups into a qualified creation projection; test against actual v1 declaration grammar.
2. Core implements form-driven renderer with fail-closed roundtrip and exact-scope attachment projection; prove no ad hoc host serialization.
3. VS Code's existing `Save as Transition` Task consumes it in a separate form and tests partial source values, cancel and successful save; do not enable prematurely.

## Dependencies

- `native::.topics/.schemas/transition/definition/tiinex.transition.definition.v1.schema.md`
- `native::.topics/.schemas/transition/companion/tiinex.schema.transition.companion.v1.schema.md` (or its exact schema owner binding)
- `core::.topics/work/topics-discovery/001-unify-scoped-topics-discovery-with-qualified-transition-applicab.trace.md`
- `vscode::.topics/work/authoring-experience/003-2-core-guided-evidence-transitions-and-save-as-transition.trace.md`

## Completion Signal

Both Transition Definition and Companion return an implemented and exact Core creation contract, with positive and negative real artifact roundtrips; the host can open a second real form and save a qualified reusable Transition instead of simulating one.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-unify-scoped-topics-discovery-with-qualified-transition-applicab.trace.md](001-unify-scoped-topics-discovery-with-qualified-transition-applicab.trace.md)
  - Value: 7M0tZMnFNoeGVnlykysrqjU6eVrhr8rjIO-F_INgiLM

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: aJeR7E4drDo6ykbKI7IfitcCRZYOeys1Gf1BUvSabgY