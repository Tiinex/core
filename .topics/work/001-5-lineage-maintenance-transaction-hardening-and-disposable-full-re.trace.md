# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-03 21:16:05
  - Trace: [001-deterministic-lineage-maintenance-projection-and-apply-task.trace.md](001-deterministic-lineage-maintenance-projection-and-apply-task.trace.md)
  - Origin:
    - [relative](001-deterministic-lineage-maintenance-projection-and-apply-task.trace.md)
- Current
  - Current Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-10-06 14:33:47
  - Authors: Anchor; Sigma
  - Why: Close the process-death and concurrency safety gap before any canonical hygiene or specialist-role dogfood is considered.
  - Summary: Record locking, durable journal, crash recovery, concurrent-writer fail-closed behavior, and the 24-namespace disposable full hygiene rehearsal.
  - Status: ready/local

---

# Lineage Maintenance Transaction Hardening And Disposable Full Rehearsal Evidence

## Supported Claim Or Question

- Supported Claim Or Question: whether exact local lineage-maintenance apply is hardened enough to survive cooperative concurrency, process death, and explicit recovery without silently overwriting unexpected concurrent bytes, and whether the known 24 numeric hygiene drifts can be normalized successfully in a disposable 17-Workspace rehearsal.
- Evidence Role: bounded implementation, crash-recovery, concurrency, regression, and disposable dogfood evidence for the Deterministic Lineage Maintenance Task.
- Target Artifact: Deterministic Lineage Maintenance Projection And Apply.
- Review Context: prior synchronous rollback evidence did not establish process-death safety. Broad hygiene required cooperative locking, durable journal state, crash recovery, and explicit concurrent-writer behavior before any canonical apply could be considered.

## Provenance

- Known Source: exact pointerless Workspace carrier `tiinex-027-1-1.handoff-package.zip`, the local Core candidate derived from that carrier, and disposable copies of all 17 carried Workspace Representations.
- Preservation Basis: all 24 real Normalize applies were performed only against disposable Workspace copies. The canonical carried Workspaces and remote repositories were not mutated.
- Provenance Limits: successful disposable rehearsal is technical evidence, not canonical hygiene acceptance, Task closure, migration authority, or remote-mutation authority.

## Evidence Material

- Material: hardened local apply transaction contract plus full disposable hygiene rehearsal.
- Material Kind: implementation and verification evidence.
- Cooperative Locking: apply acquires an exclusive `.tiinex/lineage-maintenance.lock` per participant Workspace in deterministic Workspace-id order and blocks a second cooperative apply rather than racing it.
- Durable Transaction Journal: every destructive apply creates a durable per-Workspace transaction journal under `.tiinex/lineage-maintenance-transactions/<transaction-id>/` before source paths move. Journal phase updates and staged output writes are fsync-backed before later destructive phases proceed.
- Atomic Source Preservation: affected source files are atomically renamed into transaction-local backups before projected outputs are written, preserving exact original bytes for recovery.
- Crash Recovery: explicit `recover-lineage-maintenance` rolls an uncommitted transaction back to exact projected input bytes and finalizes a durably `committed` transaction without rolling it back.
- Recovery Safety: recovery refuses to remove or overwrite unexpected bytes at source/target paths, preserves conflicting external bytes, requires all participant Workspace roots, and does not clear a lock whose owner cannot be proven dead on the current host.
- Concurrent-Writer Boundary: apply re-qualifies input fingerprints under lock immediately before destructive mutation and checks target absence again after source staging. Non-cooperative writers are therefore detected where observable; unexpected bytes fail closed rather than being overwritten.
- Plan Binding: exact plan fingerprint still binds representation coverage, operation, input fingerprint, and projected output fingerprints. `complete` Workspace Representation remains required for mutation-ready lineage maintenance.
- Cleanup Contract: successful apply removes its transaction journal and cooperative lock. A failed automatic rollback that cannot prove safety preserves durable recovery state and requires explicit recovery.

## Crash And Concurrency Verification

- Cooperative lock regression: a second apply is blocked while a Workspace lock is held.
- Process-death regression after source staging: child process exits with original held only in durable backup; explicit recovery restores exact original bytes, removes no external data, and clears recovery state.
- Process-death regression after durable commit: explicit recovery finalizes the commit and preserves exact projected output.
- Concurrent target conflict regression: recovery blocks and preserves unexpected external bytes until the conflict is removed; a later recovery restores exact original input.
- Foreign-host lock regression: recovery keeps an unverifiable foreign-host lock and fails closed rather than assuming the owner is dead.
- CLI regression: `recover-lineage-maintenance` exposes explicit local crash recovery through the portable CLI.
- Successful apply regression: no transaction journal or Workspace lock remains after verified commit.

## Disposable Full Hygiene Rehearsal

- Input Boundary: 17 complete Workspace copies from `tiinex-027-1-1`.
- Initial Inventory: 302 `.topics` directory surfaces; 55 numeric-only, 247 non-numeric-only, 0 mixed; 31 compact numeric namespaces, 24 drifted, 0 blocked.
- Apply Count: 24 exact `normalize-directory` plans applied serially, re-qualifying the current Workspace after every apply.
- Final Inventory: 302 directory surfaces; 55 numeric-only, 247 non-numeric-only, 0 mixed; 55 compact numeric namespaces, 0 drifted, 0 blocked.
- Preservation Observation: the non-numeric-only surface count remained 247 and none became a Normalize target.
- Transaction Hygiene: every successful rehearsal apply left zero active lineage-maintenance locks and zero pending transaction journals.
- Carrier Rehearsal: the fully normalized disposable 17-Workspace set manufactured as local progression carrier `tiinex-027-1-1-1`; package validation passed, physical roundtrip passed, and the package's embedded bootstrap cold-oriented all 17 Workspaces with zero findings.
- Rehearsal Carrier Boundary: `027-1-1-1` is disposable verification output only and is not a canonical recovery checkpoint or accepted continuation by virtue of being manufactured.

## Verification

- Full Core regression before Evidence authoring: 466 tests, 466 pass, 0 fail, 0 skipped.
- Focused transaction suite covers cooperative locking, crash rollback, committed finalization, concurrent conflict preservation, stale orphan lock recovery, foreign-host fail-closed behavior, CLI recovery, and successful cleanup.
- Disposable full hygiene rehearsal completed 24/24 Normalize applies successfully and converged to 55/55 compact numeric namespaces.
- Disposable normalized carrier validation and cold orientation both returned ready/clean with zero findings.

## Preservation And Fidelity

- Preservation State: semantic Parent remains authoritative and is preserved by Normalize; filename compaction remains explicit structural maintenance rather than an implicit Reduction effect.
- Fidelity Notes: the hardened apply surface strengthens local mutation safety without widening semantic operation authority or making bounded Workspace Representations mutation-ready.
- Known Losses: none observed in the disposable rehearsal; canonical source remained untouched.

## Interpretation Limits

- Not Yet Used As: canonical hygiene acceptance, authority to land the 24 real Normalize changes, broad migration authority, Task 018 closure, specialist-role acceptance, or remote mutation authority.
- Does Not Prove: safety against arbitrary non-cooperative filesystem writers that mutate bytes in an undetectable race window, distributed locking across unrelated hosts, or recovery when required participant Workspace roots are unavailable.
- Must Not Be Treated As: automatic rebase after Reduction, permission to delete historical material, or proof that specialist-role dogfood may bypass the separately qualified hygiene/landing gate.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-deterministic-lineage-maintenance-projection-and-apply-task.trace.md](001-deterministic-lineage-maintenance-projection-and-apply-task.trace.md)
  - Value: PY3SeYcMqPM2_xM_lPUmHAbYB1BS2H6FMv5P0bVyAYI

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 9BSxx4bOJ8vFJz96r2RhK54qL3CkeYp7WLCxmOOz288