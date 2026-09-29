# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
  - Created At: 2026-06-14 00:00:00
  - Trace: [tiinex.root.v1.schema.md](../../tiinex.root.v1.schema.md)
  - Origin:
    - [relative](../../tiinex.root.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/00adbcc5b0319410cf16752a54dcbf4813173040/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.pointer.v1](tiinex.pointer.v1.schema.md)
  - Created At: 2026-06-04 19:05:00
  - Summary: Schema for thin redirect and destination-list lineage artifacts.

---

# Pointer

- Status: maintained schema note

## Summary

This schema defines artifacts whose main job is to point a reader toward an
upstream trace, origin, or small set of destinations without duplicating the
full content of those targets.

A pointer artifact should stay thin enough that the next hop remains obvious.

## Schema Validation Contract

### Pointer Role

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.pointer.v1`

Rules

- `tiinex.pointer.v1` identifies artifacts whose main role is redirect, anchoring, or indexing rather than preserving the full downstream material.
- A pointer artifact may point through declared parent continuity, declared current origin, a body destination list, or a combination of those surfaces.
- The body should help the reader understand what the pointer is for and where to go next.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Pointer Modes

Allowed Shapes

- parent-continuation pointer
- origin-anchor pointer
- destination-list pointer
- mixed pointer using more than one of the above

Rules

- A parent-continuation pointer uses `Parent` when the pointer continues a prior local lineage artifact.
- An origin-anchor pointer uses `Current -> Origin` when the anchor lives outside the local parent chain or when provenance must be preserved independently of parent continuity.
- A destination-list pointer may expose multiple current targets in the body when one thin pointer needs to index several next hops.
- `Parent` means continuity lineage and must not be treated as interchangeable with `Origin`.
- `Origin` means grounding or provenance source and must not silently replace `Trace`.
- A destination list does not by itself create parent continuity.
- Mixed pointers should keep each role readable instead of blurring parent, origin, and destination semantics together.

### Pointer Body

Required Shape

- first body heading after the continuity envelope
- readable prose that explains what the pointer points toward

Optional Sections

- Current Read
- Destinations
- Interpretation Notes
- Next Artifacts
- Next Steps

Rules

- A pointer artifact should begin with a human-readable title.
- A pointer artifact should contain enough prose to explain why this pointer exists.
- A pointer artifact must expose at least one machine-detectable target signal through `Parent -> Trace`, `Current -> Origin`, or a `Destinations` list.
- A pointer artifact that lacks all declared target-signal surfaces is invalid.
- Pointer artifacts should stay thinner than the artifacts they point toward.
- Pointer artifacts should prefer naming the next hop over re-explaining the full target content.
- A target signal may point to a trace artifact, another document, a binary asset, or another explicit external target; machine-detectable does not require deep traversal beyond the declared reference.
- Multiple target signals may coexist when that improves navigation without blurring parent, origin, and destination roles.
- Forward-looking sections must not replace the continuity envelope's parent relation.
- If the artifact becomes a substantial standalone topic, evidence bundle, or decision record, another schema should own it instead.

### Destination List

Allowed Shapes

- markdown link entry
- labeled markdown link entry
- labeled relative path entry
- labeled absolute URL entry
- labeled attachment or asset reference
- bounded plain-text target reference when the target cannot be expressed as a markdown link

Optional Sections

- Destinations

Required When

- the pointer is intended to expose multiple active targets in one artifact

Entry Shape

- hyphen bullet list

Rules

- Each destination entry should identify one readable target.
- Each destination entry should include enough naming or linking information that the next hop can be found without guesswork.
- Each destination entry should include at least one explicit target reference such as a markdown link, relative path, absolute URL, or attachment/asset reference.
- Pure prose without an explicit target reference does not count as a machine-detectable destination signal.
- Destination entries should stay concise.
- Destination entries must not be used to smuggle alternate parent claims into the body.
- When one destination is clearly the main current hop, the prose should say so rather than making every destination sound equally primary.

### Pointer Envelope Companions

Optional Fields

- `Current -> Why`
- `Current -> Summary`
- `Current -> Authors`
- `Current -> Type`
- `Current -> Origin`

Rules

- Pointer artifacts may carry light current-side metadata when it helps the reader orient quickly.
- Pointer artifacts should declare parent signal when they continue an earlier local pointer or another local lineage artifact.
- Pointer artifacts should declare current origin when provenance matters and the target is not fully recoverable from local parent continuity alone.
- Pointer artifacts may use the normal Tiinex `Origin` shape even when the grounded target is not markdown or not deeply traversable.
- When an origin target may move, be renamed, or otherwise drift, a commit-pinned `browse + git` origin candidate should be preferred when available so recovery remains durable.
- If multiple current origin candidates are present, they should refer to the same grounded upstream target rather than mixing unrelated targets.
- Pointer artifacts should avoid turning envelope metadata into the main body content.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-<pointer-slug>.trace.md`

Rules

- Pointer artifacts should keep the lineage label first.
- The optional slug should describe the branch tip, target set, or redirect purpose.
- Pointer artifacts should prefer short human-readable slugs.
- Pointer artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.pointer.v1` when the artifact is mainly helping the reader reach another artifact, source, or bounded list of targets.
- Pointer artifacts are a good fit for cross-repo anchors, latest-leaf redirects, and small destination indexes.
- Do not use `tiinex.pointer.v1` when the artifact's main job is to preserve evidence, hold a working topic, or land a decision.
- Do not use `tiinex.pointer.v1` as a generic holding file for material that has not been structured yet.

## Minimal Example

```md
# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.pointer.v1
  - Created At: 2026-06-04 00:00:00
  - Summary: Pointer to the latest proof traces.
  - Origin:
    - [browse + git](https://github.com/Tiinex/docs/blob/<commit>/.topics/proof/chatgpt/001-1.trace.md)

---

# Latest Proof Pointer

This pointer keeps one thin hop toward the current proof material.

## Destinations

- ChatGPT proof trace: https://github.com/Tiinex/docs/blob/<commit>/.topics/proof/chatgpt/001-1.trace.md
- VS Code proof trace: https://github.com/Tiinex/docs/blob/<commit>/.topics/proof/vscode-copilot/001-1.trace.md
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

- a pointer should reduce search cost rather than add a second full artifact to read
- parent continuity, current origin, and body destinations carry different meanings and should stay separate
- destination lists are for readable next hops, not for replacing provenance
- thin does not mean context-free; the reader should still understand why this pointer exists

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
- destinationsPrompt
- destinationsPlaceholder

Rules

- The current pointer create surface uses version `1`.
- `createTitle` should label the create action as `Create Pointer`.
- `summaryPrompt` should ask for the pointer title.
- `summaryPlaceholder` should guide the user toward the target or redirect purpose.
- `whyPrompt` and `whyPlaceholder` may be omitted when create flow does not ask for a why field.
- `destinationsPrompt` and `destinationsPlaceholder` may be omitted when create flow does not scaffold a destination list.

### Template Body

Required Shape

- first heading uses `# {{summary}}`
- summary sentence placeholder below the title
- `## Current Read` section
- `## Next Artifacts` section

Optional Sections

- `## Destinations`
- `## Interpretation Notes`

Rules

- Generated pointer artifacts should begin with the pointer title as the first body heading.
- The generated body should include one orienting sentence before the first named section.
- `Current Read` should explain what the pointer currently points toward.
- `Destinations`, when present, should stay short and directly navigable.
- `Next Artifacts` should leave room for concrete follow-up redirects or target updates.
- Tools should preserve the same generated body shape even when they use a maintained built-in template.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.root.v1.schema.md](https://github.com/Tiinex/docs/blob/00adbcc5b0319410cf16752a54dcbf4813173040/.topics/.schemas/tiinex.root.v1.schema.md)
  - Value: BFWYft1v0Ue0gUoO236DGScvnixS7_MIEwO6mhJhkNw

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: B-m2NGoERIjDNvTvzTsUgBgjUyTfgpvRrq4hrXVgbpA