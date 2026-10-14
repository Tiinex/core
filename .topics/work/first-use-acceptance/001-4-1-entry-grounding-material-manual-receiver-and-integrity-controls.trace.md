# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/9ef3c2caed38152b1948c93cb45c985786660d91/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-10-14 17:40:38
  - Trace: [001-4-getting-started-recipient-walkthrough-evidence.trace.md](001-4-getting-started-recipient-walkthrough-evidence.trace.md)
  - Origin:
    - [relative](001-4-getting-started-recipient-walkthrough-evidence.trace.md)
- Current
  - Current Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/9ef3c2caed38152b1948c93cb45c985786660d91/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-10-14 19:56:19
  - Authors: Anchor
  - Why: Preserve evidence of the generic Entry requirement boundary before choosing whether additional Tooling is warranted.
  - Summary: Disposable carrier manual recipient test of declared Entry material present, missing and tampered; transport-ready distinguished from grounded.
  - Status: ready/local

---

# Entry Grounding Material — Manual Receiver and Integrity Controls

## Supported Claim Or Question

- Supported Claim Or Question: When a selected portable Session Entry declares mandatory Grounding Material, what does the currently qualified Core Tooling establish for material that is carried, absent, or modified, and does transport-ready mean grounding-complete?
- Evidence Role: bounded, independently repeated local receiver-mechanics and negative-material experiment against 041-1-1-1 tooling; it does not claim a blind LLM, third-party host, or automatic material resolution.

## Provenance

- Known Source: candidate `tiinex-041-1-1-1.handoff-package.zip`, its exact Start and qualified embedded runtime; disposable Native Workspace with two `tiinex.entry.session.v1` fixtures created through qualified authoring; independent disposable `tiinex-001.handoff-package.zip` containing the Native fixture Workspace; read-only recipient replay using that carrier's embedded runtime and an isolated extracted Workspace; negative audit of a disposable locally modified target.
- Preservation Basis: the candidate and test package were oriented; the recipient replay returned zero carrier findings and qualified Native catalog projection. The test carrier was manufactured through existing Package V1 machinery. Positive/missing projections and audit receipts were recorded in disposable local files; this Evidence is the preservation of bounded observations, not a claim that those scratch receipts are included as primary bytes.
- Provenance Limits: one local Linux/Node host with a non-blind Anchor acting as receiver. Test Entry fixtures were inserted into a disposable copy of Native, not into authoritative Native or a separately registered published extension; relative targets were chosen with prior knowledge. Local ZIP files and scratch receipts may not survive session recovery unless independently preserved.

## Evidence Material

- isolated-receiver-replay
  - Material: disposable Package V1 `tiinex-001.handoff-package.zip` created by standard `manufacture-handoff-package` from Native fixture Workspace and consumed with its own embedded runtime.
  - Material Kind: disposable-carrier-test
  - Description: `orient` returned ready, exactly one qualified Native Workspace, zero routes and zero findings. Explicit Entry selection via `project-workspace-carrier-entry` returned `ready` for both declared-material fixtures; the transport text pointed at the exact carried Entry but did not repeat its `Grounding Material` references. Carrier and Entry selection do not assign Role, Task ownership, or transfer authority.
- positive-grounding-declaration
  - Material: `native::.topics/.entries/what/anchor-probe/001-external-entry-fixture-present-material.trace.md`, referencing `.topics/work/first-use-activation/001-getting-started-entry-activation-task.trace.md` in the same disposable carried Native Workspace.
  - Material Kind: schema-qualified-entry-and-bounded-source
  - Description: Entry catalog preserved `requiredForEntryGrounding: true` with exact relative reference. The target was present in the carried Native Workspace, read manually, and local file audit reported `integrity.c14n-v2.verified` and no warnings/errors. This demonstrates a manually fulfillable requirement when the local material is available, not that Entry projection itself performed resolution or reading.
- negative-grounding-declaration
  - Material: `native::.topics/.entries/what/anchor-probe/002-external-entry-fixture-missing-material.trace.md`, referencing `.topics/documentation/probe/001-missing-topic.trace.md`.
  - Material Kind: schema-qualified-entry-with-unavailable-reference
  - Description: Entry catalog preserved the mandatory reference, and projection still returned `ready`/zero findings. That reference does not occur in the supplied material. The Entry may be transported but cannot be declared fully grounded from the carried material; separate qualified remote source access was not tested.
- source-integrity-control
  - Material: a disposable copy of `.topics/work/first-use-activation/001-getting-started-entry-activation-task.trace.md`, modified only in its Markdown title after copying.
  - Material Kind: negative-local-integrity-test
  - Description: intact file `audit` emitted `integrity.c14n-v2.verified` and a clean finding summary; modified file emitted `integrity.c14n-v2.mismatch` as a warning while its artifact-level audit status remained `readable`. A receiver must not conflate readable form or an `audit` result with verified integrity. The mismatch is visible to Tooling, not automatically translated into a grounding refusal by the Entry projection.
- absent-entry-control
  - Material: clean carrier without the injected test content source.
  - Material Kind: negative-catalog-selection
  - Description: selecting the absent synthetic Entry returned blocked `entry-mode-invalid`, preserving the distinction between carrier content and external test source available only to the sender.

## Preservation And Fidelity

- Preservation State: only this Evidence is to be added to the current Core first-use work continuation. No Source, Entry, Schema, transport implementation, or authored fixture in authoritative Workspaces is changed.
- Fidelity Notes: transport-ready is not equivalent to fully grounded, local readable is not identical to verified self-integrity, and single-Workspace test material is not proof of arbitrary third-party content-source resolution. 041 remains the accepted checkpoint; 041-1-1-1 and this continuation remain candidate material pending Sigma audit.
- Known Losses: exact ephemeral source files, CLI JSON receipts and disposable test carrier are not part of this Evidence by default, so a future independent re-run must reconstruct the disposable fixtures or preserve the receipt package separately.

## Interpretation Limits

- Does Not Prove: automatic resolution or consumption of Grounding Material, cross-Workspace third-party resolution, absence of all remote material providers, real ChatGPT Web blind Entry selection, consumer incentive to read, installed VS Code first-use, exit/termination, or end-to-end acceptance.
- Must Not Be Treated As: a Core implementation defect merely because projection returns `ready`, host/recipient authority, approval to create a `.guidance` surface, or permission to mutate remote repositories.
- Not Yet Used As: final independent Sigma acceptance or evidence of novel source/transport functionality.
- Next Qualification: an independent LLM recipient test must distinguish Entry availability, material presence, integrity, actual reading, and explicitly unresolved dependencies, while preserving normal first-use behavior. Do not implement a resolver solely from a transport-ready receipt.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-4-getting-started-recipient-walkthrough-evidence.trace.md](001-4-getting-started-recipient-walkthrough-evidence.trace.md)
  - Value: mGuAPaeNv6qRxJeg-_u5y6F7cGk0C5dHLEhYYyxvoWU

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: BjPs33TZ006K64Ov3VW0z0Hf3j-4gcX_BzkAn0APLxo