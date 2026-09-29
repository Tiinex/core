# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.runtime.v1](../../runtime/tiinex.runtime.v1.schema.md)
  - Created At: 2026-06-05 11:00:00
  - Trace: [tiinex.runtime.v1.schema.md](../../runtime/tiinex.runtime.v1.schema.md)
  - Origin:
    - [relative](../../runtime/tiinex.runtime.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/00adbcc5b0319410cf16752a54dcbf4813173040/.topics/.schemas/runtime/tiinex.runtime.v1.schema.md)
- Current
  - Current Schema: [tiinex.traversal.runtime.v1](tiinex.traversal.runtime.v1.schema.md)
  - Created At: 2026-06-26 00:00:00
  - Summary: Schema for traversal-runtime artifacts that preserve candidate spaces, transition rules, verifiers, executors, outcomes, and failure boundaries.

---

# Traversal Runtime

- Status: maintained schema note

## Summary

This schema narrows `tiinex.runtime.v1` for artifacts whose main job is to
preserve a bounded traversal through a candidate space using declared inputs,
transition rules, candidate encoding, verifier semantics, executor context, and
outcome boundaries.

It exists so Tiinex can describe compute-agnostic traversal before introducing
executor-specific descendants such as quantum runtime schemas.

## Schema Validation Contract

### Traversal Runtime Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.traversal.runtime.v1`

Rules

- `tiinex.traversal.runtime.v1` identifies runtime artifacts centered on candidate-space traversal.
- A traversal-runtime artifact should describe the search space, transition rules, candidate representation, verifier, executor, outcome, and failure boundaries.
- A traversal-runtime artifact must not claim to create missing provenance or original information; it can only search, generate, test, rank, or reject candidates within a declared space.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Traversal Runtime Body

Required Shape

- first body heading after the continuity envelope
- `## Search Space` section
- `## Candidate Model` section
- `## Transition Rules` section
- `## Verifier` section
- `## Runtime Executor` section
- `## Outcome` section
- `## Failure Modes` section

Optional Sections

- Known Inputs
- Unknown Inputs
- Constraints
- Cost Model
- Evidence Basis
- Relation Inputs
- External Payloads
- Validation Method
- Interpretation Limits
- References

Rules

- A traversal-runtime artifact should begin with a human-readable traversal title.
- `Search Space` must state what candidate space is being traversed.
- `Candidate Model` must state how candidates are represented or encoded.
- `Transition Rules` must state how candidates are generated, moved, pruned, or transformed.
- `Verifier` must state how candidates are tested or rejected.
- `Runtime Executor` must state what executor, runtime, or process performed or would perform the traversal.
- `Outcome` must state what happened, what was found, what was not found, or why the result is inconclusive.
- `Failure Modes` must state known limits, risks, or invalid interpretations.

### Search Space

Required Fields

- Search Space
- Search Space Status
- Candidate Boundary

Optional Fields

- Known Inputs
- Unknown Inputs
- Constraints
- Input Artifacts
- Input Payloads
- Relation Inputs
- Size Estimate

Allowed Shapes

- `Search Space Status`: bounded
- `Search Space Status`: partially-bounded
- `Search Space Status`: inferred
- `Search Space Status`: unknown

Rules

- `Search Space` must describe the set of possible candidates at a useful level of detail.
- `Search Space Status` must use one of the declared shapes.
- `Candidate Boundary` must state what is inside and outside the candidate space.
- Known and unknown inputs should be explicit when they materially affect traversal.
- Multi-input domain reality should be represented through body fields, relation artifacts, or external payloads, not through multiple `Parent` entries.

### Candidate Model

Required Fields

- Candidate Encoding
- Candidate Identity
- Candidate State

Optional Fields

- Candidate Score
- Candidate Ordering
- Candidate Equivalence
- Canonicalization
- Reproducibility Notes

Rules

- `Candidate Encoding` must state how a candidate is represented.
- `Candidate Identity` must state how one candidate is distinguished from another.
- `Candidate State` must state whether candidates are complete, partial, ranked, rejected, accepted, or unknown.
- Candidate equivalence and canonicalization should be explicit when multiple encodings can represent the same candidate.

### Transition Rules

Required Fields

- Transition Rule
- Pruning Rule

Optional Fields

- Expansion Rule
- Mutation Rule
- Ordering Rule
- Termination Rule
- Randomness
- Determinism

Rules

- `Transition Rule` must state how traversal proceeds from one candidate state to another.
- `Pruning Rule` must state how impossible, irrelevant, or disallowed candidates are removed, or state that pruning is not declared.
- Randomness, nondeterminism, or heuristic ordering should be explicit when present.
- Transition rules should be specific enough that a later reader can understand the traversal boundary without reconstructing the runtime implementation.

### Verifier

Required Fields

- Verifier
- Verifies
- Does Not Verify

Optional Fields

- Validation Method
- Acceptance Criteria
- Rejection Criteria
- False Positive Risk
- False Negative Risk
- Required Context

Rules

- `Verifier` must state how candidate validity is tested.
- `Verifies` must state the positive claim the verifier can support.
- `Does Not Verify` must state important claims the verifier cannot support.
- A checksum, digest, signature, or oracle may verify a candidate but must not be read as recreating missing information by itself.
- Validation method artifacts should be referenced when verifier semantics are defined elsewhere.

### Runtime Executor

Required Fields

- Executor Type
- Executor Description

Optional Fields

- Runtime Family
- Backend
- Tooling
- Environment
- Parameters
- Reproducibility
- Cost Model

Allowed Shapes

- `Executor Type`: human-guided
- `Executor Type`: deterministic-software
- `Executor Type`: probabilistic-software
- `Executor Type`: distributed-runtime
- `Executor Type`: quantum-backend
- `Executor Type`: hybrid
- `Executor Type`: other

Rules

- `Executor Type` must use one of the declared shapes.
- `Executor Description` must state what runtime, process, tool, backend, or agent performed or would perform the traversal.
- Quantum backends should be represented as executor types or descendant runtime schemas; they should not redefine root continuity or parent semantics.
- Runtime executor details should not replace search-space, candidate, transition, and verifier semantics.

### Outcome

Required Fields

- Outcome Status
- Outcome Summary

Optional Fields

- Found Candidates
- Rejected Candidates
- Inconclusive Areas
- Cost Observed
- Runtime Evidence

Allowed Shapes

- `Outcome Status`: found
- `Outcome Status`: not-found
- `Outcome Status`: partial
- `Outcome Status`: inconclusive
- `Outcome Status`: failed
- `Outcome Status`: planned

Rules

- `Outcome Status` must use one of the declared shapes.
- `Outcome Summary` must state what the traversal produced or failed to produce.

### Failure Modes

Required Fields

- Failure Modes

Optional Fields

- Interpretation Limits

Rules

- `Failure Modes` must state known ways the traversal can fail, mislead, overclaim, or be incomplete.
- Traversal outcomes should not be read as truth, provenance recovery, authorship, consent, identity, or semantic correctness unless those are inside the declared verifier scope and supported by appropriate companion artifacts.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-traversal-runtime.trace.md`
- `<lineage>-<traversal-slug>.trace.md`

Rules

- Traversal-runtime artifacts should keep the lineage label first.
- The optional slug should identify the traversal purpose, search space, or bounded runtime slice.
- Traversal-runtime artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.traversal.runtime.v1` when the main artifact value is candidate-space traversal and verification of candidates.
- Do not use `tiinex.traversal.runtime.v1` as a substitute for relation artifacts when the main value is a typed non-parent relationship.
- Do not use `tiinex.traversal.runtime.v1` as a substitute for evidence artifacts when the main value is preserved supporting material.
- Do not use `tiinex.traversal.runtime.v1` to imply that missing source information was recreated outside a declared candidate space and verifier.
- Quantum-specific traversal schemas may later narrow this schema when executor semantics require stronger local structure.

## Minimal Example

```md
# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.traversal.runtime.v1
  - Created At: 2026-06-26 00:00:00
  - Summary: Candidate traversal for checksum-matched recovery within a bounded source space.

---

# Bounded Candidate Traversal Runtime

## Search Space

- Search Space: candidate markdown artifacts generated from a known template and bounded input set
- Search Space Status: partially-bounded
- Candidate Boundary: only candidates derived from the declared template and known input fragments are in scope
- Known Inputs: template fragment and expected digest
- Unknown Inputs: omitted body text

## Candidate Model

- Candidate Encoding: canonical markdown candidate bytes
- Candidate Identity: digest of candidate bytes plus generation parameters
- Candidate State: partial until verifier accepts or rejects

## Transition Rules

- Transition Rule: generate next candidate from bounded input fragments and template positions
- Pruning Rule: reject candidates that cannot match required headings or canonicalization constraints

## Verifier

- Verifier: sha256-base64url-c14n-v1 digest comparison
- Verifies: candidate canonical bytes match the declared digest
- Does Not Verify: truth, authorship, intent, consent, provenance, or semantic correctness

## Runtime Executor

- Executor Type: deterministic-software
- Executor Description: bounded local traversal script

## Outcome

- Outcome Status: inconclusive
- Outcome Summary: traversal space was narrowed but no accepted candidate is recorded here

## Failure Modes

- Failure Modes: incomplete search space, wrong canonicalization, missing inputs, false confidence from checksum-only matching
```

## Validation-Friendly Shape

Keep this schema note in the exact section order already used here:
`Summary`, `Schema Validation Contract`, `Minimal Example`,
`Validation-Friendly Shape`, and `Interpretation Notes`.

Maintain the section headings exactly in this schema note. Free markdown inside
those sections is allowed, but adding undeclared new section headings should be
treated as schema drift.

## Interpretation Notes

- traversal-runtime artifacts preserve candidate-space search semantics without making quantum or any other executor the root abstraction
- traversal can test candidates inside a declared space; it does not create missing provenance outside that space
- this support schema intentionally omits `Artifact Creation Contract` until ordinary app creation behavior is explicitly declared

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.runtime.v1.schema.md](https://github.com/Tiinex/docs/blob/00adbcc5b0319410cf16752a54dcbf4813173040/.topics/.schemas/runtime/tiinex.runtime.v1.schema.md)
  - Value: 4983rs5sCipZYK0ogn-1-uvnDb5GMfW2QaQxPUWJtqY

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: NYOaH3Iv3QXQ4Z-zdu6unWjDkLE6-TRj1sx3CdxJtb8