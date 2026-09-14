# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-14 17:31:30
  - Trace: [004-holder-and-source-authority-grounding-introspection-task.trace.md](004-holder-and-source-authority-grounding-introspection-task.trace.md)
  - Origin:
    - [relative](004-holder-and-source-authority-grounding-introspection-task.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-14 18:30:25
  - Authors: Anchor
  - Why: Axiom/Anchor reconciliation found that Core now exposes session-input provenance but still does not gate grounded-to-act on semantic binding authorization.
  - Summary: Require qualified Role holder-assignment authorization in addition to matching explicit session binding before Role-recipient act-readiness.
  - Status: ready/local

---

# Holder Binding Authorization Gate

## Objective

Close the remaining post-reconciliation mismatch between explicit session holder input and semantic authorization for that binding. Core already projects `--holder-role` provenance as operator/session input only; now bounded Role-recipient action readiness must require exact qualified authorization for the assignment mode rather than treating a matching assertion as sufficient by itself.

## Accepted Semantic Contract

Anchor has accepted Axiom's holder/source authority disposition:

- recipient Role compatibility, session binding assertion, binding authorization, and durable holder identity are separate claims;
- a selected Handoff recipient never self-assigns the session;
- an explicit matching session Role assertion may become authorized for the bounded current session only when exact qualified semantic authority permits that assignment mode;
- for the current Anchor/Axiom/Loom Role pattern, exact Role material whose `Holder Relationship` states `Holder State: assignable per explicit session or Handoff` authorizes that assignment mode for otherwise qualified bounded work;
- this does not establish durable Party/person/model identity;
- if Role holder semantics are silent, contradictory, unresolved, or require a different assignment instrument, a matching session assertion must remain unauthorized and Role-recipient grounding must not become act-ready solely from that assertion.

## Required Outcome

- Add a fail-visible holder-binding authorization projection distinct from recipient compatibility and assertion provenance.
- For exact qualified Role material that explicitly permits session/Handoff assignment, project qualified authorization with exact Role artifact/section provenance and allow the matched explicit session assertion to satisfy the bounded Role-binding gate.
- If exact Role holder authority does not permit or establish that assignment mode, preserve discussion-only/blocking behavior even when `--holder-role` matches the Handoff recipient.
- Keep durable holder identity independently unresolved unless exact holder/Party authority establishes it.
- Preserve the existing rule that route/transport/provider/chat position never supplies the assertion or authorization.
- Do not change implementation-source authority semantics in this follow-up; retain the current fail-visible unresolved/pass-through behavior.
- Add adversarial tests for authorized assignable Role, silent/unresolved Role, mismatch, and no assertion.
- Preserve bounded Workspace readiness, participant/process non-inference, source authority diagnostics, Recovery, and existing cold-start behavior.

## Scope

Shared portable Core grounding/readiness mechanics and regression tests only.

## Dependencies

- previous Holder And Source Authority Grounding Introspection implementation and Evidence;
- accepted Anchor/Axiom semantic contract summarized above;
- existing Role `Holder Relationship` semantics.

## Boundaries

- Do not mutate Business or Docs.
- Do not infer authorization from Handoff recipient, transport or explicit input alone.
- Do not require or fabricate durable holder identity when bounded session assignment is authorized.
- Do not broaden `grounded-to-act` beyond the selected bounded route.
- Do not reopen implementation-source semantics in this follow-up.

## Done Criteria

- focused tests prove matching assertion + qualified assignable Role becomes authorized-for-current-session;
- matching assertion without qualified assignment authorization stays non-act-ready;
- existing Core suite, portable smoke and embedded-bootstrap qualification remain green;
- Evidence records exact provenance/non-broadening boundary;
- qualified Loom-to-Anchor return Handoff.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [004-holder-and-source-authority-grounding-introspection-task.trace.md](004-holder-and-source-authority-grounding-introspection-task.trace.md)
  - Value: yMPL5IYK-rXwPlRxiTDpNDtAcrGweEjB20GBWKxn9KA

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 2MuBKyYw-7p-LUSsNs7zKAubbanutpYol0_VeOAeOTY