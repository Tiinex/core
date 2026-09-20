# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-20 10:53:14
  - Trace: [029-1-qualified-human-session-and-participant-projection.trace.md](../029-1-qualified-human-session-and-participant-projection.trace.md)
  - Origin:
    - [relative](../029-1-qualified-human-session-and-participant-projection.trace.md)
- Current
  - Current Schema: tiinex.evidence.v1
  - Created At: 2026-09-20 11:46:29
  - Authors: Loom
  - Why: Close the bounded shared Core implementation with exact source and regression evidence before Anchor reconciliation.
  - Summary: Qualify independent exact Role, assignment authorization, holder binding, participant, process and host-local speaker-boundary projections for Core Task 029-1.
  - Status: ready/local

---

## Supported Claim Or Question

- Supported Claim Or Question: does shared Core expose Role identity, Role holder-assignment authorization, current consuming-session holder binding, semantic participant authority, process applicability and the active-speaker boundary as independent qualified/unresolved dimensions, while preserving the rule that Role/cache carriage, holder state and host speaker labels cannot manufacture semantic participation
- Evidence Role: implementation and regression qualification evidence for Core Task `029-1-qualified-human-session-and-participant-projection.trace.md`

## Provenance

- Known Source: exact continued Core Workspace materialized through qualified Tiinex `ground --continue` from received carrier SHA256 `a3c7c05f19a5215a27da97dbfa834084e1aaf9d2eb38c18d0b9e3140e4925655`, selected route `001-4-1-1-1-handoff-pointer.trace.md`, plus deterministic local Core qualification.
- Preservation Basis: implementation remained inside the qualified carried Core Workspace and consumed the exact Task `029-1` plus its accepted Anchor/Axiom Required Context. No VS Code host state, account/display identity, transcript state or speaker label was admitted as semantic authority.
- Provenance Limits: this Evidence qualifies the bounded shared Core projection only. Anchor retains reconciliation of this return; VS Code host work is a later lane and Sigma remains the final real operator gate.
- Source Artifact: `core/.topics/grounding/029-1-qualified-human-session-and-participant-projection.trace.md`
- Relation: implementation qualification of Task `029-1`, delegated by `core/.topics/grounding/handoffs/076-anchor-to-loom-qualified-human-session-and-participant-projectio.trace.md`
- Capture Time: 2026-09-20

## Evidence Material

- Material: Core now carries exact Role holder-relationship material through qualified endpoint/package Role projections and projects the resulting holder-assignment modes alongside an already-qualified semantic participant Role. Participant context exposes separate `participantAuthority`, `roleIdentity`, `holderAssignmentAuthorization`, and `holderBinding` surfaces. Exact Role identity requires an exact `tiinex.party.role.v1` source artifact with a valid SHA256; semantic participation alone cannot self-declare Role identity. Holder-assignment authorization is derived only from exact Role Assignment Modes and remains authorization, not an assignment occurrence. Current holder binding is projected only when the independently supplied current binding matches the participant's exact Role, including material identity when available. A matching Role/binding without semantic participant authority does not create a participant. Sigma's canonical `explicit-participation` mode is therefore visible as bounded Role assignment authorization while its current holder occurrence remains `not-established` unless separately supplied. Role presence, package carriage, endpoint position, holder authorization, and host/session speaker state do not substitute for that occurrence or for participant authority. Participant context also exposes a host-neutral `speakerStateBoundary` with state `external-host-local-non-authoritative`, `transported = false`, and `consumedAsSemanticAuthority = false`; Core neither ingests nor persists active-speaker labels as semantic grounding authority. Existing forward process applicability remains independent: process inventory/availability stays unresolved/non-applicable, while only exact upstream `explicit = true` plus qualified applicability state passes through as qualified process applicability.
- Material Kind: exact shared-Core source delta plus focused participant/session/process regressions and complete Core/portable/bootstrap qualification
- Description: `src/tooling/portable/handoff/coldStartQualification.grounding.js` SHA256 `c886fd23cc39e5590a224d0e8d96e3df2fdadcd7f63741d56bc4317b1871ec31`; `src/tooling/portable/grounding/grounding.participantArtifactAuthority.js` SHA256 `347cc4a37ee3d30529853277d1126b9a5118bcfa8539f64b8d11ac9d0c1bcfd5`; `src/tooling/portable/grounding/grounding.participantContext.js` SHA256 `23b64d068eff60b91f1cc97336f2d6b47547fb88fbb8bf25780fd3fb811c4368`; `test/thin-lineage-grounding-projection.test.mjs` SHA256 `d8ecb890688ca05e052221f66477a64e65e2713ab37d8379fce4840e8745a8de`; `test/blank-workspace-role-cache-grounding.test.mjs` SHA256 `59e7c34f55f62d9d93618871122bebacd41abc3d98d42facd0ca581a6438fdf3`.
- Sample Reference: focused projection regressions prove (1) qualified Sigma participant Role + `explicit-participation` authorization while holder occurrence is absent, then qualified after an independently supplied matching binding; (2) qualified Role/binding without participant authority yields zero semantic participants; (3) missing or mismatched exact Role material fails participant Role qualification; (4) speaker label/contribution speaker state alone yields no semantic participant; (5) process availability alone remains non-applicable while explicit qualified forward applicability passes through; and (6) multiple participants sort deterministically without order-derived holder authority.
- External Payload: `test/thin-lineage-grounding-projection.test.mjs` passes `38/38`; the post-hardening ordinary-ground integration `ordinary ground qualifies Pilot delegation and Sigma participation...` passes `1/1`; all `26` Core `test/*.test.mjs` files were exercised in bounded batches because the monolithic invocation exceeded the host command-duration ceiling, with `206` distinct subtests exercised and no failures after rerunning the sole npm-gated package-surface case under npm. `npm run test:portable` passes. `npm run test:bootstrap` reports `embedded-qualified`, manifest SHA256 `be73d58bf14de4dd42da5ed0899cb59b1a8be9564245e49e6439fbee34d35eae`, representation SHA256 `98b37aea8607daf4e6f6fcb08d8b1aeb545bbc7de6f3c4bc53c43fcd42b07af5`, `514` runtime files and `5792917` runtime bytes.

## Preservation And Fidelity

- Preservation State: qualified local Evidence derived from exact continued Workspace source bytes and deterministic Core test receipts.
- Fidelity Notes: source SHA256 values identify the exact final implementation/test bytes after the exact-Role hardening pass. Existing participant declaration authority and process applicability semantics were extended/projected rather than replaced.
- Known Losses: raw TAP streams are summarized rather than embedded. The monolithic `npm test` run hit the host command-duration ceiling after passing subtests with no failure, so the identical complete file set was exercised in bounded batches; the one test that intentionally skips outside npm was then rerun under npm and passed.
- Representation Limits: passing Core tests establish the stated shared projection behavior under covered fixtures; they do not establish VS Code UX behavior, durable person identity, transcript provenance, or Anchor/Sigma acceptance.

## Interpretation Limits

- Does Not Prove: that Role identity implies a holder occurrence, that holder authorization implies assignment, that assignment implies semantic participation, that participant authority implies Role identity, that process presence implies applicability, or that an active speaker label is semantic identity/Role/participant authority.
- Not Yet Used As: Anchor reconciliation, VS Code participant/speaker UX acceptance, or Sigma final real-operator acceptance.
- Must Not Be Treated As: permission to derive Party/person identity, Role holding, participation, delegation, process applicability or durable provenance from account/display names, transcript labels, chat order, filenames, carrier placement, endpoint position, cached Role presence, or host-local active-speaker state.
- Authority Limits: bounded shared-Core projection of exact qualified/unresolved Role identity, Role assignment-mode authorization, current session holder binding, semantic participant authority, process applicability and the non-authoritative speaker boundary, plus the stated regression and portability gates only.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [029-1-qualified-human-session-and-participant-projection.trace.md](../029-1-qualified-human-session-and-participant-projection.trace.md)
  - Value: ld1Xgb3nTtuZN38UcmhvsKeicvULt79qI-l1bNkysAc

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: Pca6QyML9pEsZW62S-Ni3Hr3j1PAJkQ1hP9WlTXU8sY