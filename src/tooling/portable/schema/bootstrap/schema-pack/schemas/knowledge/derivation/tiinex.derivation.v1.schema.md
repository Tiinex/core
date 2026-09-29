# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
  - Created At: 2026-06-14 00:00:00
  - Trace: [tiinex.root.v1.schema.md](../../tiinex.root.v1.schema.md)
  - Origin:
    - [browse + git](https://github.com/Tiinex/docs/blob/2a40646640f7468bcd250df6988b69e9f047f1bb/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.derivation.v1](tiinex.derivation.v1.schema.md)
  - Created At: 2026-07-02 00:00:00
  - Status: Draft schema proposal
  - Why: Defines public reasoning provenance so proofs, arguments, calculations, reductions, and inference chains can be preserved without becoming hidden chain-of-thought, validation, evidence, or truth by themselves.
  - Summary: Human-first schema for bounded derivations and reviewable reasoning chains.

---

# Derivation

## Summary

Defines a human-readable and machine-extractable derivation artifact.

A derivation artifact preserves a public, reviewable reasoning path from starting points toward a conclusion. It may describe a proof, proof sketch, argument, calculation chain, reduction, transformation, inference, explanation, or counterexample. It is useful for mathematics, research, validation review, schema building, audit, and conditional form or presentation flows where the steps between assumptions and conclusion need to travel as provenance.

A derivation does not by itself make a conclusion true outside its stated boundary. It records the reasoning chain, starting points, methods, gaps, review state, and limits. Claims, evidence, validation, attestation, and decisions remain separate companion artifacts when those semantics are needed.

## Core Semantics

- A derivation records publicly reviewable reasoning, not private chain-of-thought or hidden internal deliberation.
- A derivation may support, challenge, explain, refine, or refute a claim.
- A derivation may rely on conditions, assumptions, definitions, evidence, validation methods, previous claims, or external references.
- A derivation may be complete, partial, disputed, invalidated, superseded, or unknown.
- A derivation does not by itself prove truth outside its stated assumptions, rules, and review boundary.
- A derivation should keep starting points, steps, conclusion, review state, gaps, and interpretation limits distinct.

## Schema Validation Contract

### Derivation Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.derivation.v1`

Rules

- `tiinex.derivation.v1` identifies artifacts whose main job is to preserve a bounded, reviewable reasoning chain.
- A derivation artifact must keep derivation steps distinct from claim statement, evidence material, validation result, attestation, decision, and executable code.
- A derivation artifact may reference claims, questions, conditions, evidence, validation methods, tools, or sources when those companion schemas own the relevant semantics.
- A derivation artifact must not require or expose private chain-of-thought; it should preserve reasoning that is intended to be reviewable by later readers.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Derivation Body

Required Shape

- first body heading after the continuity envelope
- `## Derivation Identity` section
- `## Starting Points` section
- `## Derivation Steps` section
- `## Conclusion` section
- `## Review Boundary` section
- `## Interpretation Limits` section

Optional Sections

- `Claim Target`
- `Questions Addressed`
- `Conditions And Assumptions`
- `Rules Or Methods`
- `Calculation Notes`
- `Gaps Or Open Steps`
- `Counterexample`
- `Related Artifacts`
- `References`
- `Examples`

Rules

- Required sections should be readable without specialized tooling.
- Required sections should be structured enough for humans, tools, and LLMs to extract the reasoning boundary without guessing.
- A derivation may be complete, partial, proof-sketch, gap-known, disputed, invalidated, superseded, or unknown.
- A derivation must not silently become a validation result, evidence artifact, attestation, decision, or executable program.

### Derivation Identity

Required Fields

- Derivation Name
- Derivation Kind
- Derivation State
- Canonical Identifier

Optional Fields

- Short Label
- Supersedes
- Related Derivation

Allowed Labels

- proof
- proof-sketch
- argument
- calculation
- inference
- reduction
- transformation
- explanation
- counterexample
- model-derivation
- validation-rationale
- unknown

Rules

- `Derivation Name` should be stable enough for a human-readable proof, audit, review, or schema-builder surface.
- `Derivation Kind` should describe the reasoning role without overstating validity.
- `Derivation State` should describe the review or completion state of the derivation.
- `Canonical Identifier` should be stable enough for claim, evidence, validation, audit, and relation references.

### Starting Points

Required Fields

- Starting Claims Or Assumptions
- Inputs

Optional Fields

- Definitions
- Conditions
- Axioms
- Prior Results
- Evidence
- Source Material
- Tool Or Method
- Unknowns

Rules

- `Starting Claims Or Assumptions` must state what the derivation starts from.
- `Inputs` must state the material, values, observations, artifacts, or premises used when known.
- Unknown or unavailable starting points should be stated explicitly, not hidden.
- Starting points must not be treated as true outside their own support boundary.

### Derivation Steps

Required Fields

- Steps
- Step Boundary

Optional Fields

- Rule Used
- Method Used
- Calculation
- Transformation
- Intermediate Result
- Gap
- Reviewer Note

Rules

- `Steps` should preserve the public reasoning path in enough detail for later review.
- `Step Boundary` should state how detailed the steps are and what has been omitted.
- A derivation may summarize reasoning, but it must not imply that omitted steps are validated or obvious when they are not.
- If a step depends on a specialized method, tool, convention, or notation, the dependency should be named or marked unknown.

### Conclusion

Required Fields

- Conclusion
- Conclusion Boundary

Optional Fields

- Supported Claim
- Challenged Claim
- Remaining Conditions
- Remaining Unknowns
- Confidence

Rules

- `Conclusion` must state what the derivation reaches.
- `Conclusion Boundary` must state the assumptions, conditions, scope, or review limits under which the conclusion follows.
- A conclusion may support a claim, but the claim artifact owns the asserted statement if the claim needs to travel separately.

### Review Boundary

Required Fields

- Review State
- Review Needed

Optional Fields

- Reviewed By
- Validation Method
- Known Gap
- Dispute
- Counterexample
- Reproducibility Notes

Allowed Labels

- draft
- complete
- partial
- proof-sketch
- gap-known
- reviewed
- disputed
- invalidated
- superseded
- unknown

Rules

- `Review State` must describe the review status of the derivation, not truth outside the boundary.
- `Review Needed` should state what would be required for stronger confidence, validation, or acceptance.
- A reviewed derivation is not automatically a validation report unless a validation report artifact owns that run/result boundary.

### Interpretation Limits

Required Fields

- Does Not Prove
- Must Not Be Inferred

Optional Fields

- Remaining Unknowns
- Overclaim Risks
- Review Notes

Rules

- A derivation must not imply that its conclusion is true outside the stated assumptions, steps, methods, and review boundary.
- A derivation must not imply evidence, validation, attestation, consensus, authorship, authority, or consent unless separately supported.
- A derivation must not hide private reasoning as provenance; only reviewable reasoning intended for later readers should be preserved.

## Artifact Creation Contract

### Creation Scope

Required Fields

- Create When
- Do Not Create When

Rules

- Create a `tiinex.derivation.v1` artifact when a proof, argument, calculation chain, reduction, transformation, inference, counterexample, or reviewable reasoning path needs to travel as provenance.
- Do not create a derivation artifact for private chain-of-thought, transient reasoning scratch, or implementation-only control flow that is not intended as reviewable provenance.
- Do not use a derivation artifact as a substitute for evidence, validation report, claim, attestation, decision, or executable code.

### Required Inputs

Required Fields

- Starting Claims Or Assumptions
- Inputs
- Steps
- Conclusion
- Conclusion Boundary
- Review State
- Interpretation Limits

Optional Fields

- Claim Target
- Questions Addressed
- Conditions
- Rules Or Methods
- Calculation Notes
- Gaps Or Open Steps
- Validation Binding
- Related Artifacts

Rules

- Missing steps, methods, or assumptions should be explicit as unknown, unavailable, or gap-known.
- Specialized notation or calculation should be accompanied by enough human-readable context for later review.
- A derivation that depends on a tool or method should name the tool or method when known.

### Generation Rules

Rules

- Start with the premises or starting assumptions.
- Record the reviewable steps or state the level of summarization.
- State the conclusion and boundary.
- Keep claim assertion, evidence, validation, attestation, and decision semantics separate.
- State what must not be inferred from the derivation.

### Suggested Sequence

Rules

- Identify what the derivation is meant to support, challenge, or explain.
- State starting claims, assumptions, inputs, or definitions.
- State the derivation steps or reviewable reasoning path.
- State the conclusion and conclusion boundary.
- State review state and remaining gaps.
- Link companion claim, question, condition, evidence, validation, source, or tool artifacts when available.
- State interpretation limits.

## Validation-Friendly Shape

A validator can check this schema family by looking for:

- continuity envelope with `Current Schema: tiinex.derivation.v1`
- required derivation body sections
- derivation identity fields
- starting points
- derivation steps and step boundary
- conclusion and conclusion boundary
- review boundary
- interpretation limits
- absence of evidence, validation, attestation, decision, executable-code, or truth overclaims unless separately referenced

## Minimal Example

```md
# Continuity Context

- Current
  - Current Schema: [tiinex.derivation.v1](tiinex.derivation.v1.schema.md)
  - Created At: 2026-07-02 00:00:00
  - Summary: Derivation explaining why current web fallback cannot prove historical completeness.

---

# Reasoning for current web fallback completeness limit

## Derivation Identity

Derivation Name: Current web fallback completeness derivation
Derivation Kind: argument
Derivation State: proof-sketch
Canonical Identifier: derivation.portal.current-web-completeness-limit.v1

## Starting Points

Starting Claims Or Assumptions: A current web view shows the source as accessible now; historical completeness concerns the source state at artifact creation time.
Inputs: artifact creation time, current web access state, missing resolved source snapshot

## Derivation Steps

Steps: A source may change between artifact creation and current access. If no resolved historical anchor is available, current access does not by itself establish what the source contained earlier.
Step Boundary: Human-readable argument, not a formal proof of all possible source-change cases.

## Conclusion

Conclusion: Current web fallback does not prove historical source completeness at artifact creation time.
Conclusion Boundary: Applies when no stronger historical source anchor is available.

## Review Boundary

Review State: proof-sketch
Review Needed: stronger source-preservation or portal-time validation could refine this conclusion.

## Interpretation Limits

Does Not Prove: source truth, authorship, consent, or that current web fallback is useless
Must Not Be Inferred: that the current web state is historically complete
```

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.root.v1.schema.md](https://github.com/Tiinex/docs/blob/2a40646640f7468bcd250df6988b69e9f047f1bb/.topics/.schemas/tiinex.root.v1.schema.md)
  - Value: BFWYft1v0Ue0gUoO236DGScvnixS7_MIEwO6mhJhkNw

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: uWngIm-KlgHyD3gTLEvsyHgStLSXNX56kK0HW2FKbgQ