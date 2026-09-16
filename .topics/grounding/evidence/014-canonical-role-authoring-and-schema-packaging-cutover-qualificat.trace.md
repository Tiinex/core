# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-15 20:09:36
  - Trace: [020-canonical-role-authoring-and-schema-packaging-cutover-enablement-mechanics.trace.md](../020-canonical-role-authoring-and-schema-packaging-cutover-enablement-mechanics.trace.md)
  - Origin:
    - [relative](../020-canonical-role-authoring-and-schema-packaging-cutover-enablement-mechanics.trace.md)
- Current
  - Current Schema: tiinex.evidence.v1
  - Created At: 2026-09-15 20:39:23
  - Authors: Loom
  - Why: Record final Core implementation and acceptance evidence for Task 020.
  - Summary: Qualifies portable Role authoring against the amended current Role schema while preserving exact historical Parent provenance and requiring direct canonical Assignment Modes.
  - Status: ready/local

---

# Canonical Role Authoring And Schema Packaging Cutover Qualification

## Supported Claim Or Question

- Supported Claim Or Question: can portable Core Role authoring preserve an exact qualified historical Role Parent, validate a new Role continuation against Axiom's amended current `tiinex.party.role.v1` contract, require direct canonical `Assignment Modes`, and keep historical schema-reference provenance distinct from current candidate schema authority without special-case Role identity inference
- Evidence Role: qualifies Loom's Core implementation for Task 020 and records the exact current Role schema material, common-author continuity repair, canonical Assignment Modes validation and distribution qualification

## Provenance

- Known Source: exact Core Workspace materialized from the qualified `002-1-1-1-1` Anchor-to-Loom carrier after Start-qualified Tiinex bootstrap, exact selected route qualification and explicit `Loom` consuming-session Role binding
- Controlling Task: `.topics/grounding/020-canonical-role-authoring-and-schema-packaging-cutover-enablement-mechanics.trace.md`
- Received Route: `.topics/grounding/handoffs/024-anchor-to-loom-canonical-role-authoring-cutover-enablement.trace.md`
- Semantic Authority: `docs::.topics/grounding/015-canonical-holder-assignment-mode-hard-cutover-semantic-dispositi.trace.md`, SHA-256 `90de2042ce599d6cf1640669912a5c8b440c84c1a77cc28d18f03a78cd403c42`, supplied as exact qualified Required Context and kept read-only
- Current Role Schema Authority: `docs::.topics/.schemas/party/role/tiinex.party.role.v1.schema.md`, SHA-256 `2887aef16cf827b78fe38c1a2ba97cb5820d79049729d2cf8696ecf1de828871`, 13216 bytes, supplied as exact qualified Required Context and copied byte-for-byte into Core's canonical bundled Role schema material
- Business Boundary: `business::.topics/initiatives/001-2-7-5-1-2-1-canonical-role-authoring-cutover-enablement.trace.md`, SHA-256 `2b5fc7bb10f9d0092b32796ebd67032dbb905984cfa289fc3fcd092e826983cb`, remained read-only and supplied organizational scope/acceptance authority
- Preservation Basis: Core was the only mutated Workspace; Business and Docs were not mutated; historical Role artifacts were not rewritten; no remote write, release, publication or deployment occurred
- Provenance Limits: this Evidence qualifies portable Core Role authoring and schema packaging mechanics only; it does not establish a holder, participant, process, delegation, source mutation permission or Business acceptance

## Evidence Material

- Material: amended bundled Role schema snapshot, Role schema binding/runtime projection updates, ordinary Role creation enablement, exact canonical Assignment Modes validator, common-author historical Parent schema-reference context carriage and deterministic regressions
- Material Kind: host-neutral Core implementation and deterministic tests
- Current Schema Packaging: `src/schemas/party/role/tiinex.party.role.v1.schema.md` is the exact qualified Docs snapshot with SHA-256 `2887aef16cf827b78fe38c1a2ba97cb5820d79049729d2cf8696ecf1de828871`; binding and runtime projection carry the same source checksum and 13216-byte identity
- Creation Contract Cutover: Role creation now exposes ordinary `create-artifact` and `continue-from-record` through the existing generic artifact creation implementation; current creation required inputs include direct `Assignment Modes` immediately after `Holder State`
- Holder Relationship Contract: portable machine validation requires both `Holder State` and `Assignment Modes` in `Holder Relationship`; Holder State remains human-readable context while Assignment Modes carries current positive assignment authorization semantics
- Assignment Mode Domain: accepted values are exactly `explicit-session`, `explicit-user-session`, `explicit-role-invocation`, `handoff`, `explicit-participation`; multiple values must use plain canonical tokens joined by `, ` in canonical order with no duplicates, aliases, code-span quoting, prose or unknown values
- Historical Parent Boundary: common `author` now passes the Parent's exact qualified schema-reference authority into candidate staging; a historical Parent's old schema locator can therefore be preserved exactly without being mistaken for the new candidate's current Role schema authority
- Current Candidate Boundary: the new Role candidate is rendered and validated against the current registered Role schema material; historical Parent schema-reference authority is scoped only to `Parent Schema` and cannot replace or rewrite `Current Schema`
- No Compatibility Format: no second Role format, filename/label special case, prose whitelist, fuzzy parser or hand-authored envelope bypass was introduced
- Legacy Mapping Boundary: Task 020 intentionally leaves `LEGACY_ROLE_MAPPINGS` in place for migration/audit continuity; this change does not treat that mapping as authoring authority for new current Role artifacts
- Focused Qualification: `node --test test/canonical-role-authoring-cutover.test.mjs test/schema-reference-authority.test.mjs test/qualification-boundaries.test.mjs test/master-release.test.mjs` passed 48/48 with 0 failures
- Full Core Regression: `npm test` passed 147/147 with 0 failures
- Portable Smoke: `npm run test:portable` passed with `portable node surface imports`
- Embedded Bootstrap Qualification: `npm run test:bootstrap` returned `embedded-qualified`, manifest SHA-256 `26629c53d3141341ab72b15caa32b9a37f2fc111dd813ad716bc1340c5a5c5c2`, representation SHA-256 `e184e34831f64e395c32d34cc1c52a50e56fb7079fb6edb2e3b0b9652abe9a9e`, 508 runtime files and 5628733 runtime bytes

## Implementation Delta

- Added: `src/schemas/party/role/tiinex.party.role.v1.schema.md` — exact current Axiom-amended Docs Role schema snapshot
- Updated: `src/schemas/party/role/tiinex.party.role.v1.schema.json` — exact current checksum and Git-blob identity for bundled material
- Updated: `src/schemas/party/role/tiinex.party.role.v1.schema.runtime.json` — current source identity, direct Assignment Modes creation input and Holder Relationship required-field projection
- Updated: `src/schemas/party/role/tiinex.party.role.v1.schema.js` — ordinary Role creation capability and exact Role validator registration
- Added: `src/schemas/party/role/tiinex.party.role.v1.validate.js` — exact canonical Assignment Modes serialization/domain validation
- Updated: `src/tooling/portable/adapters/cli/cli.common-author.js` — stage-draft now receives exact creation schema-reference validation context, including exact historical Parent schema-reference authority
- Added: `test/canonical-role-authoring-cutover.test.mjs` — current schema packaging, canonical Assignment Modes, historical Parent continuation success, missing/invalid fail-closed regression

## Adversarial Regression Boundary

- Case 1 — Current Cutover: bundled Role schema checksum and bytes match the exact qualified Docs amendment and creation requires direct Assignment Modes
- Case 2 — Canonical Success: `explicit-session, explicit-role-invocation, handoff` qualifies as exact canonical serialization
- Case 3 — Order Rejection: canonical tokens in non-canonical order fail closed
- Case 4 — Separator Rejection: missing required `, ` separator fails closed
- Case 5 — Code/Prose Rejection: code-span quoting and prose-like/near-match values fail closed
- Case 6 — Duplicate Rejection: duplicate canonical tokens fail closed
- Case 7 — Historical Parent Continuation: exact historical Parent with an older Role schema locator remains the Parent unchanged while a new current Role continuation qualifies
- Case 8 — Missing Modes: a current Role continuation omitting Assignment Modes is blocked and no invalid durable artifact is retained
- Case 9 — Invalid Modes: an unknown Assignment Modes token is blocked and no invalid durable artifact is retained
- Case 10 — Schema Authority Separation: Parent schema locator authority is contextual only to Parent Schema and cannot substitute for current candidate schema authority

## Preservation And Fidelity

- Preservation State: current Role authoring/schema packaging is cut over to direct Assignment Modes while exact historical Parent continuity and existing prospective schema-reference strictness remain preserved
- Known Losses: none identified in the delegated Core surface; pre-cutover current Role creation without direct Assignment Modes is intentionally no longer accepted as current qualified authoring output
- Fidelity Notes: current bundled Role schema bytes are copied exactly from the qualified Docs Required Context; the historical Parent's declared old schema locator is preserved rather than silently rewritten to current authority
- Parent Fidelity: exact Parent bytes, self-integrity, Parent schema identity and declared representation locator remain historical evidence; they are not upgraded, rewritten or treated as the candidate schema source
- Current Schema Fidelity: candidate validation and creation contract use the current registered Role schema material and direct Assignment Modes requirement
- Authority Fidelity: holder semantics remain owned by Axiom/Docs; Core implements the accepted contract without inventing modes, mapping aliases or deriving authorization from Holder State prose

## Interpretation Limits

- Not Yet Used As: proof that all active Business Roles have been migrated or that `LEGACY_ROLE_MAPPINGS` may be removed
- Must Not Be Treated As: authority to rewrite historical Role artifacts, substitute an old Parent schema locator for current schema authority, accept aliases/prose as Assignment Modes, mutate Business/Docs, release or publish
- Does Not Prove: durable holder identity, participant relevance, process applicability, delegation authority, implementation-source permission or overall Business acceptance
- Must Not Be Used To Claim: that a historical Role lacking direct Assignment Modes is a valid new current Role candidate merely because its preserved Parent bytes remain readable and qualified as history

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [020-canonical-role-authoring-and-schema-packaging-cutover-enablement-mechanics.trace.md](../020-canonical-role-authoring-and-schema-packaging-cutover-enablement-mechanics.trace.md)
  - Value: k8KM1KSErlUTi56RBfESKCsMcCImJ98JaPoQLP0erJQ

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 1F73-bRaknVzyRtfZ72wlVbcU4z-DXJsmDccyYhuh6g