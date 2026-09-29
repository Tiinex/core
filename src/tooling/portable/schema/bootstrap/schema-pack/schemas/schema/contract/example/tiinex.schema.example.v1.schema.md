# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.schema.contract.v1](../tiinex.schema.contract.v1.schema.md)
  - Created At: 2026-07-02 00:00:00
  - Trace: [tiinex.schema.contract.v1.schema.md](../tiinex.schema.contract.v1.schema.md)
  - Origin:
    - [relative](../tiinex.schema.contract.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/fb16e56aebd5afeb003a985ec44c8d8e98a6af3b/.topics/.schemas/schema/contract/tiinex.schema.contract.v1.schema.md)
- Current
  - Current Schema: [tiinex.schema.example.v1](tiinex.schema.example.v1.schema.md)
  - Created At: 2026-07-02 00:00:00
  - Status: Draft schema proposal
  - Why: Defines machine-checkable example contract nodes so schema builders and validators can test expected pass, fail, warning, skipped, or unknown outcomes without treating examples as hidden rules.
  - Summary: Schema example contract for validation, generation, lint, and repair examples with expected outcomes.

---


# Schema Example

## Summary

Defines a contract for a schema example with an expected reading or outcome.

A schema example may show a valid artifact fragment, invalid artifact fragment, warning case, generation input, generation output, relation case, inheritance merge case, or unknown/unavailable case. It helps humans and tools test whether a schema contract is understood.

Schema example is not automatically a rule. It becomes test-like only when the expected outcome and target contract are explicit.

## Core Semantics

- Schema example = bounded sample material plus expected reading or outcome.
- Examples may be illustrative, validation-oriented, generation-oriented, lint-oriented, or repair-oriented.
- Expected outcome must be explicit when tools are supposed to check the example.
- An example must not add hidden required rules beyond the declared schema contract.
- Examples should include negative and unknown cases where that helps protect against overclaim.

## Schema Validation Contract

### Example Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.schema.example.v1`

Rules

- `tiinex.schema.example.v1` identifies a contract node for a bounded schema example or expected outcome.
- Example artifacts must preserve example identity, target contract, example material, expected outcome, and interpretation limits.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Example Body

Required Shape

- first body heading after the continuity envelope
- `## Example Identity` section
- `## Example Target` section
- `## Example Material` section
- `## Expected Reading` section
- `## Expected Outcome` section
- `## Interpretation Limits` section

Optional Sections

- `Repair Expectation`
- `Generation Expectation`
- `Validation Binding`
- `Examples`
- `Relationship to Other Schemas`

Rules

- Expected outcome is required when the example is intended for tooling checks.
- Example material should be bounded so it is clear what is being tested.

### Example Identity

Required Fields

- Example Handle
- Example Name
- Example Kind

Optional Fields

- Example Version
- Example Owner
- Example State

Allowed Labels

- positive
- negative
- warning
- unknown
- skipped
- generation-input
- generation-output
- repair
- inheritance
- relation
- illustrative

Rules

- Example kind should state how the example is intended to be used.
- Illustrative examples must not be treated as validation tests unless expected outcome is declared.

### Example Target

Required Fields

- Target Schema
- Target Contract

Optional Fields

- Target Rule
- Target Field
- Target Section
- Target Generator
- Target Relation
- Target Inheritance

Rules

- Target contract must identify what the example is testing or illustrating.
- If the target is broad, the expected reading should narrow the tested surface.

### Example Material

Required Fields

- Material Boundary
- Material

Optional Fields

- Material Format
- Omitted Context
- Setup
- Source

Rules

- Material boundary must state whether the material is a full artifact, fragment, field set, input set, or expected output.
- Omitted context should be explicit when the example is only a fragment.

### Expected Reading

Required Fields

- Expected Reader Action

Optional Fields

- Expected Extracted Fields
- Expected Missing Fields
- Expected Rule Matches
- Expected Unknowns
- Expected Warnings

Rules

- Expected reading should state what a human or tool should extract or notice.
- Expected unknowns should be explicit where unknown handling is being tested.

### Expected Outcome

Required Fields

- Expected Status

Optional Fields

- Expected Severity
- Expected Message
- Expected Repair
- Expected Generated Output
- Expected Validation Report Entry

Allowed Labels

- pass
- fail
- warning
- style-warning
- skipped
- unavailable
- unknown
- human-review

Rules

- Expected status must use allowed labels when the example is tool-checkable.
- Expected outcome validates only the target contract being tested.

### Interpretation Limits

Required Fields

- Does Not Mean
- Must Not Be Used To Claim

Optional Fields

- Example Boundary
- Hidden Rule Risk

Rules

- Examples must not create hidden schema requirements.
- Passing an example set does not prove full schema correctness.

## Artifact Creation Contract

### Creation Scope

Required Fields

- Create When
- Do Not Create When

Rules

- Create a schema example when a rule, generator, relation, inheritance contract, or validator needs a stable example with expected outcome.
- Do not create a schema example for generic prose examples that are not meant to be checked or reused.

### Required Inputs

Required Fields

- Example Handle
- Example Kind
- Target Schema
- Target Contract
- Material Boundary
- Material
- Expected Reading
- Expected Status
- Interpretation Limits

Optional Fields

- Expected Message
- Expected Repair
- Setup
- Source

Rules

- Keep example material bounded and minimal.
- Include expected status for tool-checkable examples.
- Include negative examples for overclaim-prone rules when possible.

### Generation Rules

Rules

- Generate positive examples before negative examples only when that helps teaching; validators should not depend on example order unless declared.
- Do not let an example introduce a field or label not allowed by the target contract unless the expected outcome is fail or warning.

## Validation-Friendly Shape

- Example Handle, target contract, material boundary, and expected status should be extractable as fields.
- Example materials should be code-fenced or clearly bounded when multiline.
- Unknown and skipped examples should be preserved, not collapsed into failure.

## Minimal Example

```text
# Schema Example: Missing annotation target fails

## Example Identity

Example Handle: missing-annotation-target
Example Name: Missing annotation target fails
Example Kind: negative

## Example Target

Target Schema: tiinex.annotation.v1
Target Contract: annotation-target-required
Target Rule: annotation-target-required

## Example Material

Material Boundary: artifact fragment
Material: Annotation Kind: coordinate; Value: 55.604981, 13.003822

## Expected Reading

Expected Reader Action: detect missing Target Identifier
Expected Missing Fields: Target Identifier
Expected Rule Matches: annotation-target-required

## Expected Outcome

Expected Status: fail
Expected Severity: fail
Expected Message: Annotation must identify what is annotated.

## Interpretation Limits

Does Not Mean: the coordinate value is false
Must Not Be Used To Claim: the full annotation schema has been tested completely
```

## Relationship to Other Schemas

- `schema.rule` may define expected failures and warnings.
- `schema.generation` may use generation examples.
- `validation.report` may record actual outcomes from running examples.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.schema.contract.v1.schema.md](https://github.com/Tiinex/docs/blob/fb16e56aebd5afeb003a985ec44c8d8e98a6af3b/.topics/.schemas/schema/contract/tiinex.schema.contract.v1.schema.md)
  - Value: yCGI18q-fxkGW38djBw3L0UVrAv3bRm1VKz-bRdNUwA

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: Rf8ESVNpHkzCfvJazp0sKkrn9CgKRrjwKW8JpTD03ac