# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/9ef3c2caed38152b1948c93cb45c985786660d91/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-10-14 19:56:19
  - Trace: [001-4-1-entry-grounding-material-manual-receiver-and-integrity-controls.trace.md](001-4-1-entry-grounding-material-manual-receiver-and-integrity-controls.trace.md)
  - Origin:
    - [relative](001-4-1-entry-grounding-material-manual-receiver-and-integrity-controls.trace.md)
- Current
  - Current Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/9ef3c2caed38152b1948c93cb45c985786660d91/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-10-14 20:19:25
  - Authors: Anchor
  - Why: Prevent blind-test false positives from contaminated bootstrap source selection and establish explicit consumer expectations.
  - Summary: Manual preflight of clean bootstrap-only, empty Workspace, and saved continuation, including inherited source contamination.
  - Status: ready/local

---

# Bootstrap-Only and Blank-Workspace Cold-Start Preconditions

## Supported Claim Or Question

- Supported Claim Or Question: Can qualified Tiinex Tooling prepare and manually consume two clean novice First-Use carriers — bootstrap-only (zero Workspaces) and an intentionally blank pointerless Workspace (one qualified Workspace, no project/task/role) — including a later qualified save/resume operation, without silently selecting the wrong portable Entry source?
- Evidence Role: conditional manual preflight of technical source/transport/authoring/recovery prerequisites, plus independently inspectable cold-start behavior expectations. This is **not** an independent blind LLM First-Use Acceptance or an installed VS Code test.

## Provenance

- Known Source: user-carried candidate `tiinex-041-1-1-1-1.handoff-package(1).zip`; accepted 041 as authority baseline; candidate's qualified embedded bootstrap; exact carried Native and Interop OpenAI Workspace snapshots; carried Docs Getting Started Topic and guides; qualified `tiinex.workspace.v1` and `tiinex.task.v1` schema material; disposable test Workspaces/carriers prepared with portable Core Tooling.
- Preservation Basis: candidate `Start` and bootstrap descriptor were read directly; bootstrap payload SHA-256 `46537859b2ccdf879565f717ff5795038570358e3682580feebf9906091b5d82` matched the declared bytes, and `orient` verified 17 Workspaces with zero findings. The manifests and exact resulting `catalog`/Entry projection were compared before and after explicit bounded content-source selection. Both clean test carriers were manufactured through standard `manufacture-handoff-package`, unpacked through exact Start, independently oriented with their own embedded runtime, and their selected purpose/target Entries were projected. Conditional authoring was preflighted and executed in the disposable blank Workspace; a new continuation carrier was independently reopened and the Task's self-integrity checked.
- Provenance Limits: one local Node host and Anchor-driven manual replay. The human-initiated chat-first behavior, installed VS Code Initialize Workspace workflow, independent LLM judgment about association/applicability, and actual creative-game deliverable quality remain untested.

## Evidence Material

- inherited-bootstrap-content-contamination
  - Material: current candidate `041-1-1-1-1` embedded `tiinex.bootstrap/manifest.json` and `catalog --json`.
  - Material Kind: qualified-current-candidate-runtime-composition
  - Description: the candidate bootstrap declares three content sources: `@anchor-test/entry-grounding`, `@tiinex/interop-openai`, and `@tiinex/native`. It also carries two `anchor.test.entry.material-*.v1` experimental Entries. Catalog and Guided Entry choose the `Getting Started` definition from `@anchor-test/entry-grounding`, despite the real qualified Native source also being present. The original bootstrap composition SHA-256 is `daae6045eb4f18a622a959efeb9e29510f16b126eb8826e32758d81af8bd16b2`. A `ready` projection with this source must not qualify a clean novice test.
- bounded-clean-source-selection
  - Material: exact carried qualified Native and Interop OpenAI Workspace snapshots selected explicitly as bootstrap content roots, using existing CLI `--content-sources` for **bootstrap-only** manufacture.
  - Material Kind: disposable-source-selection-preflight
  - Description: clean bootstrap has **two** content sources (`@tiinex/native`, `@tiinex/interop-openai`), five Entry definitions and no `anchor-test` sources. Clean composition SHA-256 is `e7b28d5072806dd684db497dbf12a129826e42b46253777b107cc0a69c67d3d1`. Its own Start, bootstrap SHA, `orient`, `catalog`, `project-workspace-carrier-entry` and `project-transport-completion` return ready/clean with Getting Started resolved from `@tiinex/native` and ChatGPT Web from `@tiinex/interop-openai`.
- bootstrap-only-scenario
  - Material: clean, disposable bootstrap-only Package V1, with no Workspace source snapshots and no Handoff route.
  - Material Kind: independent-own-runtime-manual-replay
  - Description: `orient` returns ready with 0 Workspaces and 0 findings. Explicitly selected Getting Started/ChatGPT Web projects ready from clean first-party content. This proves technical availability of Entry and schema catalog, not that a blind LLM will select it automatically or invent a Workspace. Docs Getting Started guide is not carried as a documentation Topic in this bootstrap-only carrier; `Relevant Context` is conditional, not an explicit Grounding Material obligation.
- blank-workspace-scenario
  - Material: disposable standalone Workspace with one self-integrity-verified `tiinex.workspace.v1` descriptor, `package.json`, and no project, task, role, selected work, or published state.
  - Material Kind: independent-own-runtime-manual-replay
  - Description: qualified lineage had 0 findings; package manufacture and its own runtime `orient` returned ready with exactly 1 qualified Workspace and zero routes/findings. Entry projection remained clean, pointerless, and selected `@tiinex/native` Getting Started with the same ChatGPT Web target. Workspace presence did not establish goal ownership.
- conditional-save-recovery
  - Material: disposable `tiinex.task.v1` draft for a board-game prototype, authored only as a simulated **post-consent** action in the blank Workspace; `001-prototype-a-small-board-game.trace.md`.
  - Material Kind: qualified-local-authoring-and-complete-recovery-control
  - Description: `author --preflight` returned `qualified-preflight`, then `author` sealed a Task with valid Done Criteria and boundaries; standard continuation manufacture returned `tiinex-001-1.handoff-package.zip`. Its own embedded bootstrap oriented that carrier with 1 Workspace and zero findings; exact carried Task bytes were retrieved and their c14n-v2 self-integrity was verified. This tests technical preservation, not any actual user's authorization to assign the project.

## Preservation And Fidelity

- Preservation State: this Evidence is authored under the existing Core first-use acceptance lineage, continuing the previous manual Entry-grounding Evidence as its nearest causal Parent. The original candidate package is preserved as forensic input and is not silently replaced. The production source of Core/Native/Docs/Interop OpenAI is unchanged. A new complete candidate carrier must independently prove full 17-Workspace byte continuity and clean bootstrap content selection before use in a blind test.
- Fidelity Notes: First-Use is goal-first. A clean bootstrap-only carrier does not create a Workspace; an initialized blank Workspace does not own a new goal. Reading a schema or Entry does not imply that a Session Role, Process, Handoff route or recipient is selected. Status `ready` is not proof of model behavior or of completed Entry grounding.
- Known Losses: temporary experiment carriers, stdout JSON receipts and exact simulated Task bytes are disposable host files; they are described here but not silently presented as attached source materials. Preserve or reconstruct a test carrier as a whole if needed for external replay.

## Interpretation Limits

- Does Not Prove: true cold ChatGPT Web recipient behavior, automatic selection of Getting Started from a plain bootstrap-only attachment, actual Docs guidance retrieval without Docs, host-level automatic initialization of an empty folder, intent/Workspace association, real output quality, independent exit/termination and new-chat recovery.
- Must Not Be Treated As: approval to reinstate `@anchor-test`, mandatory Docs onboarding, new `.guidance`/JSON sidecars, new schema families, eager Workspace ownership, or full First-Use Acceptance.
- Not Yet Used As: Sigma acceptance or production publication authority.
- Expected Bootstrap-Only Behavior: begin with the user's natural goal; qualify Start and Entry when the supplied transport selects one; help first without fabricating Workspace ownership or records; on an explicit save/continuation request explain that no Workspace is carried, and offer only genuinely supported initialization/preservation paths. No claimed save without a real carrier.
- Expected Blank-Workspace Behavior: orient the qualified but unassigned Workspace, help with the user's goal, and determine association only when materially relevant. Do not auto-create Roles/Processes/Projects. On an explicit, authorized save request, select actual appropriate schemas and real Parent, author/preflight bounded records as useful, and return a complete qualified continuation carrier if supported.
- Failure Signals Before Blind Testing: Entry points to `@anchor-test` or another unqualified source; bootstrap manifest includes hidden experimental Entries; a supposed blank Workspace already has a Task/Role/Handoff route; Docs availability is invented; failure to verify new package roundtrip; or expected authority is inferred from carrier placement alone.
- Independent Test Gate: evaluate fresh ChatGPT Web sessions separately for explicit Getting Started purpose-selection and genuinely unled conversation without purpose selection; use one natural user goal and a later ordinary save request. Pass requires correct behavior and honest limits, not a prescribed sequence of tool calls. A blind session result, not this preflight, is required for behavioral acceptance.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-4-1-entry-grounding-material-manual-receiver-and-integrity-controls.trace.md](001-4-1-entry-grounding-material-manual-receiver-and-integrity-controls.trace.md)
  - Value: BjPs33TZ006K64Ov3VW0z0Hf3j-4gcX_BzkAn0APLxo

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: qEg58qttJY5V3Pcrv3yIJ-SDQparu1TktxdOnoZp8EY