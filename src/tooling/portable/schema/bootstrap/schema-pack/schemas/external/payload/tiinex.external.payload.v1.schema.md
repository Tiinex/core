# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
  - Created At: 2026-06-14 00:00:00
  - Trace: [tiinex.root.v1.schema.md](../../tiinex.root.v1.schema.md)
  - Origin:
    - [relative](../../tiinex.root.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/2a40646640f7468bcd250df6988b69e9f047f1bb/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.external.payload.v1](tiinex.external.payload.v1.schema.md)
  - Created At: 2026-06-26 00:00:00
  - Summary: Schema for readable references to large, external, binary, private, or machine-shaped payloads with explicit access and integrity context.

---

# External Payload

- Status: maintained schema note

## Summary

This schema defines payload-reference artifacts whose main job is to preserve a
readable description of an external, large, binary, private, generated, or
machine-shaped payload that should not be fully embedded in markdown.

It exists so Tiinex can reference datasets, lab files, archives, model outputs,
images, audio, simulator dumps, circuit packages, state vectors, zip exports, or
other payloads while keeping markdown artifacts readable and recovery-oriented.

## Schema Validation Contract

### External Payload Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.external.payload.v1`

Rules

- `tiinex.external.payload.v1` identifies artifacts whose main job is to preserve a readable reference to an external or non-inline payload.
- An external payload artifact should expose what the payload is, where or how it can be recovered, what integrity information is known, and what access boundary applies.
- An external payload artifact must not imply that the payload supports a claim unless evidence or interpretation context states that support.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### External Payload Body

Required Shape

- first body heading after the continuity envelope
- `## Payload Identity` section
- `## Payload Location` section
- `## Integrity Reference` section
- `## Access Boundary` section
- `## Interpretation Limits` section

Optional Sections

- Payload Description
- Provenance
- Retention
- Evidence Basis
- Related Artifacts
- Privacy Boundary
- References

Rules

- An external payload artifact should begin with a human-readable payload title.
- `Payload Identity` must describe what payload is being referenced.
- `Payload Location` must state where the payload can be found or how it is bounded when it cannot be directly linked.
- `Integrity Reference` must state the known integrity state or explicitly say that integrity is unavailable, partial, or external.
- `Access Boundary` must state access limits, privacy limits, or recovery limits known to the artifact.
- `Interpretation Limits` must state how the payload reference should be read and what it does not prove.

### Payload Identity

Required Fields

- Payload Label
- Payload Kind

Optional Fields

- Media Type
- Format
- Byte Size
- Created At
- Producer
- Payload Role

Rules

- `Payload Label` should be stable enough for later artifacts to reference.
- `Payload Kind` should identify the broad payload class, such as dataset, archive, lab file, image, audio, video, model output, simulator dump, circuit package, state vector, zip export, or binary attachment.
- `Media Type` or `Format` should be present when known.
- `Payload Role` may state whether the payload is input, output, evidence material, runtime state, derived data, or another bounded role.

### Payload Location

Required Fields

- Location
- Location Type

Optional Fields

- Access Method
- Repository
- Commit Or Version
- Storage Boundary
- Retention
- Recovery Notes

Allowed Shapes

- `Location`: markdown link
- `Location`: relative path
- `Location`: external URL
- `Location`: repository path
- `Location`: content-addressed identifier
- `Location`: private storage descriptor
- `Location`: offline storage descriptor
- `Location`: bounded textual descriptor
- `Location Type`: local
- `Location Type`: repository-backed
- `Location Type`: external-url
- `Location Type`: content-addressed
- `Location Type`: private-storage
- `Location Type`: offline-storage
- `Location Type`: descriptor-only

Rules

- `Location` should be as durable and recoverable as the available context allows.
- `Location Type` must use one of the declared `Location Type` shapes so tools do not invent local values.
- `Location Type` should state whether the location is local, repository-backed, external-url, content-addressed, private-storage, offline-storage, or descriptor-only.
- Commit-pinned or content-addressed locations should be preferred when available.
- Descriptor-only locations are allowed when the payload is private, unavailable, offline, or intentionally not linkable.

### Integrity Reference

Required Fields

- Integrity Status

Optional Fields

- Integrity Method
- Integrity Value
- Integrity Target
- Validation Method
- Canonicalization
- Known Gaps

Allowed Shapes

- verified
- declared
- unavailable
- partial
- external
- unknown

Rules

- `Integrity Status` must state whether payload integrity is verified, declared, unavailable, partial, external, or unknown.
- `Integrity Method` and `Integrity Value` should be present when the payload has a digest, signature, checksum, or other integrity anchor known to the artifact.
- `Integrity Target` should state what bytes, archive entry, canonical representation, or external object the integrity signal applies to when known.
- `Validation Method` may reference a validation method artifact when the integrity method semantics are defined elsewhere.
- A payload reference must not claim semantic correctness, authorship, consent, provenance, or truth merely because an integrity value is present.

### Access Boundary

Required Fields

- Access Boundary

Optional Fields

- Privacy Boundary
- Authorization Required
- Publicly Shareable
- Retention Policy
- Redaction Notes

Rules

- `Access Boundary` must state who or what can access the payload, or state that access is unknown.
- Privacy, authorization, retention, or redaction constraints should be explicit when they are known.
- When payload access is private or restricted, the artifact should preserve enough non-sensitive description that later readers can understand the reference without exposing the payload.
- External payload artifacts may reference privacy boundary artifacts when access and sharing semantics need stronger local structure.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-payload.trace.md`
- `<lineage>-<payload-slug>.trace.md`

Rules

- External payload artifacts should keep the lineage label first.
- The optional slug should identify the payload family, object, or bounded package rather than a low-signal transport detail.
- External payload artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.external.payload.v1` when the main artifact value is a readable reference to a payload that should not be fully embedded in markdown.
- Do not use `tiinex.external.payload.v1` as a substitute for evidence when the main artifact value is a preserved claim-supporting evidence slice.
- Do not use `tiinex.external.payload.v1` as a substitute for runtime schemas when the main artifact value is runtime interpretation rather than payload reference.
- Evidence, runtime, relation, attestation, and privacy artifacts may reference external payload artifacts when they need durable payload context.

## Minimal Example

```md
# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.external.payload.v1
  - Created At: 2026-06-26 00:00:00
  - Summary: Payload reference for one private lab result archive.

---

# Private Lab Result Archive Payload

## Payload Identity

- Payload Label: private lab result archive
- Payload Kind: archive
- Media Type: application/zip
- Payload Role: source payload for later evidence and attestation artifacts

## Payload Location

- Location: private lab storage descriptor
- Location Type: private-storage
- Access Method: authorized lab account

## Integrity Reference

- Integrity Status: declared
- Integrity Method: sha256 digest
- Integrity Value: example-digest-placeholder
- Integrity Target: archive bytes as stored by the lab system

## Access Boundary

- Access Boundary: restricted lab access
- Privacy Boundary: sensitive personal data may be present
- Publicly Shareable: no

## Interpretation Limits

- This artifact references the payload; it does not itself preserve the payload contents or prove the lab interpretation.
```

## Validation-Friendly Shape

Keep this schema note in the exact section order already used here:
`Summary`, `Schema Validation Contract`, `Minimal Example`,
`Validation-Friendly Shape`, and `Interpretation Notes`.

Maintain the section headings exactly in this schema note. Free markdown inside
those sections is allowed, but adding undeclared new section headings should be
treated as schema drift.

## Interpretation Notes

- external payload artifacts preserve payload identity, location, integrity state, and access boundary without forcing large or private payloads into markdown
- payload integrity does not automatically prove semantic correctness, provenance, consent, or truth
- this support schema intentionally omits `Artifact Creation Contract` until ordinary app creation behavior is explicitly declared

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.root.v1.schema.md](https://github.com/Tiinex/docs/blob/2a40646640f7468bcd250df6988b69e9f047f1bb/.topics/.schemas/tiinex.root.v1.schema.md)
  - Value: BFWYft1v0Ue0gUoO236DGScvnixS7_MIEwO6mhJhkNw

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: 3A38qBnarh-4PJPUKqg5Wq2CT_wFiG2TZCjASHKUUuE