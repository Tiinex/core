# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-12 13:50:29
  - Trace: [003-1-1-1-core-major-009-minimal-carrier-material-transport-projection.trace.md](../003-1-1-1-core-major-009-minimal-carrier-material-transport-projection.trace.md)
  - Origin:
    - [relative](../003-1-1-1-core-major-009-minimal-carrier-material-transport-projection.trace.md)
- Current
  - Current Schema: tiinex.evidence.v1
  - Created At: 2026-09-12 14:30:08
  - Authors: Loom
  - Why: Anchor delegated the accepted Docs Major 007 package/material/recipient contract mechanics to Loom and requires exact regression evidence without host-specific or opaque semantic authority.
  - Summary: Qualify bootstrap-only, generic complete/bounded material carriage, Handoff-only recipient projection, artifact-readable roundtrip, and full Core validation.
  - Status: ready/local

---

# Core Major 009 Minimal Carrier, Material Representation, And Transport Projection Qualification

## Supported Claim Or Question

- Supported Claim Or Question: can Core implement the accepted Docs Major 007 Handoff Package V1 mechanics so bootstrap-only, pointerless Workspace-material, and routed Handoff carriers qualify from one artifact-readable package contract, including generic complete/bounded Workspace Representation material, while projecting recipient-specific transport only from an exact selected Handoff `To` endpoint and never manufacturing recipient, holder, participation, delegation, or work authority from carried Roles/material
- Evidence Role: qualifies the Core Major 009 package-role, source-material binding, manufacture/orient/validate, cold projection, human transport, no-sidecar roundtrip, bounded-route, backward-compatibility, portable surface, and embedded-bootstrap implementation delegated by Anchor to Loom

## Provenance

- Known Source: exact Core Workspace materialized from the received qualified Core Major 009 Anchor-to-Loom Handoff carrier through Tiinex after Start-qualified bootstrap and explicit Loom holder-role grounding
- Preservation Basis: accepted Docs Major 007 Decision and `tiinex.handoff.package.v1` schema were projected as qualified read-only context through Tiinex; implementation reused Core Major 008 Workspace Representation qualification and detached recovery mechanics rather than defining a second bounded-material model
- Provenance Limits: Docs and Business material were read-only semantic/Role context; no Docs canonical mutation, Business policy mutation, Extension VS Code implementation, protected generic bounded-material design, JSON semantic sidecar, remote fetch, commit, push, publication, release, deployment, or other remote mutation was performed
- Semantic Authority Boundary: package role, material carriage, route selection, and transport projection remain independently qualified; carriage of a Workspace, Workspace Representation, Role, or bootstrap never by itself creates recipient, holder, participation, delegation, current-work, or grounded-to-act authority

## Evidence Material

- Material: patched Core Handoff Package V1 contract/build/inspect, route-less Workspace/bootstrap manufacture, recipient-v2 cold/human projection, Node/CLI adapters, bootstrap guidance, accepted schema copy, and focused deterministic tests
- Material Kind: host-neutral package manufacture, artifact-first package inspection, generic source-material representation, cold orientation, transport projection, and deterministic Core regression evidence
- Package Roles: `tiinex.handoff.package.v1` now validates three closed roles: `recipient-facing-handoff-carrier`, `recipient-facing-workspace-carrier`, and `recipient-facing-bootstrap-carrier`
- Independent Bindings: package contract now renders and validates `Workspace Snapshot Bindings`, `Material Representation Bindings`, `Route Discovery`, and `Transport Projection` independently rather than treating every qualified package as a complete direct Workspace Handoff carrier
- Bootstrap-Only Result: bootstrap manufacture emits a qualified package with Start/bootstrap, zero direct Workspace bindings, zero Material Representation bindings, zero Handoff routes, physical roundtrip qualification, and a bootstrap carrier projection with no Workspace/holder/work authority
- Bootstrap Transport Result: route-less bootstrap human output contains generic Start transport only; it exposes no Continue-from text, recipient label, Handoff route, holder, current work, or grounded-to-act claim
- Workspace Carrier Result: pointerless Workspace manufacture accepts one or more source-material bindings across direct complete Workspace snapshots and generic complete/bounded `tiinex.workspace.representation.v1` material with no selected Handoff route
- Generic Representation Result: bounded Workspace input is promoted mechanically to the accepted generic Workspace Representation binding path; complete Workspace input may remain on the direct complete shortcut or be explicitly represented generically without changing Workspace Representation semantics
- Artifact-Readable Roundtrip: serialized packages reconstruct generic Workspace/Representation facts from visible Markdown links plus exact carried payload bytes; no hidden build metadata, top-level JSON artifact, generated inventory, or host-private manifest is required to requalify package semantics after ZIP roundtrip
- Handoff Route Containment: a selected route qualifies only when the exact authoritative Handoff is contained in clear qualified carried material; focused bounded regression places the selected Handoff itself inside a bounded generic Workspace Representation and still validates/orients/grounds normally
- Detached Recovery Preservation: bounded Parent recovery continues to use explicit Workspace-scoped cache ownership and the established `bounded-workspace:<workspaceId>:` source-requirement marker; detached recovery bytes remain outside bounded representation membership
- Transport Projection Result: every qualified package can project generic Start transport; only `recipient-facing-handoff-carrier` projects route-specific Continue-from text and a recipient label
- Recipient Label Authority: route-specific recipient label is derived only from the selected qualified Handoff `To` endpoint exposed by the route; carried Role artifacts, Workspace identity, package filename, package placement, or material bindings do not create that label or recipient authority
- Role-Presence Negative Proof: focused pointerless bounded Workspace test carries a valid Loom Role inside generic material and still projects recipient authority `none`, holder authority `none`, work authority `none`, no route, and no recipient label
- Mixed Material Result: focused pointerless test combines one direct complete Workspace binding with one forced generic complete Workspace Representation binding and requalifies both source surfaces with no Handoff route or recipient projection
- Cold Orientation Result: bootstrap-only and pointerless Workspace carriers orient `ready` without route grounding; routed Handoff behavior retains exact opaque-pointer grounding and explicit holder-role requirements
- Backward Compatibility: existing direct complete Workspace, sealed complete Secure Transport V1, and normal routed Handoff paths remain regression-green; direct complete remains a package-local shortcut while generic representation is an additional accepted material binding path
- Source Schema Result: Core carries the accepted Docs Major 007 `tiinex.handoff.package.v1` schema text under the portable Handoff contracts surface and validates package role/binding/transport combinations against it
- Focused Tests: `test/minimal-carrier-material-transport-projection.test.mjs` covers zero-material bootstrap, pointerless bounded Role carriage without authority, and mixed direct/generic complete material; `test/bounded-handoff-carrier.test.mjs` covers an authoritative Handoff inside bounded generic material plus detached Parent recovery and act-ready routed grounding
- Full Core Regression: `npm test` passed 102/102
- Portable Smoke: `npm run test:portable` passed with `portable node surface imports`
- Embedded Bootstrap Qualification: `npm run test:bootstrap` returned `embedded-qualified` with manifest SHA-256 `a20bba75df95615792a0b066ae790bf19636fc344fc3d795690081c22b768f54`, representation SHA-256 `62fadf1eb21488d37eb74fbeaba4153362f5fc1b1b50a7f981536d27e336b7c5`, 497 runtime files, and 5,473,585 runtime bytes
- Full Validation Result: `npm run validate` passed after the final bounded-route acceptance regression and manufacture-boundary wording cleanup

## Preservation And Fidelity

- Preservation State: existing complete/sealed carrier semantics remain available; generic complete/bounded material uses existing Workspace Representation/External Payload contracts; bounded omission remains `outside-representation-not-absent-from-workspace`; selected-route authority remains Handoff-owned
- Fidelity Notes: package semantic facts needed after serialization are recoverable from declared human-readable Tiinex Markdown plus exact ZIP/payload bytes; route-less package roles deliberately omit recipient-specific transport rather than synthesizing it from nearby carried artifacts
- Existing Authority Preserved: Docs owns Handoff Package V1 and Workspace Representation semantics; Business Roles remain context only; explicit holder-role binding remains a grounding requirement; Core owns only host-neutral manufacture/orient/validate/projection mechanics
- Known Losses: none in the delegated Core source surface; no canonical Docs bytes, Business authority bytes, historical source artifacts, host-specific Extension bytes, or remote state were modified

## Interpretation Limits

- Does Not Prove: Extension VS Code Transport UI is implemented, a carried Role is a recipient/holder, a generic Workspace carrier is a Handoff, bootstrap-only carriage creates current work, bounded omission means deletion/absence, or a mechanically ready carrier is product/release acceptance
- Not Yet Used As: authority for host-specific Transport presentation, canonical Docs schema changes, protected generic bounded-material carriage, Business policy changes, publication, release, deployment, or remote mutation
- Must Not Be Used To Claim: recipient/holder/participation/delegation/work authority from material presence, permission to add opaque semantic JSON sidecars, authority to redefine Workspace Representation scope, or remote publication/release authority
- Must Not Be Treated As: a replacement for the exact selected Handoff `To` endpoint when projecting a recipient, proof that every qualified package has a Handoff route, or proof that package/filename/UI/account identity carries semantic role authority
- Authority Limits: generic Core package manufacture/orient/validate, source-material binding, artifact-readable roundtrip, and transport-projection mechanics plus deterministic local regression evidence only; Docs retains semantics, Anchor retains orchestration/integration, and host implementations remain separately delegated

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [003-1-1-1-core-major-009-minimal-carrier-material-transport-projection.trace.md](../003-1-1-1-core-major-009-minimal-carrier-material-transport-projection.trace.md)
  - Value: DVmEYp_eROzOoBWE7a9OLbW3w3sG1QrnIRgGR7I8DEY

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 8I35b390iNSLraGKJEk34ldsnW6roCv3sFgNwDpTP5c