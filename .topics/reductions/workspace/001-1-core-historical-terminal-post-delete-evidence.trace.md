# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.reduction.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/reduction/tiinex.reduction.v1.schema.md)
  - Created At: 2026-10-03 09:46:09
  - Trace: [001-core-historical-terminal-reduction.trace.md](001-core-historical-terminal-reduction.trace.md)
  - Origin:
    - [relative](001-core-historical-terminal-reduction.trace.md)
- Current
  - Current Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-10-03 09:46:45
  - Authors: Anchor
  - Summary: Verify exact local removal of the 15 qualified Core historical candidates with no collateral trace mutation.
  - Status: ready/local

---

# Core Historical Terminal Branch Post-delete Evidence

## Supported Claim Or Question

- Supported Claim Or Question: whether the exact 15 Core candidates qualified by the local Core Reduction and destructive preflight were removed without collateral trace mutation
- Evidence Role: post-apply verification for the Core cleanup batch

## Provenance

- Known Source: carrier Major 015 Core bytes, immutable `Tiinex/core@4d5e55f649a5a3d7284128fe531dd4fe8e5ab014`, qualified Core Reduction, and Core destructive-preflight receipt
- Preservation Basis: carrier-015 Core `.topics` tree exactly matched immutable Git before mutation; every candidate preimage was rechecked before deletion
- Provenance Limits: no remote Git/GitHub mutation or commit/push state is claimed

## Evidence Material

- Material Kind: post-delete exact Workspace verification
- Material: exactly 15 qualified Core historical candidates were removed; no non-candidate Core trace was removed or byte-changed
- Removed Candidate Count: 15
- Remaining Candidate Count: 0
- Unexpected Removal Count: 0
- Non-candidate Byte Change Count: 0
- Core Preflight: `preflight-qualified`; composition `qualified`; destructive eligibility `eligible`; blockers/missing/ambiguities `0/0/0`
- Immutable Recovery: exact removed paths remain listed in the surviving Core Reduction and recoverable from the immutable Core snapshot

## Preservation And Fidelity

- Preservation State: current/non-terminal Core material, the local Core Reduction Task, surviving closure endpoints, and the project cleanup frontier remain present
- Fidelity Notes: deletion was exact-path and exact-preimage; post-delete audit compared all surviving pre-existing trace digests
- Known Losses: direct current-Workspace presence of the 15 historical traces is intentionally removed; immutable repository recovery remains available

## Interpretation Limits

- Not Yet Used As: authority for other Workspace candidate sets
- Does Not Prove: project-wide Reduction completion or remote commit state
- Must Not Be Treated As: permission to remove current/unresolved Core survivors or repair candidates

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-core-historical-terminal-reduction.trace.md](001-core-historical-terminal-reduction.trace.md)
  - Value: 7dyd_nPDQHEJ-S8dmLtSz4gfGFHRqki0Z6nN2sq-ncY

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: aBm2n96kHPxHMT3rTTzIIkQ199kRh3ixctizBTVexm4