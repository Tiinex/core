# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.entry.target.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/entry/target/tiinex.entry.target.v1.schema.md)
  - Created At: 2026-10-05 19:18:00
  - Authors: Anchor; Sigma
  - Why: Keep ChatGPT Web environment capabilities, limitations and continuity adaptation discoverable as a target-specific Entry without tainting provider-neutral Entry semantics.
  - Summary: OpenAI-owned Target Entry for composing portable purpose Entries with the ChatGPT Web execution environment.
  - Status: ready/local

---

# ChatGPT Web

## Entry Identity

- Name: ChatGPT Web
- Version: 1
- Canonical Identifier: tiinex.interop.openai.entry.target.chatgpt-web.v1
- Entry Family: tiinex.target-entry.openai.v1
- Human Label: ChatGPT Web

## Purpose And Scope

- Purpose: Augment a qualified purpose Entry with ChatGPT Web environment knowledge, capability declarations, limitations, continuity guidance and host-specific source discipline.
- In Scope: ChatGPT Web host adaptation, conversation continuity constraints, attachment/package transport, qualified host capability knowledge, OpenAI-specific process references
- Out Of Scope: granting Role authority, selecting work, creating Handoff routing, making a Process applicable merely by reference, authorizing remote mutation, or redefining portable Entry semantics

## Entry Context

- Entry Target: ChatGPT Web execution environment
- Required Context: the separately selected qualified purpose Entry plus any authority-bearing Handoff/Role/Task material required by that bounded activity
- Relevant Context: ChatGPT-specific capability/limitation material and qualified OpenAI host process guidance
- Context Exclusions: chat chronology, attachment presence, model/provider identity, or UI state do not become semantic authority merely because this target is selected

## Entry Method

- Method: qualify this target and its declared Target Material, combine its environment constraints with the separately selected purpose Entry, preserve authority from the controlling Handoff/Role/Task surfaces, and expose host-specific capability/limitation knowledge without changing portable Entry meaning
- Readiness Boundary: the selected purpose Entry remains qualified, required authority remains independently qualified, and the target-specific material needed for the current environment has been qualified or its absence preserved explicitly
- Stop Conditions: target material conflicts with controlling authority; a required host capability is unavailable; the active host cannot be established with sufficient confidence for target-specific behavior

## Target Identity

- Target Handle: chatgpt-web
- Target Kind: interactive-web-host
- Canonical Target Identifier: openai.chatgpt.web
- Provider: OpenAI
- Host: ChatGPT Web
- Human Label: ChatGPT Web

## Target Capabilities

- Provides: conversational interaction, file upload, file attachment delivery, downloadable generated artifacts, conversation branching when exposed by the host, bounded connector/tool surfaces when available
- Limitations: conversation/context limits remain finite; host runtime storage is not durable project authority; capability availability may differ by account/session/client; live host UI state must not be inferred from package content alone

## Target Material

- ChatGPT continuity and source discipline
  - Reference: ../../../.processes/chatgpt-session-continuity/001-chatgpt-session-continuity-and-source-discipline-process.trace.md
  - Purpose: Supply the OpenAI-owned host adaptation for package-first recovery, carried-source preference, attachment delivery, runtime survivability, grounded checkpoint/emergency status presentation and human interaction boundaries.
  - Label: ChatGPT Session Continuity And Source Discipline
  - Qualification Notes: Reference presence makes this material relevant to target grounding; its own applicability/execution semantics remain independently authoritative.

## Operator Continuity Presentation

When this Target Entry is active, qualify the referenced ChatGPT continuity process early enough that checkpoint and broken-sandbox behavior need not be invented under pressure. Target selection makes the host guidance discoverable/relevant; it still does not independently make a Process applicable or grant authority.

Use the grounded status legend for compact operator projections:

- `✅` = yes / recommended / required when stated
- `◯` = optional / not necessary
- `❌` = no / do not
- `⚠️` = attention / degraded or emergency state

For ordinary checkpoint/recovery responses, place the compact status projection near the bottom of the message and place the exact package link immediately below it. Put deeper explanation above so the operator can stop at the bottom when only disposition matters.

For a Tiinex Handoff Package download, display the **exact Core-projected `humanOutput.primary.filename`** and link the verified `primaryOutput.path` without a descriptive/short-name alias. Before offering an attachment, compare its basename and bytes with the actual Core manufacture receipt; use the bounded `tools/verify-chatgpt-carrier-download.mjs` host check when available. A ChatGPT download failure does **not** authorize manually renaming an otherwise canonical carrier: retry the canonical link or explicitly report the host limitation. If the browser itself relabels a saved/downloaded attachment, distinguish that observable UI label from the original Core-projected filename. This rule guards host presentation, not carrier lineage authority or semantic Parent resolution.

For a broken/unreliable ChatGPT sandbox, use the qualified `Recover From Broken Sandbox Through Latest Checkpoint` transition and its `EMERGENCY RECOVERY` projection rather than improvising a new recovery flow. A fresh chat plus exact checkpoint package is the conservative recovery path; branch context is not durable recovery authority.

When suggesting ChatGPT conversation titles, render branch dimensions with spaces around separators, for example `1 - 1 - 1 (Recovery Checkpoint)`. This is host-facing presentation only and does not alter Tiinex carrier dimensions or semantic lineage.

## Target Compatibility

- Compatibility Notes: May augment portable Session Entries such as Start, Explore and Resume when ChatGPT Web is the active execution environment; future discovery should prefer qualified capability/contract matching over hardcoded per-Entry allowlists.

## Interpretation Limits

- Does Not Establish: Handoff routing, recipient authority, Role-holder state, participant authority, Process applicability, task ownership, work transfer, remote-write permission, acceptance, completion, or permanent host durability
- Must Not Be Inferred: that every ChatGPT session exposes every declared capability; that branching or attachments are always available; that OpenAI-specific behavior belongs in Core or portable Native

## Portability Notes

- Portable Semantics: none beyond the inherited Target Entry composition contract; this artifact intentionally owns ChatGPT Web-specific environment meaning
- Environment Assumptions: an active ChatGPT Web session whose relevant host capabilities can be observed or qualified
- Non-Portable Details: OpenAI/ChatGPT product behavior, conversation branching, attachment/download affordances, connector/tool availability, and host runtime survivability

---

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: self
  - Value:Q2QPkKJl7YLv2hS-rdH63_5T3AG4yI-quUtRh1OCvsc