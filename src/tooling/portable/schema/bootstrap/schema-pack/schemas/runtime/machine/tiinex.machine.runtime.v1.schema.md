# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.runtime.v1](../tiinex.runtime.v1.schema.md)
  - Created At: 2026-06-05 11:00:00
  - Trace: [tiinex.runtime.v1.schema.md](../tiinex.runtime.v1.schema.md)
  - Origin:
    - [relative](../tiinex.runtime.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/e739f7876950c3bdf08066886103690bddc7b706/.topics/.schemas/runtime/tiinex.runtime.v1.schema.md)
- Current
  - Current Schema: [tiinex.machine.runtime.v1](tiinex.machine.runtime.v1.schema.md)
  - Created At: 2026-06-05 11:08:00
  - Summary: Schema for machine-runtime artifacts that preserve structured machine-produced execution state, protocol flow, or result packages.

---

# Machine Runtime

- Status: maintained schema note

## Summary

This schema narrows the generic runtime layer to artifacts whose signal is
primarily machine-produced state, protocol flow, execution ledger, or result
package rather than human-curated explanation.

It is meant to be a reusable base for future machine-runtime families and
should stay independent of any one local proof-of-concept runtime.

## Schema Validation Contract

### Machine Runtime Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.machine.runtime.v1`

Rules

- `tiinex.machine.runtime.v1` identifies artifacts centered on machine-produced runtime state or results.
- The schema should be used when the body is more structured, protocol-shaped, or state-heavy than ordinary prose runtime notes.
- The schema still expects a readable markdown container even when the preserved material is highly structured.

### Machine Runtime Body

Required Shape

- first body heading after the continuity envelope
- readable runtime framing plus at least one machine-shaped state, result, or protocol surface

Optional Sections

- Metadata
- State
- Outcome
- Protocol Details
- Technical Details

Rules

- A machine-runtime artifact should make clear what machine process or state the artifact preserves.
- The body may contain JSON, code fences, tables rendered as markdown, or structured ledgers.
- Machine-shaped payloads should be accompanied by enough readable framing that a later reader can tell what they mean.
- If the artifact mainly preserves assistant or model interaction semantics, `tiinex.ai.runtime.v1` is usually the better fit.

### Machine Runtime Semantics

Allowed Shapes

- protocol transcript
- execution ledger
- state snapshot
- structured result package
- machine-generated diagnostics

Rules

- A machine-runtime artifact should make clear whether it preserves state in progress, final state, or a diagnostic slice.
- When transport or protocol details materially affect interpretation, the artifact should expose them readably instead of hiding them behind opaque blobs.
- Machine-runtime extensions may add stronger local structure for a particular runtime family as long as they preserve this broader machine-runtime reading model.

### Machine Runtime Envelope Companions

Optional Fields

- `Current -> Summary`
- `Current -> Why`
- `Current -> Origin`
- parent signal when the artifact continues an earlier runtime or machine-runtime artifact

Rules

- Machine-runtime artifacts may carry light envelope metadata when it improves orientation.
- Parent signal should be used when a machine-runtime artifact refines or continues an earlier machine-facing result.
- Envelope metadata should not replace the readable framing of the machine-produced payload.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-<machine-slug>.trace.md`

Rules

- Machine-runtime artifacts should keep the lineage label first.
- The optional slug should reflect the machine runtime slice or protocol family.
- Machine-runtime artifacts should prefer stable human-readable slugs over transport-internal identifiers.

### Interpretation Boundaries

Rules

- Use `tiinex.machine.runtime.v1` when the artifact is primarily machine-produced runtime state, protocol flow, or result packaging.
- Do not use `tiinex.machine.runtime.v1` for ordinary topic, task, decision, pointer, or evidence artifacts.
- Do not use `tiinex.machine.runtime.v1` when the artifact's main job is to preserve specifically AI-runtime semantics such as request framing, model completion, or tool-mediated assistant behavior.

## Minimal Example

```md
# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.machine.runtime.v1
  - Created At: 2026-06-05 11:08:00
  - Summary: Structured machine-runtime snapshot for one bounded process.

---

# Machine Runtime Snapshot

## Metadata

- Runtime Family: protocol worker
- Status: completed

## State

- State Shape: one structured payload

## Outcome

- Interpretation: the machine process completed with one preserved result bundle
```

## Validation-Friendly Shape

Keep this maintained schema note in the exact section order already used here:
`Summary`, `Schema Validation Contract`, `Minimal Example`,
`Validation-Friendly Shape`, and `Interpretation Notes`.

Maintain the section headings exactly in this schema note. Free markdown inside
those sections is allowed, but adding undeclared new section headings should be
treated as schema drift.

## Interpretation Notes

- this schema is the machine-facing extension point above the broad runtime layer
- AI-specific runtime families should extend this layer only when their semantics materially depend on machine-shaped runtime structure
- host-specific or PoC-specific machine runtimes should extend this schema instead of redefining the generic machine-runtime base

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.runtime.v1.schema.md](https://github.com/Tiinex/docs/blob/e739f7876950c3bdf08066886103690bddc7b706/.topics/.schemas/runtime/tiinex.runtime.v1.schema.md)
  - Value: s6O-r1EbXQNPlc_aRFDuWqFn-Vu88QXSkUrgVt41jXA

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: ztsCV74KeKOvbvBjh7siMEcXBhFCUfJ-2q_7s_n3ZMI