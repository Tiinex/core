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
  - Created At: 2026-10-06 15:51:49
  - Authors: Anchor; Sigma
  - Why: Restore human-readable commit provenance while keeping semantic ownership host-neutral and mutation authority separate.
  - Summary: Record the shared Core staged-index provenance tree used by CLI, VS Code, and future hosts without reading unstaged working-tree bytes.
  - Status: ready/local

---

# Stage-Exact Git Commit Provenance Projection Evidence

## Supported Claim Or Question

- Supported Claim Or Question: whether commit provenance for Tiinex trace artifacts can be projected once in Core from the exact staged Git index and reused by CLI, VS Code, and future hosts without reading unstaged working-tree bytes.
- Evidence Role: bounded implementation and regression evidence for a host-neutral Git commit provenance projection.
- Target Artifact: Deterministic Lineage Maintenance Projection And Apply.
- Review Context: Sigma observed that auto-commit/push worked but generic commit messages no longer exposed expected human-readable trace provenance. The desired projection is a stable tree view whose leaf nodes carry change status, human schema label, and filename.

## Provenance

- Known Source: local Core candidate descended from recovery carrier `tiinex-027-1-1-1`, plus the current thin VS Code adapter candidate consuming the Core operation.
- Preservation Basis: no commit, push, remote write, canonical hygiene apply, or repository mutation was performed by this work.
- Provenance Limits: this Evidence establishes projection mechanics and host reuse only; it does not establish Git policy, acceptance, release readiness, or authority to commit/push.

## Evidence Material

- Material: current local Core candidate source, focused regression output, and exact bounded replay observations described below.
- Material Kind: implementation and verification evidence.
- Shared Ownership: Core owns the provenance model, schema-label presentation, Unicode box-drawing tree rendering, and portable operation `project-git-commit-provenance`.
- Host Boundary: the Node/Git adapter supplies exact staged Git index state; VS Code is a thin consumer of the same Core operation and does not own commit-provenance semantics.
- Exact Bytes: added/modified/renamed trace content is read from the Git index; deleted trace content is read from `HEAD`; unstaged working-tree bytes are not used to derive provenance.
- Trace Boundary: provenance leaves include only `.topics/**/*.trace.md` material.
- Leaf Presentation: `[+]`, `[~]`, `[>]`, and `[-]` represent Added, Modified, Renamed/Moved, and Deleted. Schema identifiers such as `tiinex.transition.definition.v1` are projected to human labels such as `Transition Definition`; this label is presentation only.
- Tree Presentation: relative paths are sorted lexicographically and rendered using UTF-8 box-drawing characters `│`, `├──`, and `└──`; metadata appears only at leaf nodes.
- Rename Presentation: the destination path owns the leaf and the prior relative path is preserved as provenance.
- Commit Shape: a short subject such as `Tiinex: Update <repository>` is followed by a `Tiinex provenance` tree when trace changes exist.
- Authority Boundary: commit provenance is not semantic Parent authority, currentness authority, acceptance, or mutation authority.

## Verification

- Focused Core regression covers human schema-label projection, path-sorted tree rendering, portable operation exposure, index-vs-working-tree behavior, deleted bytes from HEAD, and rename projection.
- Full Core regression at checkpoint: 480 tests, 480 pass, 0 fail, 0 skipped.
- VS Code source adapter calls the Core projection for manual commit-message generation and auto-commit preparation; it keeps legacy host derivation only as a fallback boundary.

## Preservation And Fidelity

- Preservation State: exact carried source authority and semantic Parent relationships remain unchanged; no remote mutation or canonical repository landing occurred.
- Fidelity Notes: the candidate records only the bounded behavior described here and preserves unresolved or host-specific boundaries explicitly.
- Known Losses: none identified in the tested projection surface.

## Interpretation Limits

- Not Yet Used As: permission to commit/push, accepted UX, VS Code release acceptance, or proof of behavior in every Git/terminal environment.
- Does Not Prove: canonical repository landing, remote mutation authority, or that Unicode presentation must be the only future renderer.
- Must Not Be Treated As: a VS Code-owned semantic feature or a reason to duplicate the projection independently in another IDE.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-deterministic-lineage-maintenance-projection-and-apply-task.trace.md](001-deterministic-lineage-maintenance-projection-and-apply-task.trace.md)
  - Value: PY3SeYcMqPM2_xM_lPUmHAbYB1BS2H6FMv5P0bVyAYI

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: CJupWhTIHOF__IUE5PTAgKg8nJOYanUmSucCOAFt9Ww