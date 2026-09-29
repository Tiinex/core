# Continuity Context

- Envelope Schema: [tiinex.root.v1](../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](../tiinex.root.v1.schema.md)
  - Created At: 2026-06-14 00:00:00
  - Trace: [tiinex.root.v1.schema.md](../tiinex.root.v1.schema.md)
  - Origin:
    - [relative](../tiinex.root.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/2a40646640f7468bcd250df6988b69e9f047f1bb/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.instrument.v1](tiinex.instrument.v1.schema.md)
  - Created At: 2026-06-29 00:00:00
  - Summary: Schema for formal or semi-formal instruments that carry terms, permissions, restrictions, obligations, rights, access, authority, or value-transfer boundaries.

---

# Instrument

- Status: maintained schema note

## Summary

This schema defines artifacts whose main job is to preserve an instrument: a formal or semi-formal arrangement, statement, record, or terms-bearing object that carries permissions, restrictions, obligations, rights, authority, access, value-transfer, or use boundaries.

An instrument is not the resource itself, the receipt of a resource, the use of a resource, an evidence bundle, or a legal proof by itself. It preserves the governing form or terms boundary that other artifacts may reference.

The base instrument schema exists so Tiinex can later add specialized instruments without forcing financial, consent, policy, license, permit, access, or legal semantics into unrelated resource or attestation schemas.

## Schema Validation Contract

### Instrument Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.instrument.v1`

Rules

- `tiinex.instrument.v1` identifies artifacts centered on a bounded terms-bearing instrument.
- An instrument artifact should state the instrument identity, parties or authorities, terms, status, boundaries, and interpretation limits.
- Instrument artifacts may reference resource, contribution, receipt, allocation, usage, budget, consent, attestation, privacy, evidence, relation, external payload, or validation artifacts when those artifacts own companion semantics.
- An instrument artifact must not claim enforceability, legal compliance, identity, consent, receipt, ownership, accounting correctness, tax treatment, or factual truth unless those claims are separately supported.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Instrument Body

Required Shape

- first body heading after the continuity envelope
- `## Instrument Identity` section
- `## Parties Or Authorities` section
- `## Terms Or Permissions` section
- `## Status And Effect` section
- `## Boundaries` section
- `## Interpretation Limits` section

Optional Sections

- Related Resources
- Related Need
- Related Contribution
- Related Receipt
- Related Allocation
- Related Usage
- Related Budget
- Related Consent
- Evidence Basis
- Attestation Basis
- Privacy Boundary
- External Payloads
- References

Rules

- An instrument artifact should begin with a human-readable title.
- `Instrument Identity` must identify the instrument type or class and its bounded role.
- `Parties Or Authorities` must identify the involved parties, roles, authority basis, or bounded descriptors as safely as possible.
- `Terms Or Permissions` must state the terms, permissions, restrictions, rights, obligations, value-transfer rules, or use boundaries carried by the instrument.
- `Status And Effect` must state whether the instrument is proposed, offered, active, accepted, signed, revoked, expired, disputed, unknown, or otherwise bounded.
- `Boundaries` must state what the instrument does and does not govern.
- `Interpretation Limits` must state what the instrument artifact does not prove.

### Instrument Identity

Required Fields

- Instrument Type
- Instrument Role
- Instrument Status

Optional Fields

- Instrument Label
- Effective Date
- Expiry Date
- Related Artifact
- Related Digest
- Originating Context

Allowed Shapes

- `Instrument Type`: financial
- `Instrument Type`: consent
- `Instrument Type`: access
- `Instrument Type`: license
- `Instrument Type`: permit
- `Instrument Type`: policy
- `Instrument Type`: legal
- `Instrument Type`: contract
- `Instrument Type`: terms
- `Instrument Type`: other
- `Instrument Status`: proposed
- `Instrument Status`: offered
- `Instrument Status`: accepted
- `Instrument Status`: active
- `Instrument Status`: signed
- `Instrument Status`: revoked
- `Instrument Status`: expired
- `Instrument Status`: disputed
- `Instrument Status`: superseded
- `Instrument Status`: unknown

Rules

- `Instrument Type` must use one of the declared shapes so tools can group instrument classes without treating the vocabulary as exhaustive.
- `Instrument Status` must use one of the declared shapes and should not be inferred from private intention, silence, or nearby artifacts alone.
- Specialized descendants may define narrower instrument type vocabularies.

### Terms Or Permissions

Required Fields

- Terms Summary
- Allows
- Restricts
- Obligation Boundary

Optional Fields

- Prohibited Uses
- Required Actions
- Transfer Boundary
- Access Boundary
- Reporting Boundary
- Revocation Boundary
- Retention Boundary
- Jurisdiction Or Policy Context

Rules

- `Terms Summary` should preserve the practical meaning of the instrument in readable form.
- `Allows` must state what the instrument allows or explicitly state that allowed actions are unknown.
- `Restricts` must state what the instrument restricts or explicitly state that restrictions are unknown.
- `Obligation Boundary` must state any obligation, return, repayment, reporting, attribution, deletion, confidentiality, or unknown obligation boundary.
- The artifact should not turn a summary of terms into a claim that those terms are legally enforceable.

### Instrument Family Boundary

Rules

- Use `tiinex.instrument.v1` when the main artifact value is a general terms-bearing or authority-bearing instrument.
- Use `tiinex.instrument.financial.v1` when the main artifact value is a finance-shaped instrument such as a donation, grant, loan, equity-like investment, sponsorship, invoice, subscription, reimbursement, or internal transfer.
- Use `tiinex.instrument.consent.v1` when the main artifact value is permission, refusal, withdrawal, restriction, or consent-related use boundary.
- Do not use instrument artifacts as substitutes for evidence, attestation, receipt, allocation, usage, privacy boundary, accounting, legal compliance, or byte integrity artifacts.
- Candidate future children include access instruments, license instruments, permit instruments, policy instruments, legal instruments, and contract instruments, but those are intentionally not defined in this schema pass.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-instrument.trace.md`
- `<lineage>-<instrument-slug>.trace.md`

Rules

- Instrument artifacts should keep the lineage label first.
- The optional slug should identify the instrument class, target, counterparty role, or practical terms boundary.
- Instrument artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Instrument artifacts preserve terms, permission, authority, or obligation context; they do not prove enforceability, compliance, identity, receipt, ownership, or fulfillment by themselves.
- A referenced instrument may govern a resource flow without becoming the resource, contribution, receipt, allocation, usage, or budget artifact.
- Consent, financial, legal, access, policy, and license-like terms should remain distinguishable so later readers do not collapse them into generic statements.

## Minimal Example

```md
# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.instrument.v1
  - Created At: 2026-06-29 00:00:00
  - Summary: Instrument boundary for a temporary access arrangement.

---

# Temporary Workspace Access Instrument

## Instrument Identity

- Instrument Type: access
- Instrument Role: temporary workspace access boundary
- Instrument Status: proposed

## Parties Or Authorities

- Provider Role: workspace owner descriptor
- Recipient Role: project maintainer descriptor

## Terms Or Permissions

- Terms Summary: limited access for one validation session
- Allows: validation work inside the named workspace
- Restricts: no public disclosure of private workspace contents
- Obligation Boundary: access should be revoked after the session

## Status And Effect

- Status And Effect: proposed; not yet accepted or active

## Boundaries

- Boundaries: this artifact records the terms shape only; it does not prove access was granted

## Interpretation Limits

- Interpretation Limits: this artifact does not prove identity, legal enforceability, consent, or receipt of access
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

- instrument is the terms-bearing primitive, not the resource or event primitive
- financial instruments and consent instruments are first children because they are already needed by the current schema refactor
- future instrument children should be added only when real artifacts need them
- instrument artifacts should reference companion evidence, attestation, consent, privacy, receipt, budget, allocation, or usage artifacts rather than absorbing those meanings

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

- The current instrument create surface uses version `1`.
- `createTitle` should label the create action as `Create Instrument`.
- `summaryPrompt` should ask for the instrument title.
- `summaryPlaceholder` should guide the user toward the terms, permission, or authority boundary.

### Template Body

Required Shape

- first heading uses `# {summary}`
- `## Instrument Identity` section
- `## Parties Or Authorities` section
- `## Terms Or Permissions` section
- `## Status And Effect` section
- `## Boundaries` section
- `## Interpretation Limits` section

Rules

- Generated instrument artifacts should begin with the instrument title as the first body heading.
- Generated instrument artifacts should preserve terms or permission boundaries without claiming enforceability or fulfillment.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.root.v1.schema.md](https://github.com/Tiinex/docs/blob/2a40646640f7468bcd250df6988b69e9f047f1bb/.topics/.schemas/tiinex.root.v1.schema.md)
  - Value: BFWYft1v0Ue0gUoO236DGScvnixS7_MIEwO6mhJhkNw

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: QEwNHCf03xsYGHv3bpz0r3MIVwqhq7xQj5GNCauhKLA