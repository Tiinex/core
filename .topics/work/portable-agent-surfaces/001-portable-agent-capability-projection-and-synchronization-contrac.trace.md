# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-09 10:32:10
  - Authors: Anchor
  - Why: Avoid duplicate host semantics and prevent user-edit loss when generating agent files.
  - Summary: Portable Core/CLI capability projection and safe host customization sync before VS Code Native Agent Tools or separate MCP.
  - Status: ready/local

---

# Portable Agent Capability Projection And Synchronization Contract

## Objective

Before VS Code Native Agent Tools or a separate Tiinex MCP adapter are declared accepted, provide one Core-owned, portable projection of qualified operation metadata and bounded Role/Entry/workflow context. Host-specific agents, skills and tool manifests are derived presentations, not second source authority. This Task is linked to the current Move/Rebase branch for coordination but is NOT a new Move/Rebase semantic implementation owner.

## Grounded Starting Point

- Core already has `portableOperationCatalog`, operation safety and input schema identifiers, portable CLI and structured creation/draft/Transition projection. These do not by themselves guarantee complete machine-readable tool input JSON schema or ergonomic cross-host discoverability.
- Native Role v1 owns role boundaries and holder-assignment modes; a Role file is not an implicit active agent, user identity, delegation or tool authorization.
- Current VS Code documentation (October 2026): extension language model tools require `contributes.languageModelTools` plus `vscode.lm.registerTool`; agent customizations use `.agent.md`; Agent Skills use `SKILL.md`; extension contributions include `chatSkills` and `chatAgents`. External references: https://code.visualstudio.com/api/extension-guides/ai/tools ; https://code.visualstudio.com/api/references/contribution-points ; https://code.visualstudio.com/docs/agent-customization/custom-agents ; https://code.visualstudio.com/docs/agent-customization/agent-skills.

## Contract Goals

- Portable `inspect-agent-capabilities`-style read-only projection from existing qualified Core operation descriptors: stable operation id, intent, when-to-use/not-use, input object schema, output/receipt, safety class, explicit approval requirements, runtime availability and exact source/contract identities. **The name is a candidate only; use the native operation naming/contribution review process.**
- Candidate host adapters must consume the same projection. A Core operation not qualified for that host, or lacking a machine-readable input contract, must not be exposed as executable by fabricating required parameters.
- Distinguish tool (single bounded action), skill (reusable workflow, often multiple actions), agent (bounded role persona), instructions (cross-cutting guidance), and host instructions. Do not create one skill per Core operation by rote.
- A Role-to-agent projection carries current qualified Role boundaries, prohibits unsupported assignment/delegation, and projects no out-of-scope tool grants. A local generated agent does not create a Tiinex holder assignment or a formal Handoff. VS Code frontmatter `handoffs` is only an agent-UI handoff; never an automatically formal Tiinex transport.
- Portable generator reconciles source identity, previous generated projection and current target by a verified three-way merge. It writes only a qualified generated body region, while YAML frontmatter (including comments/formatting when possible) and unmanaged body sections retain user edits. Detect conflicts instead of silently overwriting user changes. First-generation file or absent field may receive qualified default metadata.
- Protect safety-bearing `tools`, delegated `agents`, `hooks`, `handoffs`, `model` and target settings. Preserve human edits as bytes where safe, but if permissions/agent invocation would exceed the qualified Role/host capability, emit a blocking conflict and no replacement. Unknown future host keys survive unchanged by default rather than being discarded.
- Generated outputs include exact source fingerprints and one reproducible, inspectable projection receipt outside the agent's semantic frontmatter; no invented source Git revisions or currentness decisions. Zero-diff reruns are no-ops, no silent deletion of orphan files, stable ordering/names and case-fold collision checks.
- Supporting LLM authoring: inspect/plan/create should agree about required fields and Transition defaults. Agent documents must point to actual qualified Core operations/parameters rather than encourage raw Markdown improvisation.

## Design Criteria

- Generate single-operation `modelDescription`, `inputSchema` and activation hints directly from Core capability metadata; generate workflow-level skills for clusters such as artifact authoring, lineage move/rebase/recovery and Handoff transport, not every leaf operation. Use specific `name`/`description` values that mention user intent and usage boundaries.
- Role projection is explicitly opt-in and scoped to selected workspace or extension packaging. It must not automatically materialize all roles into every user workspace or create duplicate workspace/extension-contributed agents.
- Expose idempotent `plan`, `diff`, `apply` and `check` phases through portable CLI with identical machine-readable receipts. No host-only projection semantics. `apply` uses explicit paths, workspace trust, approvals, transactional write and collision guards as appropriate.
- Do not turn generated `.agent.md` or `SKILL.md` into authoritative Tiinex artifacts. They are inspectable host outputs; Tiinex schema/Role/operation documents remain the primary sources.

## Tests / Acceptance

- Operation identity, tool name, schema and safety metadata exactly match Core. Unsupported/ambiguous operations are not generated. Plan/apply/rollback/recovery boundaries and read-only-vs-write capabilities are unmistakable.
- Role snapshot changed, generated region untouched -> only generated region updates; modified custom `model`, `tools`, `handoffs` and unknown frontmatter fields remain byte-equivalent or explicitly conflict. Changed generated region both sides -> conflict, no write. Wrong frontmatter type -> blocked.
- Repeatable output names are stable, multiple workspace roots cannot overwrite each other, no unintended generated files in tracked user workspace; update only owned targets and report drift.
- Skill discovery positive and negative prompt evals prove relevant capability chosen and irrelevant capability not suggested. Include `when`, disabled tool, unavailable workspace and model-invoked skill safety cases.
- Proof covers CLI and VS Code with same Core operation/role contracts, ready for a future MCP adapter in its OWN repository. Do not add an MCP server to the VS Code extension.

## Out Of Scope

- No mass creation of host files until project ownership, exact capability schemas and interactive invocation tests are qualified. No implicit Role activation, remote write, or direct rewrite of Tiinex canonical artifacts based on user frontmatter.

## Scope

- Portable Core capability projection, CLI access, source identity, deterministic host-facing generation plan and safe idempotent synchronization. Implementation occurs in an owning Core workstream once Move/Rebase and CLI parity are qualified.

## Dependencies

- Qualified Core operation catalog and Native Role schema; real Role artifacts from Business, and safe host capability facts. VS Code adapter consumes this work only after the portable contract is proven.

## Done Criteria

- A qualified Core/CLI plan/diff/apply/check workflow emits reproducible tools/skills/agents projections without hand-authored Markdown semantics; preserved user frontmatter and non-generated body; authorization checked; canonical source unchanged; test harness verifies positive/negative Copilot discovery and ID/schema/permission drift.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: WtOVUp7J4SMXPvEBE_v_9SGEWBBt5aMzHqj2EkOeGnY