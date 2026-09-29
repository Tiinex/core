# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.machine.runtime.v1](../machine/tiinex.machine.runtime.v1.schema.md)
  - Created At: 2026-06-05 11:08:00
  - Trace: [tiinex.machine.runtime.v1.schema.md](../machine/tiinex.machine.runtime.v1.schema.md)
  - Origin:
    - [relative](../machine/tiinex.machine.runtime.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/e739f7876950c3bdf08066886103690bddc7b706/.topics/.schemas/runtime/machine/tiinex.machine.runtime.v1.schema.md)
- Current
  - Current Schema: [tiinex.ai.runtime.v1](tiinex.ai.runtime.v1.schema.md)
  - Created At: 2026-06-05 11:16:00
  - Summary: Schema for AI-runtime artifacts that preserve request framing, model/runtime behavior, tool use, and outcome signal without host-specific ownership.

---

# AI Runtime

- Status: maintained schema note

## Summary

This schema narrows the machine-runtime layer to artifacts whose main signal is
AI-runtime behavior such as request framing, model or assistant output,
tool-mediated execution, and outcome interpretation.

It is meant to be the generic AI-runtime base that host-specific runtime traces
extend later, rather than a description of the current ai-provenance PoC.

## Schema Validation Contract

### AI Runtime Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.ai.runtime.v1`

Rules

- `tiinex.ai.runtime.v1` identifies artifacts centered on AI-runtime execution or results.
- The schema should be used when request framing, model or assistant behavior, tool use, or AI-runtime outcome interpretation materially shape the preserved artifact.
- The schema should stay host-agnostic and should not assume one local runtime implementation.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### AI Runtime Body

Required Shape

- first body heading after the continuity envelope
- readable framing for the bounded AI-runtime artifact plus at least one AI-runtime outcome surface

Optional Sections

- Metadata
- Request Contract Summary
- Outcome
- Tool Use
- Technical Details
- Evidence Basis

Rules

- An AI-runtime artifact should make clear what bounded AI run, response, or assistant/runtime result is being preserved.
- The body should make clear what user, system, or request framing materially shaped the preserved result when that signal is known.
- The body may contain structured payloads, but a later reader should still be able to tell what happened without reconstructing the whole run from raw machine state alone.
- Host-specific runtime families may extend this schema with stronger local structure when they need narrower semantics.

### AI Runtime Semantics

Allowed Shapes

- bounded model response export
- assistant-runtime result summary
- tool-mediated AI run summary
- AI-runtime diagnostic snapshot
- structured AI-runtime evidence package

Rules

- An AI-runtime artifact should make clear whether the preserved material is a request, a response, a run summary, a failure state, or a later interpretation of the run.
- When tool use materially shaped the result, the artifact should say so explicitly rather than leaving the interaction implicit.
- When completion or stop-state matters, the artifact should expose that outcome signal readably.
- AI-runtime extensions should add local structure without collapsing the generic AI-runtime layer into one product or PoC.

### AI Runtime Envelope Companions

Optional Fields

- `Current -> Summary`
- `Current -> Why`
- `Current -> Origin`
- parent signal when the artifact continues, narrows, or interprets an earlier AI-runtime artifact

Rules

- AI-runtime artifacts may carry light envelope metadata when it improves orientation.
- Parent signal should be used when one AI-runtime artifact continues an earlier result or reframes an earlier run.
- Envelope metadata should support, not replace, readable runtime interpretation in the body.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-<ai-runtime-slug>.trace.md`

Rules

- AI-runtime artifacts should keep the lineage label first.
- The optional slug should identify the bounded AI-runtime slice or role family.
- AI-runtime artifacts should prefer stable human-readable slugs over transport or vendor-only identifiers.
- AI-runtime artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.ai.runtime.v1` when the artifact is mainly about AI-runtime request framing, model or assistant behavior, tool use, or outcome interpretation.
- Do not use `tiinex.ai.runtime.v1` for broad machine-runtime artifacts whose semantics are not specifically AI-shaped.
- Do not use `tiinex.ai.runtime.v1` for ordinary topic, task, decision, pointer, or evidence artifacts.
- Host-specific AI runtime families should extend this schema rather than treating it as the final local runtime shape.

## Minimal Example

```md
# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.ai.runtime.v1
  - Created At: 2026-06-05 11:16:00
  - Summary: Bounded AI-runtime outcome summary for one assisted run.

---

# Assisted Run Summary

## Metadata

- Runtime Family: generic ai runtime
- Status: completed

## Request Contract Summary

- User Input: inspect the preserved runtime slice

## Outcome

- Completion Claim: partial
- Final Summary: one bounded AI-runtime result was preserved

## Tool Use

- Tool Activity: no external tools were required in this minimal example
```

## Validation-Friendly Shape

Keep this maintained schema note in the exact section order already used here:
`Summary`, `Schema Validation Contract`, `Minimal Example`,
`Validation-Friendly Shape`, and `Interpretation Notes`.

Maintain the section headings exactly in this schema note. Free markdown inside
those sections is allowed, but adding undeclared new section headings should be
treated as schema drift.

## Interpretation Notes

- this schema is the generic AI-runtime extension point above the machine-runtime layer
- host-specific AI-runtime schemas should extend this note rather than using PoC traces to define the base contract
- the schema should stay broad enough to support future runtimes that are not tied to ai-provenance

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.machine.runtime.v1.schema.md](https://github.com/Tiinex/docs/blob/e739f7876950c3bdf08066886103690bddc7b706/.topics/.schemas/runtime/machine/tiinex.machine.runtime.v1.schema.md)
  - Value: CpT0UmqgFwz7JfEcTm9WBEWDYm6v_0p32NsBLYkLN4U

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: _i69_q9UJF8ku0nO8LhEbv0FSbdT7cQ-MaIySe2Dry0