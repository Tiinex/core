# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-09 14:58:54
  - Trace: [001-turn-2-portable-tooling-and-allocation-discipline.trace.md](../001-turn-2-portable-tooling-and-allocation-discipline.trace.md)
  - Origin:
    - [relative](../001-turn-2-portable-tooling-and-allocation-discipline.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-09 18:11:52
  - Authors: Anchor
  - Why: The first post-bootstrap package batch exposed both already-existing-version collisions and OIDC E404 failures; shared release tooling must distinguish those states before automatic publication is trusted across independently versioned repos.
  - Summary: Make automatic npm publication converge safely after bootstrap while preserving fail-closed release behavior.
  - Status: ready/local

---

# Automatic npm publication convergence and idempotency

## Objective

Make the existing master-branch npm publication path converge safely after one-time bootstrap publication without treating registry propagation lag, package absence and authorization failure as the same condition.

## Done Criteria

- A just-bootstrap-published package cannot cause an automatic workflow to repeatedly attempt the same already-existing version as though the package were durably absent.
- An exact already-published version is treated idempotently only after its registry integrity can be verified against the prepared archive.
- Registry propagation lag is handled with a bounded, observable retry/recheck policy rather than by weakening fail-closed registry or authorization behavior.
- A real authorization/Trusted Publisher failure remains a failure and is distinguishable from an already-existing-version collision.
- Version planning remains deterministic from the tested source commit and existing release policy.
- Focused tests cover bootstrap-to-OIDC convergence, exact-version collision recovery, registry lag and true publication failure without adding broad release-suite debt.
- Exact qualification receipts record which failure class was reproduced and what behavior was proven.

## Scope

Shared npm release mechanics in Core and their focused tests. No package-specific API changes and no remote npm/GitHub mutation by the implementation role.

## Dependencies

- Current `@tiinex/core` release policy and release runner.
- Post-landing GitHub Actions evidence from the new package repositories.

## Out Of Scope

- Configuring npm Trusted Publishers or GitHub environments.
- Publishing a package on behalf of Sigma.
- Treating every npm 404 as eventual consistency.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-turn-2-portable-tooling-and-allocation-discipline.trace.md](../001-turn-2-portable-tooling-and-allocation-discipline.trace.md)
  - Value: WOMe5yr432wwydKlPQSPPZs95rGEXQrVoewCbGSt3iU

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 7v3huYdUPmDpz_MkI0utMS8C54GOXO8B3wNknmHbMPE