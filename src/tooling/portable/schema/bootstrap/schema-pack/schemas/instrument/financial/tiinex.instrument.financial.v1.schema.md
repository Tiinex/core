# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.instrument.v1](../tiinex.instrument.v1.schema.md)
  - Created At: 2026-06-29 00:00:00
  - Trace: [tiinex.instrument.v1.schema.md](../tiinex.instrument.v1.schema.md)
  - Origin:
    - [relative](../tiinex.instrument.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/40aa94d7e52a348f9d9fa84754dedff422373689/.topics/.schemas/instrument/tiinex.instrument.v1.schema.md)
- Current
  - Current Schema: [tiinex.instrument.financial.v1](tiinex.instrument.financial.v1.schema.md)
  - Created At: 2026-06-29 00:00:00
  - Summary: Schema for bounded financial instruments such as donations, grants, loans, equity, sponsorships, invoices, subscriptions, reimbursements, or internal transfers without replacing legal, tax, accounting, or securities records.

---

# Financial Instrument

- Status: maintained schema note

## Summary

This schema narrows `tiinex.instrument.v1` for artifacts whose main job is to preserve a bounded financial instrument or finance-shaped support arrangement.

It exists so organizations can map donations, grants, sponsorships, loans, equity-like investments, convertible notes, SAFEs, revenue share, invoices, reimbursements, subscriptions, purchase orders, or internal transfers into Tiinex provenance without making all resources financial.

A financial instrument artifact preserves the instrument's readable terms and boundaries; it is not a contract, accounting ledger, tax record, securities filing, legal opinion, cap table, investment advice, or proof of receipt by itself.

## Schema Validation Contract

### Financial Instrument Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.instrument.financial.v1`

Rules

- `tiinex.instrument.financial.v1` identifies artifacts centered on a bounded financial instrument or finance-shaped support arrangement.
- A financial instrument artifact should state the instrument type, parties or roles, economic terms, authority and status, resource links, and interpretation limits.
- Financial instrument artifacts may reference resource needs, contributions, receipts, budgets, allocations, usage, evidence, attestation, privacy, consent, or external payload artifacts.
- A financial instrument artifact must not claim legal enforceability, accounting correctness, tax treatment, securities compliance, ownership transfer, investment suitability, or receipt unless those claims are separately supported.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Parent Body Specialization

Rules

- `tiinex.instrument.financial.v1` specializes the inherited `Instrument Body`.
- The child body replaces the parent body sections for artifacts whose current schema is `tiinex.instrument.financial.v1`.
- `Instrument Identity` preserves and narrows the inherited instrument identity.
- `Parties Or Roles` specializes `Parties Or Authorities`.
- `Economic Terms` specializes `Terms Or Permissions`.
- `Authority And Status` specializes `Status And Effect`.
- `Resource Links` specializes the resource-facing part of `Boundaries`.
- `Interpretation Limits` preserves inherited limits and adds finance/legal/accounting boundaries.

### Financial Instrument Body

Required Shape

- first body heading after the continuity envelope
- `## Instrument Identity` section
- `## Parties Or Roles` section
- `## Economic Terms` section
- `## Authority And Status` section
- `## Resource Links` section
- `## Interpretation Limits` section

Optional Sections

- Target Need
- Contribution Links
- Receipt Links
- Budget Links
- Allocation Links
- Usage Links
- Legal Or Policy Context
- Evidence Basis
- Attestation Basis
- External Payloads
- References

Rules

- A financial instrument artifact should begin with a human-readable title.
- `Instrument Identity` must identify the financial instrument type and bounded role.
- `Parties Or Roles` must identify involved contributors, recipients, issuers, payers, investors, sponsors, lenders, borrowers, customers, or bounded role descriptors as safely as possible.
- `Economic Terms` must state value, consideration, restrictions, repayment, ownership, revenue share, invoice, subscription, grant, donation, or other relevant terms when known.
- `Authority And Status` must state whether the instrument is proposed, offered, accepted, signed, active, funded, fulfilled, canceled, expired, disputed, or unknown.
- `Resource Links` must connect the instrument to resource need, contribution, receipt, budget, allocation, or usage artifacts when known.
- `Interpretation Limits` must state what the financial instrument artifact does not prove.

### Instrument Identity

Required Fields

- Instrument Type
- Instrument Role
- Instrument Status

Optional Fields

- Instrument Label
- Effective Date
- Expiry Date

Allowed Shapes

- `Instrument Type`: donation
- `Instrument Type`: grant
- `Instrument Type`: sponsorship
- `Instrument Type`: loan
- `Instrument Type`: equity
- `Instrument Type`: convertible-note
- `Instrument Type`: safe
- `Instrument Type`: revenue-share
- `Instrument Type`: purchase-order
- `Instrument Type`: invoice
- `Instrument Type`: reimbursement
- `Instrument Type`: subscription
- `Instrument Type`: internal-transfer
- `Instrument Type`: other
- `Instrument Status`: proposed
- `Instrument Status`: offered
- `Instrument Status`: accepted
- `Instrument Status`: signed
- `Instrument Status`: active
- `Instrument Status`: funded
- `Instrument Status`: fulfilled
- `Instrument Status`: canceled
- `Instrument Status`: expired
- `Instrument Status`: disputed
- `Instrument Status`: unknown

Rules

- `Instrument Type` must use one of the declared shapes so tools can group finance-shaped arrangements without treating the vocabulary as exhaustive.
- `Instrument Status` must use one of the declared shapes and should not be inferred from private agreement or intention alone.
- The artifact should distinguish proposed, offered, accepted, signed, funded, received, fulfilled, and disputed states.

### Economic Terms

Required Fields

- Value Or Consideration
- Use Boundary

Optional Fields

- Currency
- Amount
- Valuation Boundary
- Repayment Terms
- Ownership Terms
- Revenue Share Terms
- Restrictions
- Conditions
- Reporting Obligations
- Return Or Refund Conditions
- Legal Or Policy Context

Rules

- `Value Or Consideration` should state the economic value, non-monetary consideration, or unknown value boundary.
- `Use Boundary` should state what the instrument allows, restricts, or requires in relation to resource use.
- Legal terms, securities implications, tax effects, accounting classification, ownership rights, and enforceability should be treated as interpretation limits unless supported by appropriate legal, accounting, evidence, or attestation artifacts.

### Resource Links

Optional Fields

- Related Need
- Related Contribution
- Related Receipt
- Related Budget

Rules

- Resource-link fields should point to need, contribution, receipt, budget, allocation, or usage artifacts when those artifacts exist.
- Absence of a particular related-resource link must not be filled by guessing from path, title, or neighboring artifacts.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-financial-instrument.trace.md`
- `<lineage>-<instrument-slug>.trace.md`

Rules

- Financial instrument artifacts should keep the lineage label first.
- The optional slug should identify the instrument type, counterparty role, or target need.
- Financial instrument artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.instrument.financial.v1` when the main artifact value is a financial instrument or finance-shaped support arrangement.
- Do not use `tiinex.instrument.financial.v1` as a substitute for resource needs, contributions, receipts, budgets, allocations, usage records, accounting ledgers, tax records, legal contracts, cap tables, securities filings, investment decisions, or legal opinions.
- Do not use `tiinex.instrument.financial.v1` to claim a contribution was received unless a receipt artifact or evidence basis supports receipt.
- Financial instrument artifacts should preserve finance provenance without presenting financial, tax, investment, or legal advice.

## Minimal Example

```md
# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.instrument.financial.v1
  - Created At: 2026-06-29 00:00:00
  - Summary: Grant-style funding instrument for one resource need.

---

# Validation Hardware Grant Instrument

## Instrument Identity

- Instrument Type: grant
- Instrument Role: financial support for a bounded hardware resource need
- Instrument Status: offered

## Parties Or Roles

- Provider Role: bounded donor or grant provider descriptor
- Recipient Role: project maintainer or organization descriptor

## Economic Terms

- Value Or Consideration: monetary support for one hardware purchase, amount pending confirmation
- Use Boundary: use only for the referenced validation hardware need

## Authority And Status

- Authority And Status: offered but not yet received
- Evidence Basis: provider message or grant offer artifact

## Resource Links

- Related Need: validation-hardware-need.trace.md
- Related Contribution: not yet created
- Related Receipt: not yet received

## Interpretation Limits

- Interpretation Limits: this instrument preserves the finance-shaped offer boundary; it is not a contract, receipt, tax record, or accounting ledger
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

- financial instrument is a child of instrument, not a child of resource
- resource artifacts can reference financial instruments when resource flow is governed by finance-shaped terms
- a financial instrument does not prove receipt; use `tiinex.resource.contribution.receipt.v1` when receipt is the main value
- finance-shaped support should remain distinguishable from budgets, allocations, usage, accounting, contracts, tax, and cap-table records

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

- The current financial instrument create surface uses version `1`.
- `createTitle` should label the create action as `Create Financial Instrument`.
- `summaryPrompt` should ask for the instrument title.
- `summaryPlaceholder` should guide the user toward donation, grant, loan, equity, invoice, subscription, or another financial form.

### Template Body

Required Shape

- first heading uses `# {summary}`
- `## Instrument Identity` section
- `## Parties Or Roles` section
- `## Economic Terms` section
- `## Authority And Status` section
- `## Resource Links` section
- `## Interpretation Limits` section

Rules

- Generated financial instrument artifacts should begin with the instrument title as the first body heading.
- Generated financial instrument artifacts should classify the finance-shaped form without implying legal or accounting completeness.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.instrument.v1.schema.md](https://github.com/Tiinex/docs/blob/40aa94d7e52a348f9d9fa84754dedff422373689/.topics/.schemas/instrument/tiinex.instrument.v1.schema.md)
  - Value: cTDOjKzeDs_d2I6qW-RbSs6KXWeONhVvDUDfH5uJ_uI

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: tyoUJblttzXOmrkxJFa5XSRR9-oBTcD8sWHmwg13p0c