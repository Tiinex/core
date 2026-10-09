# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-09 10:32:10
  - Trace: [001-portable-agent-capability-projection-and-synchronization-contrac.trace.md](001-portable-agent-capability-projection-and-synchronization-contrac.trace.md)
  - Origin:
    - [relative](001-portable-agent-capability-projection-and-synchronization-contrac.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-09 10:39:59
  - Authors: Anchor
  - Why: A generated Role agent file cannot replace qualified recipient grounding or independently grant Process execution authority.
  - Summary: Core CLI-bound grounding parity and selected Process rechecks for Copilot and future agent hosts; fail closed before Tiinex mutations.
  - Status: ready/local

---

# Portable Agent Grounding Session And Process-Recheck Gate

## Objective

Before VS Code Native Agent Tools or a future independent MCP adapter are accepted, ensure an agent receives a Core-qualified grounding opportunity comparable in semantics to the portable `orient` and `ground --recipient` bootstrap path. A generated Role agent file is only a discovery and instruction projection; it is never a substitute for grounding, holder binding or Process qualification.

## Qualified Starting Point

- Core currently exposes `orient-handoff-package`, `project-grounding-readiness`, the read-only recipient `ground` flow, and a qualified local continuation state `.tiinex/continuation.json` which is explicitly runtime-only and not semantic authority.
- Core's existing continuation guidance projection carries `selected-guidance-recheck-required-on-human-turn` and distinguishes availability, applicability and separately qualified active execution. Presence of Process material must not imply that a Process is applicable or that any step is currently active.
- Core explicitly states that hard prevention of host tool invocation requires a host/orchestrator to enforce the projected guidance gate. This must not be represented as an already enforced guarantee in Copilot.
- Existing Core capability projection Task `001-portable-agent-capability-projection-and-synchronization-contrac.trace.md` owns operation metadata and safe agent-file synchronization; this Task owns the distinct grounding/session boundary, not a second schema, Process engine or authoring implementation.

## Scope

- Define one portable, structured, read-only grounding-session projection binding the exact carrier identity and route, Workspace set/source fingerprints, recipient Role/holder assertion, bounded current work, Required Context material and resolved/unresolved guidance dimensions. Any session identifier is runtime-only and host-scoped; never invent Role authority based on a VS Code agent display name or Copilot provider identity.
- Expose a deterministic CLI equivalent for session discovery and freshness/recheck. Candidate command names must go through the Core operation naming process; this Task does not preauthorize unregistered command names.
- Separate readiness dimensions: available material, exact recipient/Role qualification, current-work grounding, selected Process guidance applicability, active Process step if independently qualified, and execution/operation authority. Distinguish `needs-carrier-or-route`, `needs-explicit-holder`, `needs-human-interpretation`, `grounded-to-act`, `stale`, and `blocked` where supported; do not fabricate stronger states from free text.
- Model a non-mutating operation preflight that accepts exact qualified grounding source identity, requested Core operation, user intent/current-turn signal if available, active selected guidance and expected mutation plan fingerprint. Read-only discovery remains available even when mutation is blocked. Applying a plan always rechecks authoritative Core operation safety, target bytes and workspace state; a cached `grounded-to-act` is not indefinite write permission.
- Follow the existing Core invariant: a newly submitted human turn requires reconciling selected Process guidance with that turn before choosing a consequential host operation. If the host does not expose reliable turn/session identity, fail closed on Tiinex mutations or recheck at every invocation; never claim to know session state from prompt text alone.
- A Role-bound `.agent.md` is not an active Role assignment. Any formal holder mode, Handoff selection or return requirement must come from qualified Core material and explicit binding. `ground --recipient` provides bounded source text for human/LLM interpretation but mechanical projection does not prove cognitive reading.
- The returned projection must carry narrow source references and relevant material text, not the entire Workspace or unbounded Process documents. No model-generated assumptions may be promoted to Core authority.
- This Task is not the Owner of generalized VS Code hooks, UI, skills, pre-prompts, Process definitions, or a new MCP implementation.

## Fail-Closed / Recovery Contract

- No carrier or unresolved route: provide an exact next-action selection receipt; never infer the Handoff from file chronology, folder name or an active editor.
- Source/route/Role/Workspace fingerprint drift, session handoff, context compaction or unknown active Process step: invalidate or requalify the invocation. A previous `ready` receipt must never silently be reused across unrelated contexts.
- Out-of-order request (`apply` before grounded source, revoked selected guidance, unqualified permission, missing approval, changed plan): block with structured finding and concrete read-only recovery action. Do not mutate files while reconstructing session state.
- Distinguish Core-enforced Tiinex invocation gate from external shell/file editor tools: this task does not assert that a generic Copilot session is prevented from all non-Tiinex actions.

## Tests / Acceptance

- Compare CLI/bootstrap and native-agent gateway on the *same exact carrier + route*: selected Handoff, Workspaces, Required Context count/hash, Role/holder qualification, selected guidance dimensions, and blocked/next-action reasons must agree. The model may interpret the result differently, but the underlying qualified projection cannot.
- Positive: selected Handoff, Role-capacity match and Required Context → usable bounded grounding; confirmed explicit Process guidance as a distinct gate before protected operation; correct read-only fallback.
- Negative: available Process not selected, selected Process not currently executing, second user turn changes decision, revoked/unknown step, wrong Role, absent carrier, altered source bytes, interrupted tool, stale plan fingerprint, another workspace, agent delegation and compaction. No mock model assertion substitutes for exact Core receipts.
- No implicit task completion, return timing, capability widening or application of a Process merely from the generated `.agent.md`, skill discovery or hook occurrence.

## Dependencies

- Existing Core grounding readiness, continuation guidance and capability contract Task; Native Role and Process meanings; concrete Business Role records; exact carrier/route fixture. VS Code harness adapter is a separate host-specific owner.

## Done Criteria

- Portably callable Core+CLI grounding-session projection with structured freshness and per-operation gate, exact source identities and bounded next action. Tests establish equivalence of grounding receipts across CLI/bootstrap and future VS Code agent tool adapters while preserving Process applicability/active-state distinctions and failing closed on mutation.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-portable-agent-capability-projection-and-synchronization-contrac.trace.md](001-portable-agent-capability-projection-and-synchronization-contrac.trace.md)
  - Value: WtOVUp7J4SMXPvEBE_v_9SGEWBBt5aMzHqj2EkOeGnY

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: dR_iF7oh2d6HIWqViUf3Kdhuf-WV7-g8OGSHyBMN69w