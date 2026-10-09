# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.entry.target.v1](https://github.com/Tiinex/docs/blob/2262a1c4b35e887d116d0d01a864074a9f1641c2/.topics/.schemas/entry/target/tiinex.entry.target.v1.schema.md)
  - Created At: 2026-10-09 11:27:29
  - Authors: Anchor
  - Why: Keep host-specific agent/transport semantics out of portable Native/Core and preserve exact What/Where authority.
  - Summary: Target Entry for VS Code and user-hosted Copilot transport, operator permissions, grounding and session boundary.
  - Status: ready/local

---

# VS Code Copilot Execution Target

## Entry Identity

- Name: VS Code Copilot
- Version: 1
- Canonical Identifier: tiinex.host.vscode.copilot.target.v1
- Entry Family: tiinex.guided-entry.native.v1
- Human Label: VS Code / Copilot

## Purpose And Scope

- Purpose: Adapt a qualified Tiinex purpose Entry to VS Code and a user-hosted Copilot agent session without changing Tiinex semantic authority.
- In Scope: orienting to an attached carrier, opening a Markdown instruction tab, reading clipboard transport text, discovering local operator state, selecting grounded role context
- Out Of Scope: automatic Role assumption, Incoming Replace, unreviewed workspace mutations, automatic remote upload, or treating VS Code agent pre-prompts as Tiinex Process authority

## Entry Context

- Entry Target: VS Code desktop extension host with user-controlled files and an explicitly chosen Copilot session
- Required Context: the exact current Role reference if any, qualified Handoff carrier and route, current Workspace trust and available Core runtime
- Relevant Context: VS Code active workspace folders, carrier transport queue, Chat attachment surface and displayed transport receipt
- Context Exclusions: extension UI notifications, clipboard content and a chat attachment are not evidence of Handoff acceptance, current Role or Process applicability

## Entry Method

- Method: in the VS Code Tiinex Transport view choose the exact carrier and one Handoff route if multiple routes exist; use Copy exact Tiinex transport text to open the Markdown instructions and copy the Core-projected text; attach the unchanged ZIP to the intended Copilot chat using the available chat-attachment control or drag-and-drop; paste the exact transport text alongside the ZIP; explicitly confirm the receiving Role and ground through Start/bootstrap before any Process application. If chat attachment or copying is unavailable, ask the operator to complete those steps manually.
- Readiness Boundary: explicit Core grounding result and independently qualified Process state are available for the intended task

## Presentation And Interaction

- Intended Audience: VS Code operator and Copilot agent
- Presentation Guidance: use Tiinex transport Markdown receipt with exact canonical carrier name and clipboard text, keeping optional guidance clearly separated from actual Handoff routing

## Target Identity

- Target Handle: vscode-copilot
- Target Kind: local-ide-agent-host
- Canonical Target Identifier: tiinex.target.vscode.copilot.v1
- Provider: Microsoft
- Host: Visual Studio Code / GitHub Copilot
- Human Label: VS Code / Copilot

## Target Capabilities

- Provides: native extension commands, local files, markdown editor tabs, clipboard transport presentation, operator-authored Handoff attachment to chat
- Limitations: Copilot often executes on the human host; its pre-prompts and tool availability depend on the selected harness; unlimited terminal permissions are not a Tiinex security sandbox

## Target Material

- copilot-panel-delegation
  - Reference: [VS Code Target Entry Copilot Panel Actions And Transport Instruction Tab](../../../work/native-agent-surface/001-2-vs-code-target-entry-copilot-panel-actions-and-transport-instruc.trace.md)
  - Purpose: Qualify VS Code's operator-panel access levels None, Pack and Transport, and Inspect/Unpack/Pack/Transport; these do not gate normal authoring, grounding or the Core CLI
  - Qualification Notes: Read the exact owning Task and current implementation before treating any capability as available; no Target reference activates Process or grants permission

## Target Compatibility

- Compatible Entry Families: tiinex.guided-entry.native.v1
- Compatibility Notes: Target may augment a qualified first-party Start, Resume or Explore Entry, never change its role/recipient/task authority

## Interpretation Limits

- Does Not Establish: Role holder state, Handoff routing or acceptance, Process applicability, permission to modify local files or remote services
- Must Not Be Inferred: that a carried Handoff is addressed to the Copilot agent, or that seeing a transport panel event permits a destructive command

## Portability Notes

- Portable Semantics: explicit target environment adaptation to a separately qualified Tiinex purpose Entry
- Environment Assumptions: the operator has installed the Tiinex VS Code extension in a trusted local workspace
- Non-Portable Details: VS Code Markdown editor commands, VS Code Clipboard, Copilot native agent tool discovery, client-host session hooks

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: dNijeeMt4k2JEkGSJYqBbKOHFtQgRNcRfD3cZ0ZY4UM