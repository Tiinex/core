# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-29 10:36:00
  - Trace: [026-1-5-1-host-native-human-delivery-surface-discipline.trace.md](../026-1-5-1-host-native-human-delivery-surface-discipline.trace.md)
  - Origin:
    - [relative](../026-1-5-1-host-native-human-delivery-surface-discipline.trace.md)
- Current
  - Current Schema: tiinex.evidence.v1
  - Created At: 2026-09-29 10:41:00
  - Authors: Anchor
  - Why: Prevent a qualified local package path from being mistaken for a human-delivered file while preserving canonical manufacture and host neutrality.
  - Summary: Qualify the host-neutral distinction between local Handoff package bytes, exact package qualification, and actual human-visible delivery after Steward observed raw runtime-path output.
  - Status: ready/local

---

# Host-Native Human Delivery Surface Discipline Qualification

## Supported Claim Or Question

- Supported Claim Or Question: does Core now distinguish a canonically manufactured and byte-qualified Handoff Package from actual human delivery strongly enough that a runtime-local filesystem path cannot be treated as proof that the human received an accessible package
- Evidence Role: deterministic Core implementation/regression qualification for subtask `026-1-5-1`, preserving the Steward follow-up observation and the host-neutral boundary of the repair

## Provenance

- Known Source: Steward follow-up report supplied after the accepted fresh Pilot canary plus the exact local Core Workspace continued from the already qualified `026-1-5` repair.
- Preservation Basis: preserve the observed delivery ambiguity, exact implementation delta, machine-visible delivery contract, full Core regression results, portable smoke result, embedded bootstrap qualification, and the provider-neutral scope boundary.
- Controlling Task: `.topics/grounding/026-1-5-1-host-native-human-delivery-surface-discipline.trace.md`
- Parent Repair: `.topics/grounding/026-1-5-qualified-return-transition-and-human-delivery-discipline.trace.md`
- Prior Acceptance: `.topics/grounding/evidence/047-fresh-pilot-qualified-return-discipline-acceptance.trace.md`
- Mutation Boundary: local Core Workspace only; no GitHub mutation and no provider-specific host URL grammar added.
- Provenance Limits: the original Steward UI is not embedded in Core. The reported observable is preserved semantically: an assistant sometimes presented only a runtime-local `/mnt/data/...` package path instead of a host-native clickable/downloadable artifact surface.

## Evidence Material

- Material: exact local source/test/bootstrap changes, deterministic test receipts, embedded bootstrap qualification, and the Steward follow-up delivery observation.
- Material Kind: Core Tooling/bootstrap regression qualification plus host-delivery boundary evidence.
- Observed Gap: a package could be canonically manufactured and qualified while the assistant represented the result to the human only as a textual runtime-local path. File existence and package qualification therefore did not prove that the human had a usable file surface.
- Root Boundary: `/mnt/data/...`, temporary paths, container paths, and Workspace-local paths are execution-runtime locators. They are not human-delivery evidence.
- Previous Overclaim: common Handoff output used `transport.delivery.state = qualified-for-human-delivery` once exact bytes passed manufacture/inspection/roundtrip. Core cannot observe from that mechanical proof whether a host actually surfaced those bytes to the human.
- New Qualified State: canonically manufactured exact bytes now project `transport.delivery.state = qualified-awaiting-host-surface` and `qualificationState = qualified`.
- Human-Surface State: the same output projects `hostSurface.state = not-proven`, `requirement = host-native-human-visible-artifact`, `runtimeLocalPathIsDeliveryEvidence = false`, and `claimDeliveredAllowed = false`.
- Required Next Action: after byte qualification the caller must surface the exact bytes through the host-native human-visible file, attachment, or link mechanism before claiming delivery.
- Blocked State: package material that has not passed canonical manufacture/inspection/physical roundtrip projects `blocked-unqualified-for-host-surface` and cannot be presented as a qualified Handoff Package.
- Continuation Projection: runtime-only `.tiinex/continuation.json` now preserves `humanDeliveryRequiresHostNativeSurface: true`, `runtimeLocalPathIsHumanDeliveryEvidence: false`, and `deliveryClaimRequiresHumanVisibleArtifact: true` without creating new Process, approval, completion, package, or host-UI authority.
- Bootstrap Contract: embedded model-facing guidance now states that qualified package bytes are only qualified for host surfacing, explicitly rejects runtime-local paths as delivered downloads, requires the host-native human-visible artifact mechanism, and requires a truthful blocker when the host cannot surface exact bytes.
- Host Neutrality: Core intentionally does not hardcode ChatGPT `sandbox:` links, attachment IDs, object URLs, Drive URLs, or any provider-specific delivery representation.

## Implementation Delta

- Modified `src/tooling/portable/adapters/cli/cli.common-output.js` to separate byte qualification from host surfacing/human delivery and expose machine-readable host-surface requirements.
- Modified `src/tooling/portable/adapters/cli/cli.ground-materialize.js` to preserve the same return-delivery reminder in runtime-only continuation state.
- Modified `src/tooling/portable/bootstrap/tiinex.llm.bootstrap.md` to forbid runtime-local-path-as-delivery behavior and require host-native human-visible surfacing.
- Extended `test/thin-lineage-grounding-projection.test.mjs` to prove qualified bytes remain `not-proven` as human-delivered and unqualified bytes remain blocked from surfacing.
- Extended `test/handoff-package-v1.test.mjs` to prove the embedded bootstrap teaches the host-native delivery distinction and continued Workspace state preserves it.

## Regression Qualification

- Focused delivery/Package V1/grounding regression: `91/91` tests passed.
- Full Core regression: `298/298` tests passed with `0` failures.
- Portable smoke: passed (`portable node surface imports`).
- Embedded bootstrap qualification: `embedded-qualified`.
- Embedded bootstrap manifest SHA-256: `5b327b04aa457bd22cd1975999363c7756567f8d049197919c4ffddcaeaff420`.
- Embedded bootstrap representation SHA-256: `1aef3a4dcab402b4f3a041beac6362e2ad1daf6dfebd16652643af589ae4fc44`.
- Existing approval-to-qualified-return behavior, Package V1 validation, physical roundtrip, and operation-selection tests remained green.

## Preservation And Fidelity

- Preservation State: prior Task `026-1-5`, Evidence `046`, and fresh canary Evidence `047` remain unchanged. This subtask records a later-discovered delivery-surface refinement rather than rewriting the accepted return-transition history.
- Fidelity Notes: Core proves byte qualification and projects the requirement for host-native surfacing; it does not fabricate a host delivery receipt or claim to observe the human UI.
- Known Losses: no generic cross-host receipt protocol was introduced in this bounded fix. A future host integration may add a concrete receipt that proves exact bytes were surfaced.
- Representation Limits: the new machine state can prevent Core/bootstrap from equating a local path with delivery, but an external host/orchestrator can still ignore guidance unless it enforces the projected requirement.

## Interpretation Limits

- Does Not Prove: that Core can observe arbitrary host UI state; that a host-native file mechanism is available in every environment; that all provider-specific delivery integrations are implemented; or that a textual path can ever count as human delivery.
- Must Not Be Treated As: permission to expose unqualified package bytes, permission to manually construct a package, a provider-specific URL contract, or a weakening of the canonical return/manufacture gates.
- Not Yet Used As: a universal host delivery-receipt schema or a claim that every host automatically enforces `hostSurface`.
- Authority Limits: bounded Core Tooling/bootstrap distinction between local package existence, exact package qualification, required host-native surfacing, and truthful human-delivery claims.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [026-1-5-1-host-native-human-delivery-surface-discipline.trace.md](../026-1-5-1-host-native-human-delivery-surface-discipline.trace.md)
  - Value: NDksHDfkX_DAFRqz0eyejFUwFCkq8uv1oEAjF4Nx930

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: zW67_S5CmgM6avJ85VplFNzkEGDsN9FghWCRKrFrfjA