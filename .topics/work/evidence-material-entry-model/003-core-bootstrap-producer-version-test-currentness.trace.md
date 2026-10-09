# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: tiinex.evidence.v1
  - Created At: 2026-10-09 10:48:06
  - Authors: Anchor
  - Why: Keep the full Core regression meaningful without mutating package authority or runtime version.
  - Summary: Test-owned package producer identity now tracks actual qualified manifest version instead of a stale hard-coded revision.
  - Status: ready/local

---

# Core Bootstrap Producer Version Test Currentness

## Supported Claim Or Question

- Supported Claim Or Question: Does Core's bootstrap-carrier regression compare the actual executing package identity, rather than reject a valid carrier because the test fixture hard-coded an older package version?
- Evidence Role: source-owned test-currentness correction preserving actual Core version/source identity; not a runtime or Evidence schema change.

## Provenance

- Known Source: `test/bootstrap-carrier-export.test.mjs`, `package.json` in the same qualified Core Workspace, and the failing/passing test result from current source.
- Preservation Basis: exact test source and Core Workspace bytes included in canonical Tiinex carrier; test's declared package version is now read from actual manifest rather than fixed in a stale regex.
- Provenance Limits: current Core manifest uses version 999.0.0. This correction does not interpret why, authorize publication, or change version semantics.

## Evidence Material

- stale-producer-test
  - Material: [`test/bootstrap-carrier-export.test.mjs`](../../../test/bootstrap-carrier-export.test.mjs)
  - Material Kind: source-bound Core bootstrap regression
  - Description: The older test expected the Producer string `@tiinex/core 0.1.1`; the current qualified Core package contains a different version. The test now reads the exact local `package.json` version and compares to what manufacture actually serialized, instead of replacing the running version or weakening carrier inspection.
  - Material Provenance: positive Core bootstrap export test with its Package V1 manufacture and roundtrip gates unchanged.
  - Material Limits: no claim that a manifest version value is appropriate for a product release is made.
- exact-manufacture-verification
  - Material: Bootstrap-carrier targeted regression passed all 4 tests with current Core source after correcting the stale assertion.
  - Material Kind: executable regression
  - Description: Exact ZIP package inspection and bootstrap identity checks retain their original assertions; only the stale expected version literal was replaced by local runtime manifest identity.
  - Material Provenance: current Core test executed with qualified Native and Business source.
  - Material Limits: targeted test does not replace the full Core suite.

## Preservation And Fidelity

- Preservation State: one bounded Core test correction, no Core semantic/runtime changes.
- Fidelity Notes: the test checks the real executing Producer identity rather than an invented historical one.
- Known Losses: full dependency-backed VS Code TypeScript build and Windows host acceptance remain separate.

## Interpretation Limits

- Does Not Prove: changed Evidence schema semantics, release publication, Native Surface parity or Windows acceptance.
- Not Yet Used As: launch clearance.
- Must Not Be Treated As: a reason to change the version of an installed Core package or bypass canonical bootstrap qualification.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: jLIzk78rmkYbuxvnSSYRqMGIHCZIaUochdzJU5r-Hnw