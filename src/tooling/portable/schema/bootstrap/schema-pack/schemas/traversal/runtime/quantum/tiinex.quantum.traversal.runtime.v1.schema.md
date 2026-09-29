# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.traversal.runtime.v1](../tiinex.traversal.runtime.v1.schema.md)
  - Created At: 2026-06-26 00:00:00
  - Trace: [tiinex.traversal.runtime.v1.schema.md](../tiinex.traversal.runtime.v1.schema.md)
  - Origin:
    - [relative](../tiinex.traversal.runtime.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/01fd6502b0339abdb545a3d49fbc663cedd4e626/.topics/.schemas/traversal/runtime/tiinex.traversal.runtime.v1.schema.md)
- Current
  - Current Schema: [tiinex.quantum.traversal.runtime.v1](tiinex.quantum.traversal.runtime.v1.schema.md)
  - Created At: 2026-06-26 00:00:00
  - Summary: Schema for quantum-specific traversal runtime artifacts that preserve inherited traversal semantics plus backend context, candidate encoding, circuit or oracle semantics, measurement results, post-processing, and claim boundaries.

---

# Quantum Traversal Runtime

- Status: maintained schema note

## Summary

This schema narrows `tiinex.traversal.runtime.v1` for artifacts whose main job is
to preserve quantum-specific or quantum-like traversal of a declared candidate
space.

It exists so Tiinex can describe quantum traversal as an executor-specialized
runtime layer without making quantum the root abstraction, without assuming real
hardware execution, and without claiming that missing provenance or truth was
recreated outside a declared search space and verifier.

## Schema Validation Contract

### Quantum Traversal Runtime Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.quantum.traversal.runtime.v1`

Rules

- `tiinex.quantum.traversal.runtime.v1` identifies traversal-runtime artifacts centered on quantum-specific execution, simulation, planning, imported quantum result packages, or hybrid quantum/classical traversal.
- A quantum traversal artifact must preserve the inherited traversal-runtime requirements for search space, candidate model, transition rules, verifier, runtime executor, outcome, and failure modes.
- A quantum traversal artifact adds quantum-specific execution context, quantum candidate encoding, circuit or oracle description, measurement results, and classical post-processing on top of the inherited traversal-runtime body.
- A quantum traversal artifact must not claim hardware execution, quantum advantage, provenance recovery, truth, authorship, consent, identity, or semantic correctness unless those claims are explicitly inside the declared scope and separately supported.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Quantum Traversal Body

Required Shape

- first body heading after the continuity envelope
- inherited traversal-runtime body sections remain required:
  - `## Search Space` section
  - `## Candidate Model` section
  - `## Transition Rules` section
  - `## Verifier` section
  - `## Runtime Executor` section
  - `## Outcome` section
  - `## Failure Modes` section
- quantum-specific sections are also required:
  - `## Quantum Execution Context` section
  - `## Quantum Candidate Encoding` section
  - `## Circuit Or Oracle` section
  - `## Measurement Results` section
  - `## Classical Post-Processing` section

Optional Sections

- Backend Calibration
- Noise Model
- External Payloads
- Validation Method
- Relation Inputs
- Cost Model
- Reproducibility Notes
- Interpretation Limits
- References

Rules

- A quantum traversal artifact should begin with a human-readable traversal title.
- Parent traversal-runtime sections must not be omitted merely because quantum-specific sections contain related details.
- `Search Space` must state the candidate space inherited from traversal-runtime.
- `Candidate Model` must state the traversal-level candidate representation before or alongside quantum-specific encoding details.
- `Transition Rules` must state how traversal proceeds, including any sampling, amplification, annealing, or hybrid transition behavior at a readable level.
- `Verifier` must state what candidate claim can be tested and what it does not verify.
- `Runtime Executor` must state the traversal executor using inherited traversal-runtime fields, including `Executor Type` and `Executor Description`.
- `Quantum Execution Context` must state whether the artifact describes a simulator run, hardware run, hybrid run, planned run, imported result, or unknown execution context.
- `Quantum Candidate Encoding` must state how traversal candidates are represented for the quantum or quantum-like executor and how measured results map back to candidates.
- `Circuit Or Oracle` must state the circuit, program, oracle, verifier, sampler, annealing problem, or bounded descriptor used by the quantum traversal.
- `Measurement Results` must state what result signal exists, or explicitly state that no execution result exists.
- `Classical Post-Processing` must state how raw or summarized quantum outputs become candidate claims, rankings, rejections, or interpretations.
- `Outcome` and `Failure Modes` must state what was found, not found, planned, failed, or inconclusive, and what must not be inferred.

### Quantum Execution Context

Required Fields

- Backend Type
- Execution Status
- Backend Description

Optional Fields

- Backend Name
- Backend Provider
- Runtime Family
- Shots Or Runs
- Noise Or Calibration Context
- Simulator Details
- Hardware Details
- Imported Result Reference
- Parameters
- Reproducibility

Allowed Shapes

- `Backend Type`: simulator
- `Backend Type`: hardware
- `Backend Type`: hybrid
- `Backend Type`: planned
- `Backend Type`: imported
- `Backend Type`: unknown
- `Execution Status`: planned
- `Execution Status`: simulated
- `Execution Status`: executed
- `Execution Status`: imported
- `Execution Status`: failed
- `Execution Status`: unknown

Rules

- `Backend Type` must use one of the declared shapes.
- `Execution Status` must use one of the declared shapes.
- `Backend Description` must describe the executor context at a level sufficient to distinguish simulator, hardware, hybrid, planned, imported, or unknown execution.
- Hardware-specific claims require `Backend Type: hardware` or `Backend Type: hybrid` plus an execution status that does not merely say planned.
- Simulator, planned, and imported artifacts are valid quantum traversal artifacts when their boundaries are explicit.
- Quantum execution context specializes the inherited `Runtime Executor` section but does not replace it.

### Quantum Candidate Encoding

Required Fields

- Representation Basis
- Register Or State Layout
- Candidate Mapping
- Measurement Mapping

Optional Fields

- Candidate Encoding
- Candidate Identity
- Qubit Count
- Register Count
- State Preparation
- Candidate Equivalence
- Encoding Limits
- Classical Candidate Boundary

Allowed Shapes

- `Representation Basis`: qubit-binary
- `Representation Basis`: qudit
- `Representation Basis`: continuous-variable
- `Representation Basis`: graph-encoded
- `Representation Basis`: amplitude-encoded
- `Representation Basis`: phase-encoded
- `Representation Basis`: hybrid
- `Representation Basis`: other
- `Representation Basis`: unknown

Rules

- `Representation Basis` must use one of the declared shapes so the schema does not collapse quantum traversal into ordinary binary search.
- `Register Or State Layout` must state the quantum register, state, graph, mode, or bounded representation used for candidates.
- `Candidate Mapping` must state how domain candidates map into the quantum representation.
- `Measurement Mapping` must state how measured or summarized quantum outputs map back to candidates, scores, rankings, or rejection signals.
- Candidate encoding must not replace the inherited traversal requirement to declare the search space, candidate model, transition rules, and verifier boundary.
- Quantum candidate encoding specializes the inherited `Candidate Model` section but does not replace it.

### Circuit Or Oracle

Required Fields

- Circuit Or Program Reference
- Algorithm Family
- Oracle Or Verifier Role

Optional Fields

- Circuit Description
- Oracle Description
- Gate Set
- Depth
- Parameters
- State Preparation
- Measurement Basis
- External Payload
- Version

Allowed Shapes

- `Algorithm Family`: amplitude-amplification
- `Algorithm Family`: phase-estimation
- `Algorithm Family`: variational
- `Algorithm Family`: annealing
- `Algorithm Family`: quantum-walk
- `Algorithm Family`: sampling
- `Algorithm Family`: hybrid
- `Algorithm Family`: other
- `Algorithm Family`: unknown

Rules

- `Circuit Or Program Reference` must identify a circuit, program, oracle, annealing problem, sampler, bounded descriptor, or external payload reference.
- `Algorithm Family` must use one of the declared shapes.
- `Oracle Or Verifier Role` must state how the quantum layer marks, scores, amplifies, samples, verifies, or otherwise influences candidate traversal.
- Circuit or oracle references may be external payloads when the circuit or program is too large or machine-shaped to embed in markdown.
- A circuit or oracle may support candidate traversal, but it must not be read as proof of truth outside the declared verifier scope.
- Circuit or oracle semantics may specialize inherited `Transition Rules` and `Verifier` context but do not replace those sections.

### Measurement Results

Required Fields

- Result Shape
- Result Status
- Measurement Summary

Optional Fields

- Shots Or Runs
- Counts
- Samples
- State Vector Reference
- Expectation Values
- Accepted Candidate Signal
- Error Bars
- Noise Or Calibration Context
- External Payload

Allowed Shapes

- `Result Shape`: counts
- `Result Shape`: samples
- `Result Shape`: state-vector
- `Result Shape`: expectation-values
- `Result Shape`: summary-only
- `Result Shape`: external-payload
- `Result Shape`: not-executed
- `Result Shape`: unknown
- `Result Status`: observed
- `Result Status`: simulated
- `Result Status`: imported
- `Result Status`: planned
- `Result Status`: unavailable
- `Result Status`: failed
- `Result Status`: unknown

Rules

- `Result Shape` must use one of the declared shapes.
- `Result Status` must use one of the declared shapes.
- `Measurement Summary` must state what measurement or result signal exists, or why it is absent.
- Raw measurements should be summarized readably when full result payloads are external, private, or too large to embed.
- Measurement results must not be treated as accepted candidates without the declared verifier and classical post-processing boundary.

### Classical Post-Processing

Required Fields

- Post-Processing Method
- Candidate Decoding
- Candidate Decision Rule

Optional Fields

- Ranking Rule
- Filtering Rule
- Tie Handling
- Confidence Or Score
- Validation Method
- Reproducibility Notes
- Known Gaps

Rules

- `Post-Processing Method` must state how measured or summarized quantum output is converted into candidate outcomes.
- `Candidate Decoding` must state how quantum outputs are decoded back into traversal candidates or candidate descriptors.
- `Candidate Decision Rule` must state how candidates are accepted, rejected, ranked, or left inconclusive.
- Classical post-processing should be explicit when it materially determines the final outcome.
- Post-processing must not expand the verified claim beyond the declared verifier and measurement boundary.

### Outcome

Required Fields

- Outcome Status
- Outcome Summary

Optional Fields

- Found Candidates
- Rejected Candidates
- Inconclusive Areas
- Quantum Advantage Claim
- Hardware Execution Claim
- Cost Observed

Allowed Shapes

- `Outcome Status`: found
- `Outcome Status`: not-found
- `Outcome Status`: partial
- `Outcome Status`: inconclusive
- `Outcome Status`: failed
- `Outcome Status`: planned
- `Quantum Advantage Claim`: claimed
- `Quantum Advantage Claim`: not-claimed
- `Quantum Advantage Claim`: unknown
- `Hardware Execution Claim`: claimed
- `Hardware Execution Claim`: not-claimed
- `Hardware Execution Claim`: unknown

Rules

- `Outcome Status` must use one of the declared shapes.
- `Outcome Summary` must state what the quantum traversal produced or failed to produce.
- Quantum advantage must not be claimed unless `Quantum Advantage Claim: claimed` is present and supported by appropriate benchmark or validation context.
- Hardware execution must not be claimed unless `Hardware Execution Claim: claimed` is present and supported by execution context.

### Failure Modes

Required Fields

- Failure Modes
- Claim Boundary

Optional Fields

- Interpretation Limits

Rules

- `Failure Modes` must state known ways the quantum traversal can fail, mislead, overclaim, or be incomplete.
- `Claim Boundary` must state what the artifact is allowed to claim and what it does not prove.
- Quantum traversal must not be read as provenance recovery, truth, authorship, consent, identity, or semantic correctness outside the declared search space, verifier, and companion artifacts.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-quantum-traversal-runtime.trace.md`
- `<lineage>-<quantum-traversal-slug>.trace.md`

Rules

- Quantum traversal runtime artifacts should keep the lineage label first.
- The optional slug should identify the quantum traversal purpose, backend, algorithm family, or bounded runtime slice.
- Quantum traversal runtime artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.quantum.traversal.runtime.v1` when the main artifact value is quantum-specific traversal of a candidate space.
- Do not use `tiinex.quantum.traversal.runtime.v1` for ordinary traversal that has no quantum-specific executor, circuit, measurement, or quantum-like result semantics.
- Do not use `tiinex.quantum.traversal.runtime.v1` as a generic quantum provenance schema.
- Do not use `tiinex.quantum.traversal.runtime.v1` to imply that missing source material was recreated outside a declared candidate space and verifier.
- Future quantum schemas may narrow this schema for hardware-specific, algorithm-specific, or payload-heavy quantum runtime families when stronger local structure is needed.

## Minimal Example

```md
# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.quantum.traversal.runtime.v1
  - Created At: 2026-06-26 00:00:00
  - Summary: Toy simulator quantum traversal over a bounded candidate index space.

---

# Toy Quantum Candidate Traversal

## Search Space

- Search Space: bounded candidate index set derived from a declared toy candidate list
- Search Space Status: bounded
- Candidate Boundary: only declared candidate indexes are in scope

## Candidate Model

- Candidate Encoding: candidate index bitstring
- Candidate Identity: decoded candidate index
- Candidate State: ranked until verifier accepts or rejects

## Transition Rules

- Transition Rule: amplitude-amplification-style sampling over encoded candidate indexes
- Pruning Rule: reject candidates outside declared index range

## Verifier

- Verifier: classical digest comparison
- Verifies: decoded candidate matches the declared digest
- Does Not Verify: truth, authorship, provenance, consent, identity, or semantic correctness

## Runtime Executor

- Executor Type: quantum-backend
- Executor Description: local noiseless simulator used for a toy bounded traversal
- Runtime Family: quantum traversal simulator

## Quantum Execution Context

- Backend Type: simulator
- Execution Status: simulated
- Backend Description: local noiseless simulator used for a toy bounded traversal
- Backend Name: local toy simulator
- Shots Or Runs: 1024
- Noise Or Calibration Context: idealized noiseless simulation

## Quantum Candidate Encoding

- Representation Basis: qubit-binary
- Register Or State Layout: three-qubit candidate index register
- Candidate Mapping: each measured bitstring maps to one candidate index in the declared bounded set
- Measurement Mapping: measured bitstrings are decoded as candidate indexes before classical verification

## Circuit Or Oracle

- Circuit Or Program Reference: bounded toy circuit descriptor
- Algorithm Family: amplitude-amplification
- Oracle Or Verifier Role: marks candidate indexes whose decoded candidate should be checked by the classical digest verifier

## Measurement Results

- Result Shape: counts
- Result Status: simulated
- Measurement Summary: simulator counts favored one candidate index, but acceptance still requires classical verification
- Accepted Candidate Signal: candidate index with highest observed count

## Classical Post-Processing

- Post-Processing Method: decode measured bitstrings to candidate indexes and run classical digest comparison
- Candidate Decoding: bitstring to candidate index
- Candidate Decision Rule: accept only if decoded candidate passes declared digest verifier

## Outcome

- Outcome Status: partial
- Outcome Summary: quantum-style traversal produced a ranked candidate signal for classical verification
- Quantum Advantage Claim: not-claimed
- Hardware Execution Claim: not-claimed

## Failure Modes

- Failure Modes: toy search space, simulator-only execution, wrong encoding, insufficient shots, false confidence from measurement frequency, verifier outside declared scope
- Claim Boundary: this artifact shows a bounded quantum-style traversal path; it does not prove truth, provenance recovery, authorship, identity, consent, or semantic correctness
```

## Validation-Friendly Shape

Keep this schema note in the exact section order already used here:
`Summary`, `Schema Validation Contract`, `Minimal Example`,
`Validation-Friendly Shape`, and `Interpretation Notes`.

Maintain the section headings exactly in this schema note. Free markdown inside
those sections is allowed, but adding undeclared new section headings should be
treated as schema drift.

## Interpretation Notes

- quantum traversal runtime is an additive executor-specialized child of traversal runtime, not a root provenance abstraction
- simulator, planned, imported, hybrid, and hardware runs are all valid when their boundaries are explicit
- inherited traversal-runtime sections remain required; quantum-specific sections add executor detail without replacing search-space, candidate, transition, verifier, executor, outcome, or failure semantics
- quantum measurement signals require declared post-processing and verifier boundaries before they become candidate claims
- this support schema intentionally omits `Artifact Creation Contract` until ordinary app creation behavior is explicitly declared

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.traversal.runtime.v1.schema.md](https://github.com/Tiinex/docs/blob/01fd6502b0339abdb545a3d49fbc663cedd4e626/.topics/.schemas/traversal/runtime/tiinex.traversal.runtime.v1.schema.md)
  - Value: 9F8tFKNaSGUC8f9hX3nFngAutRA0LSRI1emq2bkzAas

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: zRUHizjWVNGOZM9RP59aLw1-T_S7JzvUNtLaXD4Awis