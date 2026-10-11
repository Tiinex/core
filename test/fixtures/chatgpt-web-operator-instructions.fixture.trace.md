# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: tiinex.annotation.v1
  - Created At: 2026-10-11 13:36:18
  - Authors: Anchor
  - Why: Provide human transport help without altering Target Entry or recipient grounding.
  - Summary: Operator-only transport preparation and privacy guidance for ChatGPT Web, bound to a qualified Target Entry.
  - Status: ready/local

---

## Annotation Identity

- Annotation Name: ChatGPT Web manual transport instructions
- Annotation Kind: note
- Annotation State: proposed
- Canonical Identifier: tiinex.interop.openai.annotation.chatgpt-web.operator-transport.v1
- Owner: Tiinex Interop OpenAI

## Annotation Target

- Target Kind: target-entry
- Target Identifier: tiinex.interop.openai.entry.target.chatgpt-web.v1
- Target Artifact: [ChatGPT Web Target Entry](001-chatgpt-web-target-entry.trace.md)

## Annotation Value

- Value Type: operator-only-manual-transport-guidance
- Value Format: human-readable-checklist
- Value: Help a human prepare and manually carry a qualified Tiinex package to ChatGPT Web; do not add this guide to the recipient's instruction prompt.
- Value Boundary: Human operator presentation on explicit request; no Handoff authority, Target capability grant, or automatic LLM grounding.

### Preparing a fresh ChatGPT Web session

1. Open [ChatGPT](https://chatgpt.com/) and choose a fresh isolated project or conversation, as appropriate to the intended continuity. Use a descriptive project title from the Tiinex prefix and role/dimension, not the carrier slug. A fresh project reduces unrelated visible context but cannot guarantee a context-free host.
2. Check that this ChatGPT session exposes the required file attachment and code/runtime capabilities for the intended work. These may differ by account, plan, or environment. If a needed capability is absent, stop and choose a qualified alternative instead of assuming it exists.
3. Consider disabling optional Memory/personalization and model-improvement sharing where your account allows it. Review [ChatGPT Data Controls](https://help.openai.com/en/articles/7730893-data-controls-in-chatgpt). These settings are separate and do not disable all platform logging or guarantee complete isolation.
4. If working with sensitive material, avoid optional response ratings, side-by-side answer comparisons, research surveys or other feedback controls unless you understand the data implications. OpenAI states that submitting feedback may allow the associated conversation to be used for model training even after opting out; see [model-improvement guidance](https://help.openai.com/en/articles/5722486-how-your-data-is-used-to-improve-model-performance).
5. If carrying company, client or confidential data, obtain the relevant organization's approval for the chosen service and workspace before uploading. A Tiinex Handoff is not a data-processing agreement or authorization to disclose protected information.

### Manual cold start

1. Attach the **unchanged**, qualified Handoff Package using ChatGPT Web's normal file upload interface. Do not extract the ZIP or paste internal Workspace files into the conversation as a substitute.
2. Paste the **exact Core-projected** transport text for the selected Handoff route and Target Entry, then send it. Do not add this operator guide to that text.
3. Let the receiving Tiinex session follow the package's `Start` and qualified continuation path. Only the target instructions selected for the receiver's actual Target Entry become relevant to its execution environment; this operator-only annotation is not a recipient bootstrap procedure.

### Warm continuation

1. In the already-grounded recipient conversation, attach the **new unchanged package** and continue with its Tiinex-qualified bootstrap/routing discipline. The recipient must still read the new package's Start and route rather than infer continuity from chat history.
2. Do not repeat fresh-project setup when continuing the same approved continuity unless context boundaries or host settings changed.

### Manual-transport and provider terms boundary

- Tiinex prepares and validates the package and exact routing text; the human uploads, sends, and downloads it through the provider's supported user interface. Tiinex does not automate ChatGPT Web interaction, scraping, or bulk extraction. API integrations, if any, are a separate Target under their own applicable conditions.
- Review [OpenAI Terms of Use — What you cannot do / Our use of content](https://openai.com/policies/terms-of-use/) and [European Terms of Use](https://openai.com/policies/eu-terms-of-use/) where applicable. The consumer terms restrict automatic/programmatic extraction of content and circumvention of service restrictions.
- Review [OpenAI Privacy Policy — How we use personal data](https://openai.com/policies/privacy-policy/) and [Data Controls](https://help.openai.com/en/articles/7730893-data-controls-in-chatgpt) for data-use and optional sharing controls. Do not characterize every host prompt or feedback widget as third-party disclosure; behavior may vary by feature.
- These links describe provider rules at the time of authoring. Current terms, account settings and organization-specific contracts take precedence; there is no guarantee of zero retention, zero telemetry or complete isolation.

## Annotation Provenance

- Annotation Source: Tiinex operator feedback plus linked first-party OpenAI service terms and Help Center explanations.
- Annotation Method: Human-oriented summary and bounded provider-source review; links are guidance, not immutable attestations of provider policy.
- Created By: Anchor
- Human Input Boundary: This guide reflects operator preferences; it must not be inferred as a platform promise or silent recipient instruction.

## Annotation State

- State: proposed
- Review Needed: yes — operator content, Core discovery and human-preview boundary pending Sigma acceptance.
- Review Method: Qualify target identity, annotation structure, source links, exact clipboard isolation and positive/negative target discovery.

## Interpretation Limits

- Does Not Mean: OpenAI approves Tiinex, that every feature or UI control has a single fixed data policy, that a new project erases all hidden context, or that a user has permission to disclose confidential information.
- Must Not Be Used To Claim: Handoff/Role/Task/Process authority, automatic target applicability, recipient bootstrap instruction, provider compliance certification, guaranteed confidentiality, or remote-mutation authorization.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: o4ViFX2a8TqiZrlNXGhi5EsWNYHVzzq-9hcOc-FGZXQ