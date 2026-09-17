# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-16 20:10:02
  - Trace: [001-2-7-5-1-5-1-1-qualified-handoff-recipient-holder-projection-correction.trace.md](business::.topics/initiatives/001-2-7-5-1-5-1-1-qualified-handoff-recipient-holder-projection-correction.trace.md)
  - Origin:
    - [relative](business::.topics/initiatives/001-2-7-5-1-5-1-1-qualified-handoff-recipient-holder-projection-correction.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-16 20:10:03
  - Authors: Anchor
  - Why: Current normal grounding requires explicit --holder-role even though the qualified recipient Role authorizes handoff assignment and the exact selected Handoff is being actively consumed.
  - Summary: Implement canonical handoff-mode bounded holder assignment from exact selected Handoff consumption without chat acknowledgement or transport inference.
  - Status: ready/local

---

# Qualified Handoff Recipient Holder Projection Mechanics

## Objective

Implement the existing canonical `handoff` assignment mode as a normal cold-start holder-binding path using exact selected qualified Handoff consumption as the bounded assignment evidence, so fresh recipients do not need a conversational acknowledgement or self-supplied `--holder-role` bridge.

Keep recipient Role compatibility, exact Handoff selection/consumption, assignment-mode authorization, bounded holder result and durable identity as separate claims. Do not reinterpret package delivery, endpoint labels or cache presence as holder assignment.

## Done Criteria

- With no explicit holder input, normal grounding of a qualified selected Handoff to one Role recipient can project a qualified bounded holder binding only when exact recipient Role material qualifies and its direct canonical `Assignment Modes` contains `handoff`.
- The positive source is represented distinctly from explicit-session input, for example as qualified selected-Handoff consumption; it must carry exact selected Handoff path/SHA-256, route pointer, exact recipient Role artifact path/SHA-256/schema and assignment mode `handoff`.
- `sourceDetail.qualifiedMaterialSource` and semantic authority provenance reflect the exact qualified Handoff/Role basis; `inferredFromTransport` remains false.
- Orientation/package delivery alone does not bind a holder. The evidence requires normal grounding of the exact selected route, not mere presence of a Handoff or Role in a carrier.
- Role-only endpoint presence is insufficient when the Role does not authorize `handoff`, exact Role material is missing/unqualified, route/Handoff qualification fails, or the route is not the selected route.
- Unselected sibling Handoffs, cached participant Roles, Task mentions, filenames and provider/chat/model identity cannot establish the binding.
- Explicit-session / explicit-role-invocation / explicit-participation behavior stays mode-isolated. An explicitly supplied mismatching Role remains a hard contradiction and must not be overridden by the Handoff path.
- The bounded Handoff assignment does not establish durable identity, semantic participation, downstream delegation, process applicability, source authority, completion or broader Handoff acceptance.
- Fresh Anchor-to-Anchor recovery shape and fresh Anchor-to-Loom specialist shape both reach `grounded-to-act` without `--holder-role` when exact Roles authorize `handoff`.
- Negative regressions prove no binding from package delivery/orientation only, from a Role lacking `handoff`, from mismatched/unqualified Role material, and from cache/inventory presence.
- Existing downstream Axiom-delegate projection remains independent and green: current holder/recipient may be Anchor while downstream delegate is Axiom.
- Full Core suite, portable smoke and embedded bootstrap qualification remain green.
- Return exact qualification Evidence and one Loom-to-Anchor Handoff.

## Scope

Core cold-start/grounding holder-binding projection and focused tests only. No Business/Docs mutation, no new semantic schema, no durable identity system, no delegation/process/source-authority redesign, no product work and no unrelated refactor.

## Dependencies

- Business `Qualified Handoff Recipient Holder Projection Correction`.
- Docs `Canonical Holder Assignment Mode Semantic Disposition` and current `tiinex.party.role.v1` Assignment Modes contract.
- Current canonical holder implementation and latest downstream-delegate selection projection implementation.
- Exact real fresh Anchor and fresh Loom carrier shapes that presently stop at `session-holder-role-binding-unresolved` without explicit holder input.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-2-7-5-1-5-1-1-qualified-handoff-recipient-holder-projection-correction.trace.md](business::.topics/initiatives/001-2-7-5-1-5-1-1-qualified-handoff-recipient-holder-projection-correction.trace.md)
  - Value: 7vWcdLQcpOjLT77Z0oNWSbHHTqAJsK9rOkyM02BmsWQ

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 4Nnw4pc2qgr2vlt6JQ5PKlpdptJHXVzgh3IUjbyHGUA