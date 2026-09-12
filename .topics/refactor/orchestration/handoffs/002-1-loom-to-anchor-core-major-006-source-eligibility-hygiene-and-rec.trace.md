# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-12 00:50:12
  - Trace: [002-anchor-to-loom-core-major-006-source-eligibility-hygiene-and-rec.trace.md](002-anchor-to-loom-core-major-006-source-eligibility-hygiene-and-rec.trace.md)
  - Origin:
    - [relative](002-anchor-to-loom-core-major-006-source-eligibility-hygiene-and-rec.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-12 01:06:38
  - Authors: Loom
  - Why: The bounded Core Major 006 implementation is complete and qualified; Anchor now needs the exact repaired source boundary, proof compatibility, and retained semantic-disposition limits.
  - Summary: Return the bounded Core source-eligibility repair, real Site-return regression, reconciliation/manufacture parity, qualification evidence, and full validation to Anchor.
  - Status: ready/local

---

# Loom To Anchor — Core Major 006 Source Eligibility Hygiene And Reconciliation Parity Return

## Handoff Parties

- Purpose: return the bounded Core Major 006 source-eligibility repair, real Site-return regression, manufacture/reconciliation parity, and full Core qualification to Anchor.
- From: Loom
- From Kind: role
- From Reference: [Loom Role](business::.topics/roles/001-3-loom-role.trace.md)
- To: Anchor
- To Kind: role
- To Reference: [Anchor Role — Successor Evolution Continuation](business::.topics/roles/001-1-1-1-anchor-successor-evolution-role.trace.md)

## Transfers

- shared-durable-source-eligibility-contract
  - Transfer Kind: work-and-responsibility
  - Description: Core now uses one host-neutral mechanical source-eligibility contract where manufacture, local enumeration, package/source-frontier comparison, reconciliation, and reconciliation manufacture requalification claim the same durable-source identity. The contract excludes Python `__pycache__` state and compiled `.pyc`/`.pyo` cache bytes while retaining ordinary `.py` source and operator-authored `_author_*.mjs` files.
  - Controlling Artifact: [Core Major 006 Qualification Evidence](../evidence/005-core-major-006-source-eligibility-hygiene-and-reconciliation-par.trace.md)
  - Boundary: the contract distinguishes eligible durable source from generated runtime/cache state mechanically; it does not infer semantic deletion, semantic merge correctness, ownership, or acceptance.
- real-site-return-reconciliation-repair
  - Transfer Kind: work-and-responsibility
  - Description: the exact Site-return failure shape is now covered by regression: a qualified historical package may still carry `tools/__pycache__/browser-smoke.cpython-313.pyc` as immutable transport Evidence, while the durable-source frontier excludes it. A sanitized candidate preserving every qualified durable incoming/current path reaches `manufacture-ready` with zero fake deletion dispositions for the generated cache byte.
  - Controlling Artifact: [Core Major 006 Qualification Evidence](../evidence/005-core-major-006-source-eligibility-hygiene-and-reconciliation-par.trace.md)
  - Boundary: historical carrier bytes are not rewritten; source eligibility affects only the claimed durable-source frontier used by current comparison/reconciliation/manufacture.
- manufacture-proof-parity
  - Transfer Kind: work-and-responsibility
  - Description: source-frontier snapshots record eligibility decisions and preserve upstream source-selection Evidence, reconciliation proof fingerprints are computed over the same eligible frontier, and manufacture preflight re-enumerates the final Workspace through that same source boundary before carriage. Future manufacture omits generated Python cache state without weakening proof/source-drift qualification.
  - Controlling Artifact: [Core Major 006 Qualification Evidence](../evidence/005-core-major-006-source-eligibility-hygiene-and-reconciliation-par.trace.md)
  - Boundary: manufacture qualification proves mechanical byte/path parity only; Anchor and repository owners retain semantic source disposition.

## Required Context

- core-workspace
  - Material: complete current Core Workspace containing the shared source-eligibility contract, manufacture/frontier/reconciliation integration, regressions, qualification Evidence, and this return Handoff.
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: exact writable implementation/result source for Anchor integration and review.
  - Availability: available
- site-workspace
  - Material: unchanged carried Site Workspace containing the real returned Windows harness context that exposed the generated Python cache source-identity blind spot.
  - Material Reference: [Site Workspace](site::.topics/.workspaces/tiinex-site.workspace.md)
  - Purpose: read-only real-world reproduction and continuity context for the fixed failure shape.
  - Availability: available
- business-workspace
  - Material: unchanged carried Business Workspace containing exact Anchor/Loom Role endpoints and reconciliation process authority.
  - Material Reference: [Business Workspace](business::.topics/.workspaces/tiinex-business.workspace.md)
  - Purpose: read-only role/process authority for semantic and integration disposition.
  - Availability: available
- docs-workspace
  - Material: unchanged carried Docs Workspace containing the semantic authority boundary relied upon by the source/reconciliation process.
  - Material Reference: [Docs Workspace](docs::.topics/.workspaces/tiinex-docs.workspace.md)
  - Purpose: read-only semantic boundary; no Docs mutation is included.
  - Availability: available

## Reference Context

- qualification-evidence
  - Material: exact shared eligibility contract, transport/source distinction, Site-return regression, reconciliation/manufacture proof parity, validation receipts, preservation state, and interpretation limits.
  - Material Reference: [Core Major 006 Qualification Evidence](../evidence/005-core-major-006-source-eligibility-hygiene-and-reconciliation-par.trace.md)
  - Purpose: controlling technical qualification for this return.
  - Availability: available
- manufacture-hygiene-regression
  - Material: focused manufacture-hygiene coverage proves `__pycache__`, `.pyc`, and `.pyo` are source-ineligible while ordinary Python and `_author_*.mjs` source remain eligible.
  - Material Reference: [Manufacture Hygiene Tests](../../../../test/manufacture-hygiene.test.mjs)
  - Purpose: focused qualification of the shared generated-cache boundary on future manufacture/local enumeration.
  - Availability: available
- source-frontier-regression
  - Material: focused source-frontier coverage reproduces the real Site-return generated-cache transport shape and proves exact sanitized comparison, upstream exclusion Evidence, zero-disposition reconciliation readiness, manufacture-proof qualification, and cache omission from resulting manufacture materialization.
  - Material Reference: [Source Frontier Comparison Tests](../../../../test/source-frontier-comparison.test.mjs)
  - Purpose: focused proof that historical generated-cache transport bytes do not become mandatory durable source identity.
  - Availability: available
- full-core-validation
  - Material: `npm run validate` passed 92/92 unit tests, portable Node surface import, and embedded bootstrap qualification with representation SHA-256 `1479c594cce92f422d72e270aa626686c5766449f8fda4210e9d6aab219e081e`.
  - Material Reference: [package.json](../../../../package.json)
  - Purpose: complete Core regression and portable/bootstrap qualification.
  - Availability: available

## Retained Responsibilities

- semantic-source-disposition
  - Retained By: Anchor / owning repository role
  - Responsibility: decide whether ordinary eligible source is accepted, rejected, intentionally deleted, or semantically reconciled when the proof surface identifies a real source choice.
  - Boundary: Core only owns the generic mechanical source-eligibility and byte/path proof boundary.
- integration-and-adoption
  - Retained By: Anchor / Business process owner
  - Responsibility: reconcile this return into the current accepted Core frontier, retain historical carrier immutability, and decide operating-process adoption of the repaired source boundary.
  - Boundary: Loom performs no remote merge, push, publication, release, or deployment.

## Exclusions And Dependencies

- arbitrary-source-deletion
  - Kind: excluded-scope
  - Description: the repair does not infer that arbitrary temporary-looking files, build products, or unfamiliar names are disposable; only the explicit generic non-source Python cache state and existing shared mechanical exclusions are handled.
  - Responsible Party Or Role: Anchor / owning repository role for any semantic deletion decision.
- operator-authored-filename-heuristics
  - Kind: excluded-scope
  - Description: no broad `_author_*` or similar filename rule was introduced; operator-authored scripts remain eligible source unless a future separately qualified generic contract says otherwise.
  - Responsible Party Or Role: Core under separate explicit authority for any future generic eligibility extension.
- historical-package-rewrite
  - Kind: excluded-scope
  - Description: historical Handoff packages carrying generated cache bytes remain immutable exact transport Evidence and are not rewritten or sanitized in place.
  - Responsible Party Or Role: Anchor / continuity process owner.
- remote-action
  - Kind: excluded-scope
  - Description: no GitHub push, npm publication, release, deployment, or other remote mutation was performed.
  - Responsible Party Or Role: Anchor under separate authority.

## Completion Expectation

- Signal Kind: none
- Signal Meaning: the bounded Loom Core Major 006 source-eligibility repair, real Site-return regression, reconciliation/manufacture proof parity, qualification Evidence, and full Core portable/bootstrap validation are returned; no further Loom completion signal is required unless Anchor creates a new explicit Handoff.

## Interpretation Limits

- Does Not Mean: Tooling can decide semantic source intent, arbitrary files may be deleted automatically, historical carriers should be rewritten, source cleanliness equals product acceptance, or a mechanically qualified package is release-ready.
- Must Not Be Used To Claim: automatic semantic deletion, automatic cleanup authority, filename-based disposal of operator-authored scripts, repository-owner authority, release readiness, publication, deployment, or remote mutation permission.
- Authority Limits: Core host-neutral source-eligibility/frontier/reconciliation/manufacture mechanics, exact local qualification, tests, and bounded Evidence only; Anchor and declared owners retain semantic/integration disposition.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [002-anchor-to-loom-core-major-006-source-eligibility-hygiene-and-rec.trace.md](002-anchor-to-loom-core-major-006-source-eligibility-hygiene-and-rec.trace.md)
  - Value: VYj9YF1pKoCRKg_r21IoEM4TwUUeju59Vzc52jZYTkw

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: DALKbrstikp8gYS-7P24KlSHId4DMCzM9LgWQoqaMmE