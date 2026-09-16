# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-15 17:24:06
  - Trace: [001-2-7-5-1-2-canonical-holder-assignment-mode-normalization.trace.md](business::.topics/initiatives/001-2-7-5-1-2-canonical-holder-assignment-mode-normalization.trace.md)
  - Origin:
    - [relative](business::.topics/initiatives/001-2-7-5-1-2-canonical-holder-assignment-mode-normalization.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-15 18:39:01
  - Authors: Anchor
  - Why: Kodax explicit-session binding is production-blocked only because Core treats Holder State wording as semantic authority.
  - Summary: Implement Axiom canonical Assignment Modes and exact current Role mappings without prose whitelisting.
  - Status: ready/local

---

# Canonical Holder Assignment Mode Normalization Mechanics

## Objective

Implement Axiom's accepted canonical holder-assignment semantic contract so Role holder authorization is based on structured normalized Assignment Modes with exact semantic provenance rather than raw `Holder State` sentence matching.

Close the production Kodax blocker without rewriting historical Role prose and without creating a heuristic natural-language parser.

## Required Outcome

- Core holder authorization consumes a normalized assignment-mode set whose provenance is either:
  - exact structured Role `Assignment Modes` authority when available; or
  - the exact qualified legacy Role mapping supplied by Axiom's Canonical Holder Assignment Mode Semantic Disposition.
- `Holder State` remains available for human-readable diagnostics but is not the positive machine authorization surface.
- Preserve separate projections for recipient Role, current binding assertion, assignment authorization, bounded binding result and durable holder identity.
- Preserve fail-closed behavior for missing, stale, contradictory, unknown or unmapped assignment-mode authority.
- Do not authorize from Handoff endpoint labels, package/project/chat identity, provider/runtime identity or session assertion alone.

## Exact Acceptance Matrix

At minimum qualify these cases from exact current Role material and Axiom's semantic mapping:

- Anchor + matching explicit session assertion -> bounded session authorization qualifies;
- Axiom + matching explicit session assertion -> same;
- Loom + matching explicit session assertion -> same;
- Kodax + matching explicit session assertion -> same, eliminating the observed production prose-mismatch blocker;
- Pilot + matching Role-invocation assertion -> invocation authorization qualifies;
- Loom/Kodax/Pilot current invocation variants -> same `explicit-role-invocation` canonical mode;
- Sigma + generic explicit session assertion -> unresolved/not authorized when only `explicit-participation` is established;
- Glimmer + generic session assertion -> unresolved when the narrower user-session condition is not established;
- unknown Holder State with no structured modes or exact qualified mapping -> unresolved even when familiar words occur;
- matching `--holder-role` assertion with unresolved assignment-mode authority -> remains blocked rather than self-authorizing.

## Regression And Distribution Qualification

- Existing holder/source/process/participant/delegation and return-material closure tests remain green.
- Add adversarial tests proving that token, substring, punctuation, fuzzy or whole-sentence fallback cannot authorize unknown prose.
- Verify the actual Kodax Role artifact that produced `session-holder-role-binding-authorization-unresolved` now qualifies under explicit-session authority.
- Verify no widening from session to invocation/participation/user-session/Handoff modes.
- Full Core regression, portable smoke and embedded bootstrap qualification remain green.

## Scope

Core holder-assignment normalization/projection and tests only.

## Dependencies

- Business Canonical Holder Assignment Mode Normalization Task;
- Axiom Canonical Holder Assignment Mode Semantic Disposition;
- accepted Fail-Closed Blocker Return Material Closure mechanics as the current Core source basis.

## Boundaries

- No Business or Docs mutation.
- No historical Role prose rewrite.
- No whole-sentence whitelist expansion.
- No heuristic NLP parser.
- No durable-holder, participant, process, delegation, implementation-source or acceptance authority expansion.

## Done Criteria

- Kodax explicit-session holder binding reaches the same bounded authorization state as Anchor/Axiom/Loom when exact qualified mapping applies.
- Unknown/unmapped prose remains fail-closed.
- Evidence records exact mapping/provenance and acceptance matrix results.
- Return one qualified Loom-to-Anchor Handoff for Anchor reconciliation and fresh acceptance continuation.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-2-7-5-1-2-canonical-holder-assignment-mode-normalization.trace.md](business::.topics/initiatives/001-2-7-5-1-2-canonical-holder-assignment-mode-normalization.trace.md)
  - Value: sHcRIrW-bE0NbTMBahP5wbeJg3VVtpaeU5wqWGajp_0

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: c4Gl6eT5Vbms3L1I0LqUf5nKtBuXehygtZNxbwYwXZk