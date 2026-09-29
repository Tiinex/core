# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-18 19:28:38
  - Trace: [027-compiled-schema-lineage-source-authority-coherence.trace.md](027-compiled-schema-lineage-source-authority-coherence.trace.md)
  - Origin:
    - [relative](027-compiled-schema-lineage-source-authority-coherence.trace.md)
- Current
  - Current Schema: [tiinex.discovery.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/discovery/tiinex.discovery.v1.schema.md)
  - Created At: 2026-09-29 11:57:00
  - Authors: Anchor
  - Why: Separate human-facing schema-reference inconsistency from exact source-binding integrity and the existing Task 027 compiled-parent authority contradiction before any Core repair.
  - Summary: Discover why Evidence Current Schema renders as a plain id and audit registered immutable schema-source bindings for source tuple drift without weakening inherited validation authority.
  - Status: ready/local

---

# Evidence Schema Reference And Registry Source-Binding Drift Discovery

## Discovery Intent

Determine why portable `author --schema tiinex.evidence.v1` renders `Current Schema` as a plain schema id while adjacent Envelope/Parent schema references render immutable permalinks, and determine whether the cause is Evidence semantics, schema-reference rendering, publication/reference authority, or stale Core registry source bindings.

## Discovery Field

- Field: Core registered schema source/reference authority used by common artifact authoring.
- In Scope: `tiinex.evidence.v1`, comparison schemas with qualified Current links, schema registry bindings, runtime projections, schema-reference authority qualification, compiled validation-lineage authority, immutable Docs source tuples, and renderer behavior.
- Out Of Scope: changing Docs schema semantics, rewriting historical artifacts, weakening compiled inheritance fail-closed validation, remote mutation, or implementing a repair before Anchor/Sigma review.

## Discovery Method

- Reproduce the current creation contract for Evidence and compare it with Task, Handoff and Reduction through the same `buildArtifactCreationContract` and schema-reference authority path.
- Inspect Evidence binding metadata, bundled runtime projection, source qualification, provider qualification, material identity and validation-lineage authority separately.
- Verify declared `sourceCommit + sourcePath + sourceBlobSha` tuples against read-only immutable `Tiinex/docs` Git trees rather than trusting Core binding metadata alone.
- Audit the registered Docs-backed schema bindings for the same source-tuple drift class to establish blast radius.
- Preserve the existing Task 027 distinction between structurally qualified leaf schema material and contradictory inherited validation-lineage authority.

## Discovery Boundaries

- A visible GitHub URL is not exact schema-reference authority unless the declared immutable source tuple identifies the same bytes as the semantic material used by Core.
- `validationLineageAuthority` contradiction must remain fail-closed and must not be suppressed merely to obtain prettier Current Schema rendering.
- A schema can have qualified leaf/source identity while inherited validation authority remains contradictory; these are separate authority questions.
- No Core implementation or binding file is changed by this Discovery.
- GitHub is read-only evidence only.

## Discovery Outcome

### Immediate Rendering Cause

`tiinex.evidence.v1` currently binds `publicationState: accepted-local-unpublished`, uses snapshot completeness `exact-axiom-canonical-unpublished-bounded-workspace-contract`, and does not declare `schemaReferencePublicationState: published-immutable-canonical`.

`schemaReferenceAuthorityFromBinding()` therefore suppresses its remote targets and produces `targetAuthority: schema-id-only`, `resolutionState: unavailable`, and an empty `preferredTarget`. The shared renderer faithfully emits plain `Current Schema: tiinex.evidence.v1`. Pilot did not author or improvise that line.

Task/Handoff use exact canonical bindings and therefore resolve their Current schema references to qualified commit-pinned Docs targets. Root and Reduction demonstrate the separate Core mechanism `schemaReferencePublicationState: published-immutable-canonical`, which is intentionally capable of granting immutable reference-publication authority independently from lifecycle/runtime publication state when exact material identity qualifies.

### Evidence Leaf Source State

Evidence's bundled source is structurally qualified: semantic material identity is qualified and GitHub provider shape qualification is qualified. Its exact local runtime material declares SHA-256 `b6c06684af1d5fa181ebf37f04ffb0c226ef5b4f46fccd53b5ec12676ab8c551`, source blob `e3d135424ae2eba30d26ab8b1a48c7d8cdd0e639`, 12,180 bytes, and source commit `e713557f8be630967571d11a73f9ecd05ae329ce`.

However, the actual immutable Docs tree at that declared commit contains `.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md` as Git blob `430367bb717d93e396a50c993dc011f8d129bf54`, size 11,464 bytes. The binding's claimed blob is therefore not the file at its claimed immutable permalink.

The Evidence file was later changed in Docs; the current/latest observed file revision is larger and closer to the bundled projection, but this Discovery does not infer byte identity from similarity or chronology. The current Core source tuple is mechanically stale/missbound and must be rebound from one exact source revision before immutable reference authority is enabled.

### Separate Evidence Inheritance Contradiction

Evidence's compiled validation lineage remains contradictory for a different reason. The Evidence source declares Preservation Parent authority at Docs commit `089427470f04336dfcc100c4dcf6289d51bf0291`, while the compiled runtime inheritance uses Preservation material attributed to `e713557f8be630967571d11a73f9ecd05ae329ce`.

Task 027 already correctly requires this class to remain fail-closed. Existing qualification Evidence explicitly establishes that a leaf schema source may remain structurally qualified for authoring/inspection while `validationLineageAuthority` remains contradictory. Therefore fixing Evidence Current-schema reference authority must not mark this inherited validation chain exact or weaken Task 027 regressions.

### Registry-Wide Source-Binding Check

A read-only check of the registered Docs-backed bindings against their own declared immutable Git trees found 18 exact tuples and 6 drifted/missing tuples.

Drifted/missing bindings observed:

- `tiinex.root.v1`: declared blob does not match the file at declared Docs commit/path.
- `tiinex.party.role.v1`: declared blob does not match the file at declared Docs commit/path.
- `tiinex.decision.v1`: declared blob does not match the file at declared Docs commit/path.
- `tiinex.evidence.v1`: declared blob does not match the file at declared Docs commit/path.
- `tiinex.workspace.representation.v1`: declared source path is absent at its declared Docs commit.
- `tiinex.validation.finding.v1`: declared blob does not match the file at declared Docs commit/path.

This is therefore not an Evidence-only renderer defect. It is a registry source-binding integrity debt exposed by Evidence's truthful plain-id fallback.

Root is especially important: it already declares `schemaReferencePublicationState: published-immutable-canonical`, so Core currently projects a qualified Root permalink even though the registry's declared Root blob does not match the file at that immutable commit/path. This proves that local binding/runtime self-consistency alone is insufficient protection against stale external source tuples.

### Minimal Correct Repair Direction

1. Rebind/regenerate each drifted binding from one exact Docs source revision so `sourceCommit`, `sourcePath`, `sourceBlobSha`, checksum/source bytes and runtime projection describe one identical source artifact.
2. For canonical published schemas such as Evidence, explicitly qualify immutable schema-reference publication authority only after that exact tuple is established. Evidence should then receive `schemaReferencePublicationState: published-immutable-canonical` (or equivalent qualified registry outcome), allowing common authoring to render the exact Current Schema permalink automatically.
3. Keep Evidence -> Preservation compiled validation-lineage contradiction independently fail-closed until its declared Parent authority is separately reconciled under Task 027 semantics.
4. Add a registry-wide source-binding qualification regression so a binding cannot claim an immutable external target when its declared blob/path/commit does not match the source material used to generate the runtime projection.
5. Add an Evidence authoring regression asserting that once exact reference authority is qualified, `Current Schema` renders the exact commit-pinned Evidence permalink through the shared renderer; no Evidence/Pilot-specific rendering rule should be introduced.

## Interpretation Limits

- This Discovery does not establish which newer Docs Evidence revision should become the canonical Core binding; that must be selected from exact source bytes, not chronology.
- It does not authorize replacing child-declared historical Preservation authority with a newer Parent merely because the leaf Evidence binding is repaired.
- It does not claim plain schema ids are invalid in general; they remain the truthful fallback when exact reference authority is unavailable.
- It does establish that the observed Pilot artifact is not the source of the rendering difference, and that Evidence's current plain-id result is downstream of stale/unpublished binding authority rather than an Evidence body-format mistake.
- It also establishes that a repair limited to manually adding a permalink or toggling publication metadata without correcting exact source tuples would be unsafe.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [027-compiled-schema-lineage-source-authority-coherence.trace.md](027-compiled-schema-lineage-source-authority-coherence.trace.md)
  - Value: xlXmVgz2680XcmIIem56VGQwUuTgFSZZMCvmQEJ4zGQ

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: S6aAofRKvs3okG1XD4s6LKjCrlc-VhkJuhKn78mVQAw