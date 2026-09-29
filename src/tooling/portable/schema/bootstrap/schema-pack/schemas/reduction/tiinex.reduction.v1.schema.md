# Continuity Context

- Envelope Schema: [tiinex.root.v1](../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](../tiinex.root.v1.schema.md)
  - Created At: 2026-06-14 00:00:00
  - Trace: [tiinex.root.v1.schema.md](../tiinex.root.v1.schema.md)
  - Origin:
    - [relative](../tiinex.root.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/13991b5a13ab911ed9abd63646f92c8a9362ea01/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.reduction.v1](tiinex.reduction.v1.schema.md)
  - Created At: 2026-06-14 00:00:00
  - Summary: Schema for observable reduction artifacts that preserve carry-forward state, loss, and uncertainty.

---

# Reduction

- Status: maintained schema note

## Summary

This schema defines artifacts whose main job is to preserve a bounded
carry-forward state produced from fuller source material, while making the
reduction itself observable.

It is for context reduction, lineage reduction, summary consolidation, or other
semantic narrowing where later work needs to know what survived, what was lost
or degraded, what remains uncertain, and what now carries forward.

Source Context may itself identify one or more prior qualified Reduction
artifacts as immediate source material. Hierarchical Reduction remains a series
of independently qualified reduction events: each layer preserves immediate
source identity, its own carry-forward boundary, unresolved inherited
loss/uncertainty that still matters, and deterministic navigation toward fuller
immutable material when recoverability is claimed.

Conditional destructive-lineage eligibility is not part of ordinary Reduction
artifact qualification. Its maintained companion contract is
[`tiinex-reduction-destructive-lineage-eligibility-v1`](../../.validators/tiinex-reduction-destructive-lineage-eligibility-v1.validator.md).

## Schema Validation Contract

### Reduction Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.reduction.v1`

Rules

- `tiinex.reduction.v1` identifies artifacts centered on an observable reduction event.
- A reduction artifact should explain the fuller source or context being reduced.
- A reduction artifact should expose the carry-forward state that later work is expected to rely on.
- A reduction artifact should expose loss, degradation, uncertainty, or fidelity limits when those are present.
- A reduction artifact may be human-authored, AI-assisted, runtime-produced, or mixed.
- A reduction artifact may reduce one or more prior qualified Reductions when `Source Context` explicitly identifies those immediate sources.
- Physical repository/workspace placement, filenames, chronology, or summary resemblance do not establish Reduction source identity.
- Qualification of a Reduction establishes only its declared reduction/carry-forward event; it does not establish Task completion, authoritative re-test PASS, closure, destructive-lineage eligibility, deletion authorization, or release readiness.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Reduction Body

Required Shape

- first body heading after the continuity envelope
- `## Source Context` section
- `## Carry-Forward State` section
- `## Loss And Uncertainty` section
- `## Validation` section

Optional Sections

- Reduction Method
- Retained Signals
- Dropped Signals
- Degraded Signals
- Human Review
- Evidence Basis
- Linked Artifacts
- Next Artifacts

Rules

- A reduction artifact should begin with a human-readable title.
- `Source Context` should identify the material, lineage range, conversation, runtime state, evidence bundle, prior qualified Reduction artifacts, or other fuller context being reduced.
- When prior Reductions are immediate sources, `Source Context` should preserve explicit readable identities/references for those exact source artifacts; location or naming does not substitute for a source edge.
- `Carry-Forward State` should state the bounded state that later work may rely on. A downstream layer may consolidate prior carry-forward state but must not promote upstream omitted or uncertain material into retained fact.
- `Loss And Uncertainty` should state what was omitted, compressed, degraded, or left uncertain. In hierarchical composition it should preserve every upstream unresolved/material loss that can still affect the downstream claimed state and separately identify new loss introduced by the current layer.
- `Validation` should state how the reduction was checked, accepted, corrected, or limited. Validation is layer-scoped: a qualified downstream Reduction does not silently validate an unqualified immediate source or erase that source's validation boundary.
- The body should make the reduction readable without requiring access to the entire source context.
- When a source artifact, transcript, evidence slice, or runtime export grounds the reduction, the artifact should prefer explicit readable target references.
- Follow-up sections must not replace the carry-forward state itself.
- If the artifact is mainly preserving raw supporting material, an evidence or runtime schema should own it instead.
- If the artifact mainly lands a governing choice rather than a reduced carry-forward state, a decision schema should own it instead.

### Hierarchical Composition And Recovery

Rules

- A Reduction may use one or more prior qualified Reductions as immediate source material without changing schema version or artifact kind.
- Each immediate source must be exactly identifiable qualified material. Filenames, directory placement, chronology, repository co-location, or summary resemblance do not establish the source relationship.
- Each Reduction layer remains independently qualified and owns only its declared carry-forward delta, loss/uncertainty, and validation boundary.
- Downstream carry-forward may consolidate upstream retained state, but downstream qualification must not silently revalidate an upstream Reduction or erase inherited unresolved/material loss that still affects the downstream claim.
- An upstream uncertainty may be retired only when qualified evidence explicitly resolves it.
- Recoverability means deterministic navigation or retrieval toward fuller immutable source material through explicit immediate-source identities. It does not mean lossy source content can be reconstructed from reduced bytes alone.
- Repository/workspace location is independent of semantic source scope. Hierarchical Reduction may cross qualified repositories/workspaces when explicit source identity and the recovery chain remain qualified.
- A domain-neutral hierarchy such as `event material -> daily Reduction -> monthly Reduction of daily Reductions -> yearly Reduction of monthly Reductions` is conforming when these rules hold.

### Destructive-Lineage Eligibility Companion

Rules

- Ordinary `tiinex.reduction.v1` qualification never requires a destructive-lineage receipt and never authorizes destructive apply.
- When a proposed destructive change would make current semantic material disappear, the separate maintained validation method [`tiinex-reduction-destructive-lineage-eligibility-v1`](../../.validators/tiinex-reduction-destructive-lineage-eligibility-v1.validator.md) owns the conditional pre-delete eligibility semantics.
- That companion binds exact Reduction bytes, exact proof-relevant repository/workspace snapshots, the exact candidate destructive set, qualified currentness/operative-state evidence, immutable source/Parent-closure evidence, and exact contract identity.
- Any state other than the companion method's exact `eligible` result forbids destructive apply; `eligible` is necessary qualification evidence only and is not permission or authorization.
- Historical Reduction artifacts remain ordinary Reduction evidence even when no destructive-lineage receipt exists.

### Reduction Semantics

Allowed Shapes

- human-authored consolidation
- AI-proposed carry-forward summary
- reviewed compaction checkpoint
- lineage reduction
- source-to-summary reduction
- runtime context compaction report

Rules

- A reduction artifact should make clear whether the reduction was proposed, accepted, corrected, rejected, or merely recorded.
- A reduction artifact should make clear whether the original source remains recoverable.
- When recoverability is claimed across hierarchical Reduction, the artifact should expose enough explicit source identity for deterministic navigation toward fuller immutable material.
- A reduction artifact should not present omitted or uncertain material as retained fact.
- A reduction artifact should not hide material impact behind a generic summary.
- When the reduction is created because of context pressure, compaction, or portability needs, the artifact should say so explicitly.
- When human review is absent, the artifact should not imply human acceptance.

### Reduction Envelope Companions

Optional Fields

- `Current -> Why`
- `Current -> Summary`
- `Current -> Authors`
- `Current -> Origin`
- parent signal when the reduction continues, narrows, or summarizes an earlier artifact

Rules

- Reduction artifacts may carry light current-side metadata when it helps a reader orient quickly.
- Parent signal should be used when a reduction continues or narrows an earlier local artifact.
- Envelope metadata should support, not replace, body-level source, carry-forward, and loss surfaces.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-<reduction-slug>.trace.md`

Rules

- Reduction artifacts should keep the lineage label first.
- The optional slug should describe the reduced scope or carry-forward purpose.
- Reduction artifacts should prefer short human-readable slugs.
- Reduction artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.reduction.v1` when the artifact's main job is to make a reduction observable and carry a bounded state forward.
- Do not use `tiinex.reduction.v1` for broad topic discussion without a concrete carry-forward state.
- Do not use `tiinex.reduction.v1` for raw transcripts, memory dumps, or opaque runtime exports.
- Do not use `tiinex.reduction.v1` merely because an artifact is short.
- Reduction is a provenance event when later work may depend on what survived the narrowing.
- Reduction source scope is explicit and semantic; physical placement does not manufacture ancestry, source identity, completion, ownership, or destructive authority.
- A valid Reduction artifact alone must not be interpreted as destructive-lineage eligibility or delete authorization.

## Minimal Example

```md
# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.reduction.v1
  - Created At: 2026-06-14 00:00:00
  - Summary: Reduction checkpoint for observable context compaction.

---

# Context Reduction Checkpoint

## Source Context

- Source: discussion thread and prior working notes about context compaction

## Carry-Forward State

- Hidden context reduction is treated as a drift boundary.
- Minimum observable reduction should expose what survived, what was lost, and what assumptions carry forward.

## Loss And Uncertainty

- Full transcript details are not reproduced here.
- Runtime behavior still requires validation against a concrete implementation.

## Validation

- Human reviewed and accepted this carry-forward state for the next leaf.
```

## Validation-Friendly Shape

Keep this maintained schema note in the exact section order already used here:
`Summary`, `Schema Validation Contract`, `Minimal Example`,
`Validation-Friendly Shape`, `Interpretation Notes`, and
`Artifact Creation Contract`.

Maintain the section headings exactly in this schema note. Free markdown inside
those sections is allowed, but adding undeclared new section headings should be
treated as schema drift.

## Interpretation Notes

- reduction is not the same as summarization only; the important signal is what is allowed to carry forward
- reduction should make loss and uncertainty visible rather than hiding them behind a fluent summary
- full source material may live elsewhere as transcript, evidence, runtime export, or other recoverable source
- reduction should stay usable even when the underlying source is large or expensive to inspect

## Artifact Creation Contract

### Prompt Fields

Required Fields

- version
- createTitle
- summaryPrompt
- summaryPlaceholder

Optional Fields

- whyPrompt
- whyPlaceholder

Rules

- The current reduction create surface uses version `1`.
- `createTitle` should label the create action as `Create Reduction`.
- `summaryPrompt` should ask for the reduction title.
- `summaryPlaceholder` should guide the user toward the context or source being reduced.
- `whyPrompt` and `whyPlaceholder` may be omitted when create flow does not ask for a why field.

### Template Body

Required Shape

- first heading uses `# {{summary}}`
- `## Source Context` section
- `## Carry-Forward State` section
- `## Loss And Uncertainty` section
- `## Validation` section

Rules

- Generated reduction artifacts should begin with the reduction title as the first body heading.
- `Source Context` should identify what is being reduced.
- `Carry-Forward State` should state what later work may rely on.
- `Loss And Uncertainty` should state omissions, degradation, or uncertainty.
- `Validation` should state human review, runtime validation, source checks, or explicit limits.
- Tools should preserve the same generated body shape even when they use a maintained built-in template.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.root.v1.schema.md](https://github.com/Tiinex/docs/blob/13991b5a13ab911ed9abd63646f92c8a9362ea01/.topics/.schemas/tiinex.root.v1.schema.md)
  - Value: d0LhwmUrm4hwThHdPE1MDyfxoI-pWgDksN4xGD8SAdI

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: IqhXRv_qclxEPJPTpGtVHYAjQvQPyA8d2oZFxO7XhEs