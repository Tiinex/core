# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
  - Created At: 2026-06-14 00:00:00
  - Trace: [tiinex.root.v1.schema.md](../../tiinex.root.v1.schema.md)
  - Origin:
    - [browse + git](https://github.com/Tiinex/docs/blob/78a3673444666f1145be4feca6e7eb1476a44281/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.claim.v1](tiinex.claim.v1.schema.md)
  - Created At: 2026-07-02 00:00:00
  - Status: Draft schema proposal
  - Why: Defines claim provenance so propositions, hypotheses, conjectures, answer candidates, and asserted statements can be preserved without becoming evidence, proof, validation, or truth by themselves.
  - Summary: Human-first schema for bounded claims and their support boundaries.

---

# Claim

## Summary

Defines a human-readable and machine-extractable claim artifact.

A claim artifact preserves a bounded statement that may be proposed, tested, supported, challenged, derived, validated, refuted, or left unresolved. It is useful for mathematics, research, review workflows, decision support, schema building, audit, and conversation provenance because it separates what is being asserted from the evidence, derivation, validation, attestation, or decision that may later bear on it.

A claim may be a proposition, hypothesis, conjecture, theorem-like statement, answer candidate, model claim, interpretation claim, measurement claim, or other bounded assertion. The claim records what is being claimed and under what boundary; companion artifacts own proof, evidence, validation, interpretation, attestation, or decision semantics.

## Core Semantics

- A claim records a bounded assertion or proposed statement.
- A claim may answer or refine a question, but it is not a response schema by itself.
- A claim may be supported by evidence, derivation, validation, attestation, interpretation, signal, finding, or relation artifacts.
- A claim may be conditional, disputed, partial, refuted, or unresolved.
- A claim does not prove itself and must not silently become evidence, derivation, validation, attestation, consent, authority, or decision.
- A claim should keep claim text, conditions, support state, challenge state, and interpretation limits distinct.

## Schema Validation Contract

### Claim Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.claim.v1`

Rules

- `tiinex.claim.v1` identifies artifacts whose main job is to preserve claim provenance and support boundaries.
- A claim artifact must keep the asserted statement distinct from evidence, proof, derivation, validation result, attestation, decision, or truth.
- A claim artifact may reference supporting or challenging artifacts, but those artifacts own their own semantics and claims.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Claim Body

Required Shape

- first body heading after the continuity envelope
- `## Claim Identity` section
- `## Claim Statement` section
- `## Claim Boundary` section
- `## Support And Challenge` section
- `## Interpretation Limits` section

Optional Sections

- `Conditions And Assumptions`
- `Related Question`
- `Derivation Candidates`
- `Evidence Candidates`
- `Validation Binding`
- `Related Artifacts`
- `References`
- `Examples`

Rules

- Required sections should be readable without specialized tooling.
- Required sections should be structured enough for humans, tools, and LLMs to extract the claim and its support boundary without guessing.
- A claim may be proposed, supported, challenged, derived, validated, refuted, superseded, withdrawn, unresolved, or unknown.
- A claim must not silently prove, validate, attest, authorize, or decide itself.

### Claim Identity

Required Fields

- Claim Name
- Claim Kind
- Claim State
- Canonical Identifier

Optional Fields

- Short Label
- Supersedes
- Related Claim

Allowed Labels

- claim
- proposition
- hypothesis
- conjecture
- thesis
- theorem-like
- lemma-like
- corollary-like
- answer-candidate
- model-claim
- measurement-claim
- interpretation-claim
- counterclaim
- unknown

Rules

- `Claim Name` should be stable enough for a human-readable list, proof surface, audit report, or review index.
- `Claim Kind` should describe the role of the claim without proving its status.
- `Claim State` should describe the claim lifecycle or review state, not truth outside the stated boundary.
- `Canonical Identifier` should be stable enough for relation, derivation, evidence, validation, and audit references.

### Claim Statement

Required Fields

- Claim
- Plain-Language Meaning

Optional Fields

- Original Wording
- Normalized Wording
- Formal Statement
- Language
- Terms
- Symbols

Rules

- `Claim` must preserve the asserted statement in human-readable form.
- `Plain-Language Meaning` should explain the claim without requiring a specialized notation system.
- `Formal Statement` may include mathematical, logical, schema, or domain notation when useful, but it must not replace human-readable meaning.
- Normalization must not silently change scope, conditions, quantifiers, or implied claims.

### Claim Boundary

Required Fields

- Scope
- Applies When
- Does Not Apply When

Optional Fields

- Conditions
- Assumptions
- Domain
- Time Window
- Target Artifacts
- Target Sources
- Unknowns
- Dependencies

Rules

- `Scope` must bound what the claim is about.
- `Applies When` should state conditions or contexts where the claim is intended to hold.
- `Does Not Apply When` should state important exclusions, counter-boundaries, or cases not covered.
- A conditional claim should reference or embed condition semantics clearly enough that a later reader can tell which assumptions matter.

### Support And Challenge

Required Fields

- Support State
- Support Boundary
- Challenge Boundary

Optional Fields

- Supporting Evidence
- Supporting Derivation
- Supporting Validation
- Supporting Attestation
- Challenging Evidence
- Challenging Derivation
- Counterclaim
- Review State

Allowed Labels

- proposed
- unsupported
- supported
- challenged
- derived
- validated
- refuted
- disputed
- superseded
- withdrawn
- unresolved
- unknown

Rules

- `Support State` must not be stronger than the referenced evidence, derivation, validation, attestation, or review artifacts support.
- `Support Boundary` should state what kind of support exists or is missing.
- `Challenge Boundary` should state known counterexamples, disputes, missing support, or reasons not to overclaim the claim.
- A claim may be supported in one boundary and unresolved or challenged in another.

### Interpretation Limits

Required Fields

- Does Not Prove
- Must Not Be Inferred

Optional Fields

- Remaining Unknowns
- Overclaim Risks
- Review Notes

Rules

- A claim must not imply truth merely because it is stated.
- A claim must not imply proof, evidence, validation, consensus, authorship, authority, or consent unless separately supported by the appropriate artifact and method.
- A claim must not hide assumptions, quantifier limits, domain limits, or unresolved challenge states when those affect interpretation.

## Artifact Creation Contract

### Creation Scope

Required Fields

- Create When
- Do Not Create When

Rules

- Create a `tiinex.claim.v1` artifact when a bounded assertion, hypothesis, proposition, theorem-like statement, answer candidate, or counterclaim needs to travel as provenance.
- Do not create a claim artifact merely for ordinary prose unless preserving the assertion boundary matters.
- Do not use a claim artifact as a substitute for evidence, derivation, validation report, attestation, decision, or relation artifacts.

### Required Inputs

Required Fields

- Claim
- Plain-Language Meaning
- Scope
- Applies When
- Does Not Apply When
- Support Boundary
- Interpretation Limits

Optional Fields

- Related Question
- Conditions
- Assumptions
- Supporting Evidence
- Supporting Derivation
- Supporting Validation
- Challenging Evidence
- Counterclaim

Rules

- Missing support or challenge context should be explicit as unknown, unresolved, or unavailable.
- Formal notation should be accompanied by human-readable meaning when the notation is not universally readable.
- Support state should remain bounded to the actual referenced support.

### Generation Rules

Rules

- State the claim before stating support or conclusion status.
- Separate claim text from assumptions, derivation, evidence, and validation.
- Link companion artifacts rather than absorbing their semantics into the claim artifact.
- State what must not be inferred from the existence of the claim.

### Suggested Sequence

Rules

- Identify the claim.
- Identify the claim kind and current state.
- State the claim in human-readable form.
- Bound where it applies and where it does not apply.
- State support and challenge boundaries.
- Link related questions, conditions, evidence, derivations, validations, or counterclaims when available.
- State interpretation limits.

## Validation-Friendly Shape

A validator can check this schema family by looking for:

- continuity envelope with `Current Schema: tiinex.claim.v1`
- required claim body sections
- claim identity fields
- human-readable claim statement
- claim boundary with applies and does-not-apply fields
- support and challenge boundary
- interpretation limits
- absence of evidence, derivation, validation, attestation, decision, or truth overclaims unless separately referenced

## Minimal Example

```md
# Continuity Context

- Current
  - Current Schema: [tiinex.claim.v1](tiinex.claim.v1.schema.md)
  - Created At: 2026-07-02 00:00:00
  - Summary: Claim that a portal fallback cannot prove historical completeness.

---

# Current web fallback does not prove historical source completeness

## Claim Identity

Claim Name: Current web fallback completeness limit
Claim Kind: proposition
Claim State: proposed
Canonical Identifier: claim.portal.current-web-completeness-limit.v1

## Claim Statement

Claim: Current web state used as a fallback does not prove historical source completeness at artifact creation time.
Plain-Language Meaning: Seeing a source today is not enough to know the source looked the same when the artifact was created.

## Claim Boundary

Scope: Portal source-resolution and audit interpretation
Applies When: a current web view is used because no stronger historical source anchor is available
Does Not Apply When: a resolved source snapshot or commit-pinned anchor proves the relevant source state within its own boundary

## Support And Challenge

Support State: proposed
Support Boundary: supported by portal time interpretation rules if they are accepted
Challenge Boundary: could be narrowed by a stronger preservation or source-resolution method

## Interpretation Limits

Does Not Prove: source truth, authorship, consent, or repository completeness
Must Not Be Inferred: that all current web fallbacks are invalid or useless
```

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.root.v1.schema.md](https://github.com/Tiinex/docs/blob/78a3673444666f1145be4feca6e7eb1476a44281/.topics/.schemas/tiinex.root.v1.schema.md)
  - Value: BFWYft1v0Ue0gUoO236DGScvnixS7_MIEwO6mhJhkNw

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: ocv6EBAm4E1aHXW7OlMP2Eu5VvxVaKX3weiTukpFOGc