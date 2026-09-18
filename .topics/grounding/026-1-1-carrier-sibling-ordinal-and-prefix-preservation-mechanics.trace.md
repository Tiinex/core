# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-17 11:35:17
  - Trace: [026-1-recipient-carrier-cache-and-grounding-mechanics.trace.md](026-1-recipient-carrier-cache-and-grounding-mechanics.trace.md)
  - Origin:
    - [relative](026-1-recipient-carrier-cache-and-grounding-mechanics.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-17 11:57:14
  - Authors: Anchor
  - Why: Fresh carrier manufacture exposed that local retry reservations can create false sibling progress such as 002-1-3 without three real Handoff branches.
  - Summary: Correct carrier return siblings to derive from actual Handoff route ordinals, preserve sent prefixes, and prevent retries from consuming visible lineage.
  - Status: ready/local

---

# Carrier Sibling Ordinal And Prefix Preservation Mechanics

## Objective

Correct portable carrier-lineage allocation so human-visible carrier dimensions reflect actual Handoff route ordinals and explicit consolidation/stabilization, never manufacture retries or local allocation attempts.

This is carrier progress/navigation mechanics only. It must not alter artifact Parent lineage, Handoff semantic authority, or Workspace source truth.

## Done Criteria

- Remove manufacture-attempt/retry counting as a source of carrier sibling identity.
- For a sent carrier with one qualified Handoff Pointer, the Handoff's return branch ordinal is `1`.
- For a sent carrier with N qualified Handoff Pointers, assign each route a deterministic ordinal `1..N` from the canonical sorted carrier tree / pointer ordering used by the package itself.
- A recipient return preserves the exact sent carrier prefix/dimension and appends only that selected route's ordinal. The sender, chat host, filename collision handling, retry count and local filesystem state must not choose a different ordinal.
- Anchor consolidation of all N returns from one batch uses sibling ordinal `N+1` from the common pre-batch carrier frontier. It must not become a child of one arbitrary specialist return.
- A following batch proceeds from the consolidation frontier; its later returns append their route ordinals to that consolidation dimension.
- An explicit major bump remains a separate stabilization checkpoint operation. It must not be inferred from route count, retries, artifact lineage, or filename collisions.
- Carrier prefix/dimension selected for an outgoing package must remain the prefix used when that package is returned or continued, unless Anchor explicitly creates a new major checkpoint.
- Multiple routes may share one multi-Workspace carrier while retaining independent return ordinals. No sibling route is semantic authority for another route.
- Carrier lineage must remain a human progress / work-package stitching projection and must never be copied into durable artifact Parent lineage unless independently true.
- Replace or isolate the current local `.tiinex-handoff-sibling-allocations` retry-reservation behavior so failed manufacture attempts do not consume visible carrier sibling ordinals.
- Add regression coverage for: one route; three routes; retry-before-success; returns arriving out of order; consolidation after N returns; second batch after consolidation; explicit major bump; filename collision; and artifact-lineage independence.
- Existing cache/participant/holder-binding mechanics from the parent Task remain in force and must stay green.

## Scope

Core portable Handoff carrier lineage allocation, return manufacture/projection, consolidation support where already represented by carrier operations, and focused tests only.

## Dependencies

- Parent Task `Recipient Carrier Cache And Grounding Mechanics`.
- Existing carrier-lineage projection remains non-authoritative for artifact semantics.
- Existing qualified Handoff Pointer ordering / package tree projection is the only permitted source for route ordinal derivation.

## Boundaries

- No artifact-lineage rewrite.
- No new semantic schema.
- No JSON/index/checksum sidecar authority.
- No host-private retry ledger as human-visible carrier truth.
- No sibling traversal for selected-route grounding.
- No automatic major bump.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [026-1-recipient-carrier-cache-and-grounding-mechanics.trace.md](026-1-recipient-carrier-cache-and-grounding-mechanics.trace.md)
  - Value: qUmfFdL2S-deGs5deVJRIGQCLb8CpQ-1u8Xc85B7D_k

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: UEn1EdhKu6_zDQI6_lta2d_35rdQgog4SYfuVCQ6iCc