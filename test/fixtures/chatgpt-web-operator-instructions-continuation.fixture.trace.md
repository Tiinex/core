# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: tiinex.annotation.v1
  - Created At: 2026-10-11 13:36:18
  - Trace: [001-chatgpt-web-target-instructions.trace.md](001-chatgpt-web-target-instructions.trace.md)
  - Origin:
    - [relative](001-chatgpt-web-target-instructions.trace.md)
- Current
  - Current Schema: tiinex.annotation.v1
  - Created At: 2026-10-11 14:32:56
  - Authors: Anchor
  - Why: Make host guidance readable without changing recipient transport or source Target semantics
  - Summary: Human-facing transport help with concrete project naming and simplified steps
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

### Starting a new ChatGPT project?

1. Open **[ChatGPT](https://chatgpt.com/)**. Create a **new project**, then start a new chat inside it. The exact menu names may change with your account or version.
2. **Name your project:** copy the **Suggested project title** shown at the top of this preview. Do **not** use the long `.handoff-package.zip` filename as the title. If no title is suggested, use a short, memorable name for this work.
3. Keep the project free from unrelated chats, files and custom instructions. A fresh project reduces unwanted prior context, but **cannot guarantee a context-free host**.
4. Check that your chat can **attach ZIP files** and use the code/runtime tools needed for the work. Capabilities vary by account. If a required capability is missing, choose another qualified environment rather than improvising.

### Your privacy choices (recommended)

These are **recommendations, not required changes**. Decide which settings suit your work **before** uploading confidential files.

1. In ChatGPT, open **Settings → Data Controls**. If your account offers **Improve the model for everyone**, consider turning it off. [See OpenAI's Data Controls guide](https://help.openai.com/en/articles/7730893-data-controls-in-chatgpt).
2. Check **Settings → Personalization**. Consider disabling optional **Memory** and other personalization that could draw on unrelated conversations. Memory and model training are **different controls**.
3. When using sensitive information, **skip optional feedback** such as thumbs-up/down, answer comparisons, or surveys unless you understand how the information may be used. OpenAI explains that submitting feedback may allow the associated conversation to be used for training even after opting out: [How data is used to improve model performance](https://help.openai.com/en/articles/5722486-how-your-data-is-used-to-improve-model-performance). This does **not** mean every popup is an external disclosure.
4. If the package contains **company or client information**, ask your organization whether this account and workspace are approved for that data **before uploading**. A package does not grant permission to share confidential information.

Turning off optional settings does not disable all security logging or guarantee zero retention. Check the applicable account and organizational terms.

### Send your package — manually

1. Use ChatGPT's normal **Attach file** control to upload the **unchanged ZIP package** named above. Do not extract its internal files or replace the ZIP with pasted contents.
2. Find **Exact text to paste into the chat** below this guide. Copy it **exactly**, paste it into the same chat, and press **Send**.
3. ChatGPT should follow the package's own starting instructions. **Do not paste this human guide into the chat** as additional instructions.

### Already continuing an existing conversation?

1. Stay in the existing, approved conversation for this role and work. You do **not** need to create another project or change its title.
2. Attach the **new unchanged ZIP package** and use its exact transport text when available. The receiving assistant still needs to qualify the new package rather than rely only on chat history.

### Why manual transport and privacy checks?

- **Manual transfers:** Tiinex prepares the package; **the human uploads, sends, and downloads it**. Tiinex does not automate ChatGPT Web, scrape its pages or bypass provider limits. See [OpenAI Terms of Use — What you cannot do](https://openai.com/policies/terms-of-use/) or [European Terms](https://openai.com/policies/eu-terms-of-use/) where applicable. Automated/programmatic extraction and circumvention are restricted. API access, if separately supported, has different terms.
- **Data use:** Read [OpenAI Privacy Policy — How we use personal data](https://openai.com/policies/privacy-policy/) and [Data Controls](https://help.openai.com/en/articles/7730893-data-controls-in-chatgpt) to understand optional sharing and limitations.
- **Current rules matter:** UI controls and policies change. Your current provider agreement, account settings and organizational requirements take precedence; this guide cannot promise complete isolation, confidentiality or compliance.

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
  - Towards: [001-chatgpt-web-target-instructions.trace.md](001-chatgpt-web-target-instructions.trace.md)
  - Value: o4ViFX2a8TqiZrlNXGhi5EsWNYHVzzq-9hcOc-FGZXQ

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 54D6TGb92qP130ZiHKfl-e-JJGYl0hkX31eC6AHX8Xg
