# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.schema.contract.v1](../tiinex.schema.contract.v1.schema.md)
  - Created At: 2026-07-02 00:00:00
  - Trace: [tiinex.schema.contract.v1.schema.md](../tiinex.schema.contract.v1.schema.md)
  - Origin:
    - [relative](../tiinex.schema.contract.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/2fd6c18cba67d4848a96a82c631a890a21001ae1/.topics/.schemas/schema/contract/tiinex.schema.contract.v1.schema.md)
- Current
  - Current Schema: [tiinex.schema.rule.v1](tiinex.schema.rule.v1.schema.md)
  - Created At: 2026-07-02 00:00:00
  - Status: Draft schema proposal
  - Why: Defines rule-level contract nodes so requiredness, forbiddance, allowed values, conditions, severities, and messages can be checked by reliable tooling without reinterpreting prose.
  - Summary: Schema rule contract for deterministic or bounded validation and generation rules.

---


# Schema Rule

## Summary

Defines a contract for one schema rule.

A schema rule says what must, may, should, should not, or must not happen within a bounded schema target. It may be used by validators, builders, generators, linters, human reviewers, or LLM reviewers. A rule can be deterministic, partly deterministic, or human-reviewed, but its boundary must be explicit.

Schema rule does not make every semantic judgement executable. It describes a bounded rule surface and its expected handling.

## Core Semantics

- Schema rule = target-bound obligation, warning, prohibition, implication, or check.
- Rule target, condition, operator, severity, and message should be explicit.
- A rule may fail, warn, skip, or require review depending on its method boundary.
- Rules must not silently validate truth, evidence, consent, identity, or source completeness unless a separate method supports that.
- Rules should be small enough to test and explain.

## Schema Validation Contract

### Rule Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.schema.rule.v1`

Rules

- `tiinex.schema.rule.v1` identifies a contract node for one bounded schema rule.
- Rule artifacts must preserve rule identity, target, condition or applicability, operator, severity, message, method boundary, and interpretation limits.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Rule Body

Required Shape

- first body heading after the continuity envelope
- `## Rule Identity` section
- `## Rule Target` section
- `## Rule Logic` section
- `## Rule Result` section
- `## Rule Boundary` section
- `## Interpretation Limits` section

Optional Sections

- `Condition Binding`
- `Value Binding`
- `Examples`
- `Relationship to Other Schemas`

Rules

- Rule logic should be expressed as fields rather than hidden prose where deterministic tooling is expected.
- Rules that require human or LLM judgement must say so.

### Rule Identity

Required Fields

- Rule Handle
- Rule Name
- Rule Kind

Optional Fields

- Rule Version
- Rule Owner
- Rule Stability
- Rule Family

Allowed Labels

- required
- forbidden
- allowed-values
- cardinality
- format
- pattern
- implies
- excludes
- depends-on
- relation-required
- lint-warning
- generation-rule
- human-review
- unknown

Rules

- Rule Handle is scoped to the target contract and should remain unique there; it may remain stable across revisions while it denotes the same semantic rule, and checksum/fingerprint changes do not automatically supersede it.
- Rule kind should identify the expected operator family.

### Rule Target

Required Fields

- Applies To
- Target Schema

Optional Fields

- Target Section
- Target Field
- Target Value
- Target Relation
- Target Artifact Region

Rules

- Applies To must identify the object checked by the rule.
- Rule targets should reference section, field, value, relation, or schema contract handles or fingerprints when available.

### Rule Logic

Required Fields

- Operator

Optional Fields

- Condition
- Expected Value
- Forbidden Value
- Allowed Values
- Minimum Count
- Maximum Count
- Pattern
- Relation Type
- Compared To
- Human Review Prompt

Allowed Labels

- required
- forbidden
- equals
- not-equals
- one-of
- none-of
- contains
- does-not-contain
- matches-pattern
- cardinality
- implies
- excludes
- depends-on
- requires-review
- unknown

Rules

- Operator must be explicit.
- Conditions should reference `condition` or another rule when condition logic is non-trivial.
- Unknown operators must not be treated as pass by deterministic tooling.

### Rule Result

Required Fields

- Severity
- Message

Optional Fields

- Pass Message
- Fail Message
- Warning Message
- Suggested Repair
- Report Code

Allowed Labels

- fail
- warning
- info
- style-warning
- skipped
- unknown
- human-review

Rules

- Severity must describe rule result handling, not truth.
- Message should be understandable to a human author.
- Suggested repair must not mutate artifacts silently.

### Rule Boundary

Required Fields

- Method Boundary
- Deterministic State

Optional Fields

- Requires Human Review
- Requires LLM Review
- Requires Source Resolution
- Requires Adapter
- Unknown Handling

Allowed Labels

- deterministic
- bounded-static
- source-dependent
- adapter-dependent
- human-reviewed
- llm-assisted
- unknown

Rules

- Deterministic state must disclose whether a non-LLM tool can run the rule directly.
- Source-dependent rules should report unavailable or unknown when source access is missing.
- LLM-assisted rules must not be reported as deterministic pass unless the rule also has a deterministic check.

### Interpretation Limits

Required Fields

- Does Not Mean
- Must Not Be Used To Claim

Optional Fields

- False Positive Risk
- False Negative Risk
- Missing Method

Rules

- A passed rule validates only the declared rule target and method boundary.
- A failed lint rule does not automatically make an artifact root-invalid unless severity says fail and the schema contract owns that failure.

## Artifact Creation Contract

### Creation Scope

Required Fields

- Create When
- Do Not Create When

Rules

- Create a schema rule when a validator, generator, builder, linter, or reviewer needs a stable rule with explicit target, logic, severity, and message.
- Do not create a schema rule for vague advice that cannot name target, operator, boundary, or expected handling.

### Required Inputs

Required Fields

- Rule Handle
- Rule Name
- Rule Kind
- Applies To
- Operator
- Severity
- Message
- Method Boundary
- Deterministic State
- Interpretation Limits

Optional Fields

- Condition
- Expected Value
- Allowed Values
- Suggested Repair
- Examples

Rules

- Prefer small composable rules.
- State when a rule is advisory rather than blocking.
- State unknown handling for source-dependent or LLM-assisted rules.

### Generation Rules

Rules

- Generate the rule in field form before writing prose explanation.
- Generate messages that tell authors what to do and what the rule does not prove.
- Do not generate hidden failure conditions outside the rule fields.

## Validation-Friendly Shape

- Rule Handle, target, operator, severity, message, and deterministic state should be extractable as fields.
- Unknown operators or method boundaries should be reported as unknown, unavailable, skipped, or unconfirmed.
- Rule examples should identify expected outcomes when they are meant to test the rule.

## Minimal Example

```text
# Schema Rule: Annotation target required

## Rule Identity

Rule Handle: annotation-target-required
Rule Name: Annotation target is required
Rule Kind: required

## Rule Target

Applies To: field.target-identifier
Target Schema: tiinex.annotation.v1
Target Section: Annotation Target
Target Field: Target Identifier

## Rule Logic

Operator: required

## Rule Result

Severity: fail
Message: Annotation must identify what is annotated.
Suggested Repair: Add Target Identifier or mark target unknown when it cannot be resolved.

## Rule Boundary

Method Boundary: bounded-static
Deterministic State: deterministic

## Interpretation Limits

Does Not Mean: the target exists or is true
Must Not Be Used To Claim: annotation value has been verified
```

## Relationship to Other Schemas

- `condition` may define reusable conditional logic.
- `schema.field` and `schema.section` provide common rule targets.
- `schema.example` may test rule outcomes.
- `validation.report` records results from rule execution.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.schema.contract.v1.schema.md](https://github.com/Tiinex/docs/blob/2fd6c18cba67d4848a96a82c631a890a21001ae1/.topics/.schemas/schema/contract/tiinex.schema.contract.v1.schema.md)
  - Value: WvQKn9T_BRdSDy-v361mz-ICJttKiIpHH349XYSa90A

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: S7WGnZpT2zXXjFvM1ACDbRBsGijk2Lk4w-bkghW6L2M