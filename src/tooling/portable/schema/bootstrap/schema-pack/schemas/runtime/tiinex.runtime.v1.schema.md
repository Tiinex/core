# Continuity Context

- Envelope Schema: [tiinex.root.v1](../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](../tiinex.root.v1.schema.md)
  - Created At: 2026-06-14 00:00:00
  - Trace: [tiinex.root.v1.schema.md](../tiinex.root.v1.schema.md)
  - Origin:
    - [relative](../tiinex.root.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/e739f7876950c3bdf08066886103690bddc7b706/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.runtime.v1](tiinex.runtime.v1.schema.md)
  - Created At: 2026-06-05 11:00:00
  - Summary: Schema for runtime-produced artifacts that preserve execution state, output, or results in a readable trace container.

---

# Runtime

- Status: maintained schema note

## Summary

This schema defines the broad runtime layer for artifacts whose main job is to
preserve observed execution state, output, or results rather than hand-authored
topic reasoning.

It is the generic base for future runtime families that need readable lineage
containers without collapsing immediately into host-specific, AI-specific, or
PoC-specific semantics.

## Schema Validation Contract

### Runtime Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.runtime.v1`

Rules

- `tiinex.runtime.v1` identifies artifacts whose main job is to preserve runtime-observed execution state, output, or results.
- A runtime artifact should stay readable without requiring a custom viewer.
- The schema owns the broad runtime layer, not one particular host, provider, or proof-of-concept implementation.
- Prose outside `Schema Validation Contract` may explain the schema but does not add validation rules.

### Runtime Body

Required Shape

- first body heading after the continuity envelope
- readable content that identifies what run, process, or runtime result is being preserved

Optional Sections

- Metadata
- Outcome
- Technical Details
- References
- Interpretation Notes

Rules

- A runtime artifact should begin with a human-readable title.
- A runtime artifact should contain enough body content that a later reader can tell what runtime event or result is being preserved.
- The body may contain structured lists, fenced payloads, or status summaries as long as the artifact remains legible in markdown.
- If the artifact is mainly curated evidence, design reasoning, or governance state rather than runtime state, another schema should own it.

### Runtime Semantics

Allowed Shapes

- status snapshot
- execution export
- bounded result summary
- readable machine payload
- runtime evidence package

Rules

- A runtime artifact should make clear whether it is preserving active execution state, a completed result, or a diagnostic snapshot.
- A runtime artifact should preserve enough context that a later reader can interpret the preserved output without guessing the runtime situation.
- When the artifact contains machine-shaped payloads, the surrounding prose should still tell the reader what the payload represents.
- Host-specific runtime families may extend this schema with narrower semantics instead of redefining the broad runtime layer from scratch.

### Runtime Envelope Companions

Optional Fields

- `Current -> Summary`
- `Current -> Why`
- `Current -> Authors`
- `Current -> Origin`

Rules

- Runtime artifacts may carry light current-side metadata when it helps a reader orient quickly.
- Runtime artifacts should declare parent signal when they continue, narrow, or reinterpret an earlier runtime artifact.
- Envelope metadata should orient the reader, not replace the runtime body itself.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-<runtime-slug>.trace.md`

Rules

- Runtime artifacts should keep the lineage label first.
- The optional slug should identify the preserved runtime slice rather than a low-signal transport detail.
- Runtime artifacts should prefer short human-readable slugs.
- Runtime artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.runtime.v1` for broad runtime-owned artifacts that should remain independent of a specific machine or AI runtime family.
- Do not use `tiinex.runtime.v1` for ordinary topic, task, decision, pointer, or evidence artifacts.
- If the artifact is specifically about machine-protocol or machine-state runtime surfaces, `tiinex.machine.runtime.v1` is usually the better fit.
- If the artifact is specifically about model, assistant, or tool-mediated AI runtime behavior, `tiinex.ai.runtime.v1` is usually the better fit.

## Minimal Example

```md
# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.runtime.v1
  - Created At: 2026-06-05 11:00:00
  - Summary: Runtime snapshot for a bounded export run.

---

# Export Runtime Snapshot

## Metadata

- Runtime Family: generic export
- Status: completed

## Outcome

- Preserved Result: one bounded runtime summary block

## Technical Details

- Notes: the artifact keeps enough runtime context for later interpretation
```

## Validation-Friendly Shape

Keep this maintained schema note in the exact section order already used here:
`Summary`, `Schema Validation Contract`, `Minimal Example`,
`Validation-Friendly Shape`, and `Interpretation Notes`.

Maintain the section headings exactly in this schema note. Free markdown inside
those sections is allowed, but adding undeclared new section headings should be
treated as schema drift.

## Interpretation Notes

- this schema is intentionally broad so narrower runtime families can extend it cleanly
- the schema should describe readable runtime preservation, not one temporary PoC surface
- later runtime families may add stronger local structure when the generic runtime layer is too weak

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.root.v1.schema.md](https://github.com/Tiinex/docs/blob/e739f7876950c3bdf08066886103690bddc7b706/.topics/.schemas/tiinex.root.v1.schema.md)
  - Value: BFWYft1v0Ue0gUoO236DGScvnixS7_MIEwO6mhJhkNw

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: hzROFN7xQRZUwU_5aLKLar8gKSHEKGFGUjiOhMEfH_A