# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/668753e47a281db060cb74ef957683f4f773b3a4/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.reduction.v1](https://github.com/Tiinex/docs/blob/668753e47a281db060cb74ef957683f4f773b3a4/.topics/.schemas/reduction/tiinex.reduction.v1.schema.md)
  - Created At: 2026-09-25 16:47:43
  - Trace: [003-real-two-leaf-reduction.trace.md](003-real-two-leaf-reduction.trace.md)
  - Origin:
    - [relative](003-real-two-leaf-reduction.trace.md)
- Current
  - Current Schema: [tiinex.redaction.v1](https://github.com/Tiinex/docs/blob/668753e47a281db060cb74ef957683f4f773b3a4/.topics/.schemas/reduction/redaction/tiinex.redaction.v1.schema.md)
  - Created At: 2026-09-25 17:59:40
  - Authors: Anchor
  - Why: Qualify exact Redaction authoring and Reduction-family composition without destructive authority.
  - Summary: Tooling-produced Redaction over an accepted Reduction source.
  - Status: ready/local

---

# Public-Safe Reduction Proof Redaction

## Source Context

- Source: [Real Two-Leaf Reduction Recovery Proof](003-real-two-leaf-reduction.trace.md)
- Source Boundary: local qualification evidence containing exact repository paths, commit-pinned locators, and concrete historical leaf identities

## Redaction Action

- Redaction Type: generalization
- Redaction Reason: downstream review needs the qualified behavior result without carrying exact historical source-locator details forward
- Redaction Target: exact repository paths, commit identifiers, and historical leaf identities contained in the source proof

## Carry-Forward State

- Remaining Material: the proof established one-leaf and multi-leaf Reduction recovery, Parent traversal, shared-middle deduplication, and fail-closed immutable-source handling
- Carry-Forward Claim: later work may rely on the qualified Reduction behavior result, but not on the omitted exact historical source identities or locator values
- Redacted Output: this bounded Redaction artifact

## Loss And Uncertainty

- Removed Or Transformed Material: exact commit identifiers, repository-relative source paths, and named historical leaf identities are generalized away
- Loss Description: the exact historical proof inputs cannot be reconstructed from this Redaction artifact alone; recovery requires the declared source

## Residual Risk

- Residual Disclosure Risk: unknown
- Reidentification Risk: unknown
- Recovery Risk: source remains locally recoverable through the declared Source Context edge

## Validation

- Validation Status: machine-checked
- Validation Method: exact Tiinex Redaction schema validation, c14n-v2 integrity verification, and common author staging; the artifact is retained only if those checks pass
- Validation Limits: this validates Tiinex representation and lineage behavior only; it does not establish privacy, anonymity, legal compliance, or consent

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [003-real-two-leaf-reduction.trace.md](003-real-two-leaf-reduction.trace.md)
  - Value: SpQiPgcn_Xkj3eYGYB5eRlWZfadOM2zWUvFwR2p45jY

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 5WPLw1Es6hZVZM_upPT5-Xe49XzHgnDW3dFE4SBLmPY
