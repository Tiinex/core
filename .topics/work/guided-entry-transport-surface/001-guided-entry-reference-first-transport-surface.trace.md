# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-05 21:39:37
  - Authors: Anchor; Sigma
  - Why: Real VS Code dogfood showed WHAT-to-WHERE selection working but the copied transport duplicated most of the selected Entry and Target definitions.
  - Summary: Make Guided Entry clipboard transport reference-first and scan-friendly while preserving exact Entry/Target material as semantic truth.
  - Status: ready/local

---

# Guided Entry Reference First Transport Surface

## Objective

Reduce Guided Entry transport boilerplate without reducing qualified Entry/Target semantics or moving semantic ownership into VS Code.

## Done Criteria

- pointerless Guided Entry transport keeps the canonical cold-start/Start/bootstrap boundary but avoids restating the full selected Entry procedure
- transport identifies the selected WHAT Entry by canonical identity and exact qualified material location, then instructs the recipient to qualify/apply that exact material after bootstrap
- selected WHERE Target is represented by canonical Target Entry identity and exact material location, with one compact environment-adaptation authority boundary
- full Entry and Target semantics remain available in the qualified projection (`entryDefinition` / `targetDefinition`) and their carried/content-source artifacts rather than being duplicated into clipboard prose
- session Role/participant projection remains exact but compact and preserves the non-authority boundary
- Custom Entry continues to carry the operator instruction directly because no reusable Entry artifact exists for that runtime-only intent
- registered nested `.entries` content-source surfaces remain discoverable while schema-valid Markdown outside declared Entry surfaces cannot shadow qualified Entry material
- Core, Native and OpenAI Interop verification remains green

## Dependencies

- Current Core WHAT/WHERE Entry/Target projection contract.
- Qualified Native purpose Entries and interop-openai Target Entry material remain semantic truth.
- VS Code remains a presentation/input host that copies Core-projected transport text rather than owning Target semantics.

## Scope

- Core `project-workspace-carrier-entry` transport rendering and the Entry-surface eligibility regression discovered during verification
- no Entry/Target schema semantic changes
- no VS Code Target parser or provider hardcoding
- no migration of legacy Entry/Work/Process trees
- no remote mutation, release or publication

## UX Direction

The clipboard transport should behave as a qualified invocation, not a second copy of the selected Entry artifact. Detailed procedure, grounding material, capabilities, limitations and presentation guidance belong in the qualified material that the recipient is explicitly told to load after bootstrap.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: i4bMmqd3ZLGO7tn8L28ajWJ8hYKgclPIOs5ANSlq6N0