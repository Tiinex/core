# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/668753e47a281db060cb74ef957683f4f773b3a4/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/668753e47a281db060cb74ef957683f4f773b3a4/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-29 15:14:48
  - Trace: [027-1-1-1-1-1-bootstrap-runtime-composition-identity-and-comparison-guidance.trace.md](../027-1-1-1-1-1-bootstrap-runtime-composition-identity-and-comparison-guidance.trace.md)
  - Origin:
    - [relative](../027-1-1-1-1-1-bootstrap-runtime-composition-identity-and-comparison-guidance.trace.md)
- Current
  - Current Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/668753e47a281db060cb74ef957683f4f773b3a4/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-09-29 15:30:46
  - Authors: Anchor
  - Why: Preserve exact evidence that bootstrap comparison can avoid redundant rereading without inventing semantic succession from timestamps, package versions, hashes, or arrival order.
  - Summary: Qualified bootstrap bundle/composition identity, version dependency projection, comparison guidance, legacy compatibility, and Core non-regression.
  - Status: ready/local

---

# Bootstrap Runtime Composition Identity And Comparison Qualification

## Supported Claim Or Question

- Supported Claim Or Question: whether a portable Tiinex bootstrap can expose truthful bundle-manufacture facts, exact runtime-composition identity, and complete local schema/companion composition so a human or LLM can compare runtimes without rereading byte-identical material or inventing semantic succession.
- Evidence Role: qualifies Task `027-1-1-1-1-1` implementation, comparison boundaries, backward compatibility, standalone bootstrap transport guidance, and Core non-regression.

## Provenance

- Known Source: exact qualified Core Workspace carried by Handoff 082 and modified locally only under Sigma's explicit authorization for Task `027-1-1-1-1-1`.
- Preservation Basis: exact local source bytes; focused manifest/version/package regressions; two independently manufactured standalone bootstrap carriers; extracted-bootstrap `version --json` comparison; full Core regression; portable smoke; embedded bootstrap qualification; native schema drift check; and npm package dry-run.
- Provenance Limits: no remote mutation, commit, push, npm publication, release, deployment, Docs mutation, VS Code extension repository mutation, global bootstrap succession rule, or authority choice between non-identical runtime compositions was performed.

## Evidence Material

- Material: bootstrap manifest v2 comparison identity, portable `version` projection, Package V1 bootstrap descriptor/Start/transport guidance, LLM bootstrap guidance, and focused/full regression coverage.
- Material Kind: portable bootstrap identity/composition metadata, read-only comparison UX, canonical Package V1 transport guidance, and qualification evidence.
- Build Identity: bootstrap manifest v2 records `build.createdAt` as the exact bundle manufacture timestamp, labels its meaning `bootstrap-bundle-manufacture-time`, and fixes `orderingAuthority: none`; the timestamp is a comparison fact only and never semantic succession authority.
- Core Identity: the manifest records the embedded runtime package name/version and bootstrap inspection requires them to equal the exact carried runtime `package.json`.
- Composition Identity: `composition.sha256` equals the existing exact digest over the manifest-declared runtime representation entries. The manifest itself is outside that representation digest, so rebuild timestamp changes do not change composition identity when runtime bytes are otherwise identical.
- Version Surface: extracted bootstrap Tooling exposes `version`, `version --tree`, and `version --json` without network access. Human output reports bundle state/time, Core package identity, composition digest, runtime size/count, Schema Pack source/count, companion counts, and comparison limits; tree mode expands all schema Parent relations and companion modes/facets; JSON mode exposes the stable machine-readable receipt.
- Dependency Projection: the qualified native runtime reports one `Tiinex/docs@668753e47a281db060cb74ef957683f4f773b3a4` Schema Pack with 106 schemas, each schema's Parent/source SHA-256/Git blob identity, and companion mode/facets; 25 schemas are specialized and 81 use the generic companion mode.
- Source Runtime Boundary: invoking `version --json` directly from the Core checkout reports `source-runtime-unbundled`, no build timestamp, and no bootstrap composition digest rather than inventing bundle identity.
- Legacy Compatibility: a synthetic legacy manifest v1 built from otherwise exact current runtime bytes remains valid and is reported as `legacy-derived-composition-only`; no build timestamp or new comparison authority is fabricated for historical bootstrap material.
- Package Guidance: bootstrap-only Start, adjacent transport text, and embedded LLM bootstrap guidance recommend optional `version --json` composition comparison before broad runtime/schema/companion rereading, while keeping `orient` as the first semantic package operation and explicitly denying semantic supersession from build time, Core version, bootstrap SHA, or arrival order alone.
- Canonical Manufacture Boundary: standalone bootstrap export continues to invoke the existing `manufacture-handoff-package --carrier-mode bootstrap` Package V1 path. Its descriptor now preserves bundle `Created At`, Core producer identity, runtime composition SHA-256, comparison command, and ordering boundary without introducing a second carrier renderer.
- Two-Build Dogfood: two independently manufactured standalone carriers from the same Core source had distinct carrier SHA-256, bootstrap ZIP SHA-256, manifest SHA-256, and build timestamps, while both reported Core `@tiinex/core 0.1.1`, 580 runtime files, 106 schemas, 25 specialized/81 generic companions, and identical composition SHA-256 `2151a315546e9530505141c007d236d30db45bfc6724e4872379de69bb657655`.
- Focused Qualification: bootstrap/version/package-focused regressions passed 51/51, including manifest v2 identity, v1 compatibility, extracted version projection, standalone transport guidance, and existing Package V1 behavior.
- Full Core Regression: `npm test` passed 310 tests with zero failures and zero skips.
- Portable Smoke: `npm run test:portable` passed with `portable node surface imports`.
- Embedded Bootstrap Qualification: `npm run test:bootstrap` returned `embedded-qualified`, composition SHA-256 `2151a315546e9530505141c007d236d30db45bfc6724e4872379de69bb657655`, 580 runtime files, and 8,591,066 runtime bytes; build timestamp remained explicitly non-ordering.
- Native Schema Check: `schemas check` against the exact local Docs snapshot at commit `668753e47a281db060cb74ef957683f4f773b3a4` reported 106 schemas, 184 expected generated files, zero drift, and zero findings.
- Npm Package Dry Run: the package candidate contained 622 files, included `src/tooling/portable/adapters/cli/cli.version.js` and `tools/build-bootstrap-carrier.mjs`, and contained zero ZIP outputs.

## Preservation And Fidelity

- Preservation State: the bootstrap comparison surface preserves exact bundle and runtime-composition facts while leaving semantic runtime selection to qualified surrounding Task/Handoff/source authority.
- Fidelity Notes: equality of `composition.sha256` means equality only of the exact manifest-declared runtime representation; it does not prove identical chat context, Task authority, source freshness, or semantic succession. Different composition requires inspection rather than automatic replacement.
- Known Losses: no global ordering is intentionally encoded. Forked or independently composed bootstraps may have incomparable Core/schema/companion worlds and must remain distinguishable rather than forced into one revision sequence.

## Interpretation Limits

- Not Yet Used As: global bootstrap revisioning, `Supersedes` lineage, automatic runtime replacement policy, external schema-pack implementation, schema-builder authority, publication authority, or release authority.
- Does Not Prove: that a later build is semantically newer, that a greater Core version supersedes a fork, that different ZIP bytes imply different runtime composition, or that equal composition preserves unrelated task/source authority.
- Must Not Be Treated As: permission to skip carrier orientation, infer authority from version metadata, fetch network material, or broadly trust a differently composed runtime without inspecting its projected dependency facts.
- Operational Boundary: `version` is a local read-only comparison command; Package V1 orientation and subsequent qualified grounding remain the semantic authority path.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [027-1-1-1-1-1-bootstrap-runtime-composition-identity-and-comparison-guidance.trace.md](../027-1-1-1-1-1-bootstrap-runtime-composition-identity-and-comparison-guidance.trace.md)
  - Value: LEAH5Hx5zeGAtRLLtelHyK0KGu65uAcHOVeicLKA00I

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 9Xjrg3P48_L12nllcQO55JrZSwbfA0jm14YUKKgL8Y8