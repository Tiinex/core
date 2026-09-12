# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](../../../tiinex.root.v1.schema.md)
  - Created At: 2026-09-01 14:19:00
  - Trace: [tiinex.root.v1.schema.md](../../../tiinex.root.v1.schema.md)
  - Origin:
    - [relative](../../../tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.handoff.package.v1](tiinex.handoff.package.v1.schema.md)
  - Created At: 2026-09-01 14:19:00
  - Authors: Axiom, Anchor
  - Repairs:
    - Password-sealed Workspace carriage
      - Target: Core Semantics / Workspace Snapshot Bindings / Route Discovery / Qualification Boundary
      - Note: Adds one sealed binding mode that composes External Payload and Transport Envelope authority, keeps protected Workspace internals opaque to the carrier, and requires the authoritative selected Handoff route Workspace to remain clear in V1.
      - Reason: Accepted secure-transport V1 semantics require independently protected Workspaces without moving cryptographic profile or recipient-slot meaning into Handoff Package.
    - Minimal carrier, qualified material carriage, and recipient projection
      - Target: Core Semantics / Package Identity / Workspace Snapshot Bindings / Material Representation Bindings / Route Discovery / Transport Projection / Qualification Boundary
      - Note: Adds an explicit bootstrap-only carrier role, permits zero source-material bindings only in that role, composes complete or bounded Workspace Representation authority for qualified contextual material, keeps Role presence separate from recipient/holder semantics, and makes generic versus route-specific transport text a projection rule rather than a new semantic sidecar.
      - Reason: A recipient may need only Start plus qualified portable Tooling, or a bounded material carrier, without fake Workspaces, fake Handoffs, inferred recipients, or host-private package meaning.
  - Summary: Receiver-facing carrier schema for package identity, Start/bootstrap exposure, optional qualified source-material carriage through complete package-local Workspace snapshots or generic complete/bounded Workspace Representations, explicit Handoff-route, pointerless material, or bootstrap-only roles, and carrier/transport projection boundaries without owning Handoff transfer, Role holder state, cryptographic profile, or generic Workspace representation semantics.

---

# Handoff Package

- Status: maintained schema note

## Summary

Defines one receiver-facing carrier identity/discovery contract with three explicit Package Roles: an exact Handoff-route carrier, a pointerless Workspace-material carrier, and a bootstrap-only carrier with no project/source material. Complete Workspace carriage may continue to use the package-local clear verified or password-sealed complete-snapshot shortcut. Complete or intentionally bounded material whose representation semantics matter independently must use a qualified `tiinex.workspace.representation.v1` binding instead of being squeezed into that shortcut.

`tiinex.handoff.package.v1` owns only carrier facts: how a recipient enters the carrier, which package role is declared, which qualified source-material bindings are selected for carriage, how an explicit Handoff route is discovered when present, how generic and route-specific transport text is projected, and how carrier convenience lineage is represented. It does not own the carried Workspace, Role, Handoff, Representation Payload, cryptographic profile, recipient-slot, holder, delegation, acceptance, project-membership, or post-open provider semantics that belong to their own artifacts.

Despite its namespace, this schema is not a specialization of `tiinex.handoff.v1`. It does not transfer work or responsibility. It is also not a specialization of `tiinex.semantic.package.v1`, whose maintained job is portable schema and Transition discovery.

## Core Semantics

- Handoff Package = one recipient-facing carrier identity/discovery boundary with one explicit Package Role: exact Handoff-route transport, pointerless qualified Workspace-material transport, or bootstrap-only transport.
- In `recipient-facing-handoff-carrier` mode, the authoritative Handoff remains a `tiinex.handoff.v1` artifact in its owning Workspace; carrying or pointing to it does not duplicate or replace Handoff semantics.
- In `recipient-facing-workspace-carrier` mode, the package selects no Handoff route and creates no Handoff transfer, endpoint, recipient-capacity, current-work, acceptance, completion, or continuation semantics. The carried material may be one or more complete package-local Workspace Snapshot Bindings and/or one or more independently qualified complete/bounded Workspace Representation bindings.
- In `recipient-facing-bootstrap-carrier` mode, the package intentionally carries no Workspace/source-material binding and no Handoff route. It exposes only the carrier identity, Start/bootstrap convention, carrier continuity, qualification boundary, and generic package transport projection required to enter Tiinex Tooling.
- Bootstrap-only carrier qualification proves only the qualified carrier/bootstrap facts it declares. It never proves Role identity, recipient identity, session-holder binding, work authority, project or organization context, Handoff acceptance, current work, or `grounded-to-act` readiness.
- The authoritative Workspace remains a `tiinex.workspace.v1` artifact. A package-local complete snapshot is a representation of that Workspace's source bytes, not the Workspace artifact itself.
- A Handoff Package may directly bind a carried Workspace artifact to one exact package-local complete Workspace snapshot when the relation exists only for this carrier and the package schema owns all qualification rules needed to re-establish that binding from the package bytes.
- That package-specific complete binding is not a `tiinex.workspace.representation.v1` artifact and does not activate generic Workspace Representation authority outside this carrier.
- A standalone `tiinex.external.payload.v1` artifact is not required for the same package-local complete Workspace snapshot when no independent payload identity, location, access, retention, or recovery semantics need to survive apart from the package binding.
- A standalone `tiinex.workspace.representation.v1` artifact is not required for the same package-local complete snapshot when no independently selectable representation relation, bounded scope, multiple-representation choice, external provider contract, or separate representation lifecycle needs to survive apart from the package binding.
- When complete or bounded material needs independent representation semantics, the package selects a qualified `tiinex.workspace.representation.v1` artifact through `Material Representation Bindings`; the referenced representation, Workspace, Representation Payload authority, exact carried payload bytes, scope, correlation, and provider qualification remain owned by those artifacts.
- A Role, Handoff, Task, Evidence, or other artifact that appears only inside carried source material remains owned/interpreted through its own qualified artifact and representation closure. Package placement or byte presence does not create Role holder, recipient, participant, consent, delegation, organization membership, responsibility, or work ownership.
- A password-sealed Workspace binding always has independent payload access/recovery and cryptographic open semantics. Its ciphertext bytes therefore remain under `tiinex.external.payload.v1`, while deterministic non-secret profile, password-recipient-slot, open/recovery, and authentication semantics remain under `tiinex.transport.envelope.v1`.
- A sealed carrier binding may qualify as a carrier-level statement that one protected complete Workspace representation is present, but it never qualifies or activates the protected Workspace source provider while locked.
- Multiple protected Workspaces in one carrier remain independently protected: each has its own Transport Envelope, content key, protected payload, and recipient-slot set.
- In V1 Handoff-carrier mode, the authoritative selected Handoff route must remain visible through clear qualified source carriage. It may be satisfied by a clear verified complete Workspace Snapshot Binding or by a clear verified generic Workspace Representation binding whose qualified scope contains the exact authoritative Handoff artifact.
- Package-local `Parent` lineage among carrier artifacts may be intentionally manufactured as recipient continuity/navigation. Its semantic subject is the carrier artifact sequence only; it does not rewrite source-artifact Parent, Origin, ownership, authority, Role hierarchy, Handoff endpoints, or participation.
- Package-local Role Pointers, when Handoff-carrier mode exposes them on the selected route closure, are discovery/grounding aids only. Handoff endpoint and participation meaning remains owned by the authoritative Handoff and any separately authoritative typed Relation.
- In Handoff-carrier mode, Workspace placement of a Handoff Pointer is route-resolution navigation: it identifies the owning Workspace/material scope from which the authoritative Handoff is resolved, not ownership or authority beyond that resolution fact.
- In pointerless Workspace-carrier mode, authoritative Handoff artifacts may exist incidentally inside carried qualified material, but package membership does not select, activate, or imply any such Handoff.
- Generic package transport text is a human projection from the Start/bootstrap contract and exists for every Package Role. Route-specific transport text exists only when one qualified Handoff route is explicitly selected; concrete delivery/recipient projection comes only from that Handoff's declared endpoint semantics.
- Transport text is not a new durable semantic artifact. Hosts may render or copy it, but hidden JSON sidecars, private manifests, application-local state, filename inference, or UI grouping must not become recipient authority.
- Package membership, path, filename, adjacency, archive entry order, digest equality, successful transport, or Role-artifact presence do not by themselves create semantic authority.

## Schema Validation Contract

### Handoff Package Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.handoff.package.v1`

Rules

- `tiinex.handoff.package.v1` identifies artifacts whose main job is to declare one recipient-facing carrier plus an explicit Handoff-route, pointerless qualified material, or bootstrap-only discovery contract.
- The package artifact must remain human-readable without a hidden compatibility manifest, application-local state, repository search, or manual archive archaeology.
- The package artifact must not become an exhaustive file inventory, verification receipt, Handoff duplicate, Workspace duplicate, generic workflow engine, or general transport ontology.
- A bootstrap-only package is valid only when its explicit Package Role and binding/route fields declare absence rather than manufacturing placeholder Workspace, Role, Handoff, or recipient artifacts.
- Prose outside `Schema Validation Contract` may explain the package but does not add machine requirements.

### Handoff Package Body

Required Shape

- first body heading after the continuity envelope
- `## Package Identity` section
- `## Bootstrap Exposure` section
- `## Workspace Snapshot Bindings` section
- `## Material Representation Bindings` section
- `## Route Discovery` section
- `## Transport Projection` section
- `## Carrier Continuity` section
- `## Qualification Boundary` section
- `## Interpretation Limits` section

Optional Sections

- Evidence Basis
- Related Artifacts
- References

Rules

- Required sections must be readable and machine-extractable.
- `Workspace Snapshot Bindings` uses repeated named declarations or the sole literal entry `none`.
- `Material Representation Bindings` uses repeated named declarations or the sole literal entry `none`.
- The body must not reproduce the authoritative Handoff body, Workspace body, Role body, Workspace Representation body, or an exhaustive archive/file map.
- Binding-section absence must be explicit with `none`; an omitted section must not be interpreted as zero material.

### Package Identity

Required Fields

- Package Role
- Carrier Kind

Field Value Constraints

- Package Role
  - Allowed Value: recipient-facing-handoff-carrier
  - Allowed Value: recipient-facing-workspace-carrier
  - Allowed Value: recipient-facing-bootstrap-carrier
  - Domain Policy: closed
- Carrier Kind
  - Allowed Value: self-contained
  - Domain Policy: closed

Rules

- `Package Role: recipient-facing-handoff-carrier` means the package exposes one explicit selected Handoff route and retains exact Handoff-route semantics. The selected Handoff must be carried through one clear qualified source-material binding.
- `Package Role: recipient-facing-workspace-carrier` means the package carries one or more qualified Workspace-scoped source-material representations for recipient inspection, grounding, or landing without selecting any Handoff route. Material may be complete or intentionally bounded according to its owning binding semantics.
- `Package Role: recipient-facing-bootstrap-carrier` means the package intentionally carries zero Workspace Snapshot Bindings, zero Material Representation Bindings, and zero Handoff routes while still exposing Start plus qualified portable Tooling bootstrap.
- `Carrier Kind: self-contained` means every material source byte required by the declared Package Role is carried by the package according to its explicit bindings and, in Handoff-carrier mode, selected-route closure rules. For bootstrap-only mode this applies to the package/bootstrap material only and does not imply project/source Workspace material.
- Package Role is carrier semantics only. No Package Role creates Handoff transfer, endpoint, acceptance, completion, Workspace identity, current-work, project membership, organization membership, or Role-holder authority.
- Package identity does not create identity for contained Workspace, Handoff, Role, Pointer, Workspace Representation, External Payload, or other source artifacts.

### Bootstrap Exposure

Required Fields

- Start Artifact
- Tooling Bootstrap Descriptor
- Bootstrap Rule

Field Value Constraints

- Start Artifact
  - Allowed Shape: Markdown Link
  - Domain Policy: closed
- Tooling Bootstrap Descriptor
  - Allowed Shape: Markdown Link
  - Domain Policy: closed
- Bootstrap Rule
  - Allowed Value: start-then-qualified-bootstrap
  - Domain Policy: closed

Rules

- `Start Artifact` must resolve to the package-local recipient ingress artifact, ordinarily a `tiinex.pointer.v1`.
- `Tooling Bootstrap Descriptor` must resolve to the package-local artifact that owns the Tooling bootstrap payload reference and exact bootstrap-payload integrity, ordinarily `tiinex.external.payload.v1`.
- The package schema does not absorb bootstrap payload semantics merely because the bootstrap bytes are carried inside the package.
- `Bootstrap Rule: start-then-qualified-bootstrap` means a cold recipient reads Start first, qualifies the declared bootstrap descriptor/payload, then transfers semantic package interpretation to the qualified Tooling path before following the selected route.

### Workspace Snapshot Bindings

Declaration Shape

- repeated First-Level Hyphen List Item declarations
- or the sole literal entry `none`

Common Required Fields

- Workspace Id
- Workspace Artifact
- Snapshot Kind
- Coverage
- Binding State

Clear-Snapshot Required Fields

- Snapshot Path
- Workspace Artifact Inner Path
- Integrity Method
- Integrity Value

Sealed-Snapshot Required Fields

- Protected Payload Descriptor
- Transport Envelope
- Protection State
- Post-Open Correlation Rule

Optional Fields

- Byte Size
- Notes

Field Value Constraints

- Workspace Artifact
  - Allowed Shape: Markdown Link
  - Domain Policy: closed
- Snapshot Path
  - Allowed Shape: Markdown Link
  - Domain Policy: closed
- Protected Payload Descriptor
  - Allowed Shape: Markdown Link
  - Domain Policy: closed
- Transport Envelope
  - Allowed Shape: Markdown Link
  - Domain Policy: closed
- Snapshot Kind
  - Allowed Value: exact-workspace-byte-tree-archive
  - Allowed Value: password-sealed-workspace-byte-tree
  - Domain Policy: closed
- Coverage
  - Allowed Value: complete
  - Domain Policy: closed
- Binding State
  - Allowed Value: verified
  - Allowed Value: sealed
  - Allowed Value: declared
  - Allowed Value: unresolved
  - Domain Policy: closed
- Integrity Method
  - Allowed Value: sha256
  - Domain Policy: closed
- Protection State
  - Allowed Value: password-sealed
  - Domain Policy: closed
- Post-Open Correlation Rule
  - Allowed Value: unique-exact-workspace-artifact-byte-match
  - Domain Policy: closed

Rules

- The literal `none` is allowed only as the sole `## Workspace Snapshot Bindings` entry. It declares that this package uses no package-local direct complete-Workspace shortcut and must not be replaced by a fake Workspace declaration.
- `Workspace Id` is a package-local readability/routing handle. It does not replace the Workspace artifact as semantic Workspace identity.
- `Workspace Artifact` must resolve to exactly one carried artifact whose Current Schema is `tiinex.workspace.v1`.
- `Coverage: complete` is required in both direct binding modes. `bounded`, `partial`, and `unknown` are not allowed in this package-local carrier shortcut; bounded source material belongs under `Material Representation Bindings` through `tiinex.workspace.representation.v1`.
- `Snapshot Kind: exact-workspace-byte-tree-archive` preserves the existing clear direct-binding shortcut. It requires `Snapshot Path`, `Workspace Artifact Inner Path`, `Integrity Method`, and `Integrity Value`; it forbids the sealed-only fields.
- In clear mode, `Snapshot Path` must resolve to one package-local payload entry containing the exact complete Workspace byte-tree snapshot for this binding. External URLs and inferred filenames are not allowed.
- In clear mode, `Workspace Artifact Inner Path` is the exact normalized Workspace-relative path at which the bound Workspace artifact must occur inside the snapshot.
- In clear mode, `Integrity Method: sha256` and `Integrity Value` identify the exact package-member bytes at `Snapshot Path`. `Integrity Value` must be a lowercase 64-character hexadecimal SHA-256 digest.
- In clear mode, `Binding State: verified` is valid only when exact snapshot bytes, safe decoding, normalized path mapping, complete coverage, and exact Workspace-artifact inner-byte correlation have qualified. A receiver must requalify these facts from the carried bytes; the state is not a transport receipt or acceptance proof.
- In clear mode, the archive root is fixed at `.`, Workspace-relative paths map by normalized identity-relative paths, and unsafe, absolute, traversal, duplicate-normalized, or ambiguous entries must fail qualification. Exact equality between the carried `Workspace Artifact` bytes and the entry at `Workspace Artifact Inner Path` is required.
- A verified clear package-local complete binding may activate only the package recipient's complete Workspace source provider for this exact carrier snapshot.
- `Snapshot Kind: password-sealed-workspace-byte-tree` declares a protected complete Workspace representation. It requires `Protected Payload Descriptor`, `Transport Envelope`, `Protection State`, and `Post-Open Correlation Rule`; it forbids `Snapshot Path`, `Workspace Artifact Inner Path`, `Integrity Method`, and `Integrity Value` so the package neither leaks protected internal paths nor duplicates ciphertext location/integrity authority.
- In sealed mode, `Protected Payload Descriptor` must resolve to exactly one carried artifact whose Current Schema is `tiinex.external.payload.v1`. That artifact remains the owner of protected payload identity, location, exact stored bytes, integrity, access, and recovery facts.
- In sealed mode, `Transport Envelope` must resolve to exactly one carried artifact whose Current Schema is `tiinex.transport.envelope.v1`. The envelope must reference the same `Workspace Artifact` and the same protected External Payload and its Workspace Binding Value must requalify against the exact visible Workspace Artifact bytes.
- `Protection State: password-sealed` and `Binding State: sealed` qualify only the carrier-level fact that one protected complete-intent representation and its opening contract are present. They do not qualify decrypted Workspace bytes and must leave the Workspace source provider inactive while locked.
- `Coverage: complete` on a sealed binding is the declared scope of the protected plaintext representation. It is not receiver verification of the hidden tree before authorized open.
- A sealed binding must expose no protected Workspace filename, directory, inner artifact path, path mapping, tree inventory, or plaintext byte facts in the outer carrier.
- `Post-Open Correlation Rule: unique-exact-workspace-artifact-byte-match` requires an authorized receiver, after successful authenticated open, to locate exactly one decrypted archive entry whose bytes exactly equal the visible `Workspace Artifact` bytes. Zero matches and multiple matches fail closed. Only after that unique match may its internal path be derived.
- After the unique post-open correlation succeeds, safe decoding, normalized path rules, complete coverage, ordinary Workspace representation/source qualification, schema validation, and integrity checks still apply before the Workspace provider becomes ready. Successful decryption alone is insufficient.
- `Binding State: verified` is invalid for sealed mode and `Binding State: sealed` is invalid for clear mode. `declared` and `unresolved` preserve prequalification states but do not satisfy a qualified Handoff carrier.
- `Byte Size`, when present, is a mechanical consistency aid only and does not replace exact byte integrity. For sealed mode, exact protected-payload size belongs to the External Payload unless the package repeats size only as a non-authoritative consistency aid.
- Each sealed Workspace binding is independent. One Transport Envelope, content key, password slot, or successful open must not grant or imply access to another protected Workspace binding.
- The clear direct-binding shortcut must not be exported, cached, or re-described as a generic `tiinex.workspace.representation.v1` relation unless that generic relation is separately materialized and qualified.
- Generic External Payload and Workspace Representation authority remains unchanged outside this carrier. If the Workspace-to-representation relation needs independent lifecycle, selection, bounded scope, multiple-representation choice, or generic provider authority beyond this package, materialize and qualify `tiinex.workspace.representation.v1` and carry it through `Material Representation Bindings` instead of widening this shortcut.

### Material Representation Bindings

Declaration Shape

- repeated First-Level Hyphen List Item declarations
- or the sole literal entry `none`

Required Fields

- Material Id
- Workspace Representation
- Carriage State

Optional Fields

- Notes

Field Value Constraints

- Workspace Representation
  - Allowed Shape: Markdown Link
  - Domain Policy: closed
- Carriage State
  - Allowed Value: verified
  - Allowed Value: unresolved
  - Domain Policy: closed

Rules

- The literal `none` is allowed only as the sole `## Material Representation Bindings` entry. It declares that no generic Workspace Representation is selected for source-material carriage.
- `Material Id` is a package-local readability handle only. It is not artifact identity, Workspace identity, Role identity, Handoff identity, recipient identity, or provider identity.
- `Workspace Representation` must resolve to exactly one carried artifact whose Current Schema is `tiinex.workspace.representation.v1`.
- A `Carriage State: verified` binding requires the referenced Workspace Representation to qualify in a provider-ready `Binding State: verified` form with `Coverage: complete` or `Coverage: bounded`; `partial`, `unknown`, stale, declared, or unresolved representation states do not qualify a ready material binding.
- The referenced Workspace Representation remains the owner of the Workspace-to-representation relation, coverage/scope, path correlation, provider activation boundary, and selection semantics. Its referenced Workspace Artifact remains the semantic Workspace identity, and its referenced External Payload remains the owner of payload identity, location, exact payload-byte integrity, access, and recovery semantics.
- The package must carry the exact visible Workspace Representation artifact, its explicit Workspace Artifact endpoint, its explicit Representation Payload artifact, and the exact payload bytes required to requalify the selected binding. Missing or externally guessed closure fails closed.
- The package must not duplicate the referenced representation's coverage, scope, payload digest, mapping, provider, or path-set authority merely for convenience.
- For `Coverage: bounded`, the qualified decoded representation-entry set is the exact carried source-material scope. Omitted Workspace paths remain outside the representation and must not be inferred absent from the source Workspace.
- Material carriage through this section is clear/readable in V1. A locked or protected generic material representation does not satisfy `Carriage State: verified` unless a later explicit contract defines its protected generic-material opening semantics.
- A carried Role, Handoff, Task, Evidence, Decision, Relation, or other artifact inside the selected representation remains semantically governed by its own artifact and explicit relations. Presence in the representation/package does not create recipient, participant, holder, consent, delegation, organization membership, responsibility, work ownership, or acceptance.
- Package-local Pointers may aid discovery of represented artifacts only when their targets resolve through a qualified carried representation; the Pointer and package placement do not become ownership or endpoint authority.
- A Handoff-carrier selected route may resolve its authoritative Handoff target through a verified complete Workspace Snapshot Binding or through a verified clear Material Representation Binding whose qualified scope contains the exact Handoff artifact.
- A pointerless Workspace-carrier may use only Material Representation Bindings, only Workspace Snapshot Bindings, or both.
- A bootstrap-only carrier must declare `none` in both binding sections.

### Route Discovery

Required Fields

- Route Placement Rule
- Continue-From Rule
- Pre-Handoff Closure Rule

Field Value Constraints

- Route Placement Rule
  - Allowed Value: authoritative-workspace-descended
  - Allowed Value: none
  - Domain Policy: closed
- Continue-From Rule
  - Allowed Value: exact-package-local-handoff-pointer
  - Allowed Value: none
  - Domain Policy: closed
- Pre-Handoff Closure Rule
  - Allowed Value: selected-pointer-carrier-ancestors
  - Allowed Value: none
  - Domain Policy: closed

Rules

- `Package Role: recipient-facing-handoff-carrier` requires the exact triplet `Route Placement Rule: authoritative-workspace-descended`, `Continue-From Rule: exact-package-local-handoff-pointer`, and `Pre-Handoff Closure Rule: selected-pointer-carrier-ancestors`.
- `Package Role: recipient-facing-workspace-carrier` and `Package Role: recipient-facing-bootstrap-carrier` each require the exact triplet `Route Placement Rule: none`, `Continue-From Rule: none`, and `Pre-Handoff Closure Rule: none`.
- Mixed Route Discovery triplets are invalid and fail closed.
- In Handoff-carrier mode, `Route Placement Rule: authoritative-workspace-descended` means a package-local Handoff Pointer route is placed below the explicit owning Workspace/material branch from which the authoritative Handoff target is qualified. This placement is a route-resolution fact only.
- In Handoff-carrier mode, the authoritative selected Handoff target must be present through clear qualified source carriage: either a clear verified complete Workspace Snapshot Binding or a verified clear Material Representation Binding whose exact qualified scope includes the Handoff target. Password-sealed or unresolved material must not satisfy selected-route visibility in V1.
- In Handoff-carrier mode, `Continue-From Rule: exact-package-local-handoff-pointer` means the recipient is given one exact package-local Handoff Pointer path or an explicit qualified selection among such pointers. The route must not name, expose, guess, or defer an internal path inside locked/protected payload bytes.
- In Handoff-carrier mode, `Pre-Handoff Closure Rule: selected-pointer-carrier-ancestors` means route-specific material required before following the authoritative Handoff must be discoverable on the selected pointer's carrier-local ancestor closure and/or through the exact qualified carried representation explicitly selected by those ancestors.
- Carrier-local ancestor closure is a recipient discovery plan. It does not make ancestor placement semantic participation, delegation, authority precedence, source Parent truth, Required Context meaning, or Handoff endpoint identity.
- Package-local Role Pointers included on that closure remain `tiinex.pointer.v1` artifacts. Their placement permits pre-Handoff grounding only and must not be used to infer participation, recipient identity, or session holder state.
- Required Context may reference another carried Workspace Snapshot Binding or Material Representation Binding. A locked or unresolved dependency remains unresolved until its owning contract qualifies; the clear authoritative selected Handoff route itself must remain resolvable.
- Carrier-sealed routing, encrypted selected Handoff-route discovery, hidden route manifests, and route inference after decryption are outside V1.
- In Handoff-carrier mode, all other selected-route qualification and Handoff Pointer rules remain unchanged, and the authoritative Handoff target remains the sole owner of Handoff transfer/endpoints.
- In pointerless Workspace-carrier mode, no package-local selected Handoff Pointer route may be exposed. Authoritative Handoff artifacts may exist incidentally inside carried qualified material, but package membership does not select or activate them.
- In bootstrap-only mode, no source-material or Handoff route may be inferred from Start, Tooling bootstrap, package filename, transport sender, UI account, or carrier history.
- `none` means absence of package-level Handoff route semantics. It must not be interpreted as an unknown Handoff, empty Handoff, implicit current Handoff, deferred route selection, or permission to infer a route later.

### Transport Projection

Required Fields

- Generic Transport Rule
- Route Transport Rule
- Recipient Projection Rule

Field Value Constraints

- Generic Transport Rule
  - Allowed Value: start-artifact-instruction
  - Domain Policy: closed
- Route Transport Rule
  - Allowed Value: selected-handoff-route-instruction
  - Allowed Value: none
  - Domain Policy: closed
- Recipient Projection Rule
  - Allowed Value: qualified-handoff-to-endpoint-only
  - Allowed Value: none
  - Domain Policy: closed

Rules

- `Generic Transport Rule: start-artifact-instruction` applies to every Package Role. It permits a human-readable instruction that identifies the exact package-local Start Artifact and tells the receiver to begin there and follow the qualified bootstrap path.
- Generic package transport text does not require or imply a Handoff route, recipient name, Role, session holder, project context, work authority, acceptance, or grounded-to-act readiness.
- `Package Role: recipient-facing-handoff-carrier` requires `Route Transport Rule: selected-handoff-route-instruction` and `Recipient Projection Rule: qualified-handoff-to-endpoint-only`.
- `Package Role: recipient-facing-workspace-carrier` and `Package Role: recipient-facing-bootstrap-carrier` require `Route Transport Rule: none` and `Recipient Projection Rule: none`.
- `Route Transport Rule: selected-handoff-route-instruction` permits route-specific human text to add the exact Continue-From Handoff Pointer after the generic Start instruction.
- `Recipient Projection Rule: qualified-handoff-to-endpoint-only` means a concrete delivery recipient label may be projected only from the exact qualified selected Handoff's declared `To` endpoint/capacity semantics. Carried Role artifacts, Workspace identity, package sender/receiver, UI account, repository, filename, route branch name, or transport destination must not manufacture that label.
- Generic and route-specific transport text are projections of already-authoritative carrier/Handoff artifacts. They are not new Tiinex artifacts, receipts, sidecars, manifests, or application-local semantic state.
- Hosts may render, copy, queue, or localize transport text mechanically, but must preserve the Start path, selected route when present, and recipient authority boundary. A host-private JSON structure may support UI mechanics only when it is not treated as semantic authority and is not required as a package source of truth.
- A package without a Handoff route may still support actions such as Copy Package, Copy Transport Text, or Close. It must not invent recipient rows or fake child Handoffs to make those actions available.

### Carrier Continuity

Required Fields

- Carrier Dimension
- Carrier Checkpoint

Optional Fields

- Parent Carrier Dimension
- Major Reason

Field Value Constraints

- Carrier Checkpoint
  - Allowed Value: progression
  - Allowed Value: major
  - Domain Policy: closed

Rules

- `Carrier Dimension` and `Parent Carrier Dimension`, when present, are human progress/retention projections for carriers only.
- Carrier dimensions must be numeric hyphen-separated paths such as `001`, `001-1`, or `001-1-1`; alphabetic lineage components are invalid.
- A child progression extends the parent carrier dimension without advancing or rewriting any contained artifact lineage.
- `Carrier Checkpoint: major` requires a meaningful `Major Reason` and a separately qualified complete source closure required by the governing carrier profile.
- Carrier continuity must not be used to infer or synchronize Root Parent, Trace, Origin, Handoff lifecycle, Workspace identity, or Role authority.

### Qualification Boundary

Required Fields

- Receiver Qualification
- Failure Policy
- Derived Inventory Authority

Field Value Constraints

- Receiver Qualification
  - Allowed Value: reverify-carried-authority-and-bytes
  - Domain Policy: closed
- Failure Policy
  - Allowed Value: fail-closed
  - Domain Policy: closed
- Derived Inventory Authority
  - Allowed Value: none
  - Domain Policy: closed

Rules

- `Receiver Qualification: reverify-carried-authority-and-bytes` requires the recipient to validate the visible package artifacts, Start/bootstrap authority and exact bootstrap bytes, every declared source-material binding and its owning byte authority, required source correlation appropriate to that binding mode, and, in Handoff-carrier mode, the selected clear route rather than trusting placement or a sender-side receipt.
- A bootstrap-only carrier qualifies without a Workspace/material provider only when Package Role, both binding sections, Route Discovery, and Transport Projection all consistently declare bootstrap-only absence and the Start/bootstrap carrier closure itself qualifies.
- For a clear direct Workspace Snapshot Binding, receiver qualification includes exact snapshot bytes, digest, safe decode, complete coverage, and exact `Workspace Artifact Inner Path` byte correlation.
- For a sealed direct Workspace Snapshot Binding, receiver qualification while locked includes the visible Workspace Artifact, External Payload descriptor, exact protected payload bytes and integrity under that descriptor, Transport Envelope metadata, envelope-to-payload/workspace consistency, and Workspace Binding Value. Carrier qualification while locked must not be reported as qualification of the hidden Workspace bytes or source provider.
- For a Material Representation Binding, receiver qualification includes the visible Workspace Representation artifact, its explicit Workspace and External Payload endpoints, the exact payload bytes used, the representation's declared complete/bounded scope, correlation, and provider-ready qualification. Package placement or duplicate bytes do not substitute for that closure.
- After authorized authenticated open of a sealed direct Workspace binding, the receiver must apply the declared unique exact Workspace-artifact byte correlation rule and then ordinary complete Workspace representation, safe-path, schema, and integrity qualification before provider activation.
- Wrong password, unavailable/unsupported declared profile, malformed slot or profile metadata, missing protected bytes, payload-integrity mismatch, authentication failure, truncation, zero/multiple post-open Workspace-artifact matches, unsafe path recovery, incomplete recovered coverage, missing generic representation closure, bounded-scope mismatch, or unqualified selected-route material fails closed.
- A Required Context dependency that has not completed the qualification required by its owning material contract remains unresolved for work that depends on it.
- `Failure Policy: fail-closed` means missing, ambiguous, stale, unsafe, mismatched, locked-required, unqualified required material, inconsistent Package Role/binding/route fields, or recipient projection without a qualified Handoff endpoint blocks dependent qualification instead of being repaired by filename guessing, repository-global search, hidden network access, compatibility metadata, UI state, or secret fallback.
- `Derived Inventory Authority: none` means generated manifests, indexes, checksums, compatibility JSON, file maps, archive listings, UI queue state, and host-private transport models may support mechanical verification/presentation but do not override the visible semantic artifacts and exact bytes unless another explicit schema grants them authority.
- A checksum match, successful cryptographic authentication, successful archive open, Role-artifact presence, or successful transport does not prove semantic correctness, provenance, authorship, acceptance, participation, holder identity, recipient identity, source ownership, or work authority beyond the exact qualified binding facts.

### Interpretation Limits

Required Fields

- Does Not Mean
- Must Not Be Used To Claim
- Generic Payload Boundary
- Generic Representation Boundary

Rules

- `Does Not Mean` must name important interpretations the package does not support.
- `Must Not Be Used To Claim` must name claims requiring separate authority.
- `Generic Payload Boundary` must preserve `tiinex.external.payload.v1` for payload identity/location/integrity/access/recovery semantics that have independent value outside a package-local direct complete binding.
- `Generic Representation Boundary` must preserve `tiinex.workspace.representation.v1` for independently meaningful Workspace representation relations, including bounded scope, multiple selectable representations, generic provider activation, or separate relation lifecycle.
- Bootstrap-only qualification must not be used to claim source-material carriage, Workspace identity, Role presence, project/organization context, work authority, current Task, recipient identity, session-holder binding, Handoff acceptance, or grounded-to-act readiness.
- Workspace/material-carrier mode is not a Handoff and does not transfer work or responsibility.
- Workspace/material-carrier mode does not establish `From`, `To`, recipient capacity, Role holder, acceptance, completion, current Task, current Workspace, or continuation target.
- Handoff-carrier mode creates no endpoint meaning beyond the exact selected Handoff. Carried Role/context material may support grounding, but its presence never identifies `To`, `From`, a holder, participant, member, owner, delegate, or consenting party.
- Package creator, transport sender or receiver, repository actor, selected Workspace, UI account, package membership, Workspace identity, Role presence, file placement, carrier dimension, and surrounding context must not be promoted into Handoff endpoint, Role, current-work, transfer, acceptance, participation, project membership, or organization membership semantics.
- If bounded work or responsibility transfer, Handoff Required Context, recipient Role grounding, or a completion-facing continuation is needed, the operator must create or select a qualified `tiinex.handoff.v1` artifact and use Handoff-carrier mode.
- Generic transport text may exist without a Handoff route, but concrete recipient/delivery projection must not.
- Password-sealed direct binding semantics must preserve `tiinex.transport.envelope.v1` as the owner of deterministic non-secret cryptographic profile, recipient-slot, open/recovery, and authentication metadata. Handoff Package must not absorb those semantics merely because it carries the envelope and ciphertext.
- Protected ciphertext identity, location, exact stored-byte integrity, access, and recovery facts remain under the referenced `tiinex.external.payload.v1`.
- A Handoff Package must not be used as a Handoff, Workspace, Role, Relation, External Payload, Workspace Representation, preservation record, delivery receipt, acceptance record, provenance record, project-membership record, or generic semantic package.
- Package membership and discovery do not prove authority over contained source artifacts.

### File Naming

Recommended Shape

- `<numeric-dimension>-tiinex-handoff-package.trace.md`

Rules

- Package artifact filenames should make the carrier role readable without becoming semantic identity.
- Filename, dimension, and root placement do not replace the Current Schema declaration.

## Artifact Creation Contract

### Creation Scope

Create `tiinex.handoff.package.v1` only when one self-contained recipient-facing carrier needs a durable identity/discovery contract for one of these jobs:

- exact selected Handoff-route carriage with clear qualified route material;
- pointerless qualified Workspace-scoped source-material carriage through complete package-local snapshot bindings and/or generic complete/bounded Workspace Representation bindings;
- bootstrap-only Start + portable Tooling carriage with no project/source material and no Handoff route.

Do not create this schema merely because a ZIP exists.

### Required Inputs

- Package Role
- Carrier Kind
- Start Artifact
- Tooling Bootstrap Descriptor
- Bootstrap Rule
- Workspace Snapshot Bindings section, using one or more qualified direct complete bindings or `none`
- Material Representation Bindings section, using one or more qualified generic representation bindings or `none`
- Route Placement Rule
- Continue-From Rule
- Pre-Handoff Closure Rule
- Generic Transport Rule
- Route Transport Rule
- Recipient Projection Rule
- Carrier Dimension
- Carrier Checkpoint
- Receiver Qualification
- Failure Policy
- Derived Inventory Authority
- Interpretation Limits

### Generation Rules

- Keep the package artifact narrow and human-readable.
- Do not create placeholder Workspace, Role, Handoff, Pointer, or material declarations merely to avoid an empty binding section.
- `recipient-facing-bootstrap-carrier` requires `none` in both binding sections and no Handoff route.
- `recipient-facing-workspace-carrier` requires at least one qualified source-material binding across the two binding sections and no Handoff route.
- `recipient-facing-handoff-carrier` requires one explicit selected Handoff route plus clear qualified source carriage containing its authoritative Handoff target.
- Bind only complete Workspace carriage in the package-local direct snapshot shortcut: either a clear exact complete snapshot or a password-sealed complete-intent representation.
- Use `Material Representation Bindings` when complete/bounded Workspace Representation semantics must survive independently, including intentionally bounded Role/context material or generic provider selection.
- Preserve the Workspace artifact as semantic Workspace identity and the Workspace Representation/External Payload artifacts as owners of generic representation/payload meaning.
- For clear direct bindings, preserve the package-local snapshot path, inner Workspace-artifact path, and exact snapshot digest shortcut.
- For sealed direct bindings, require one explicit External Payload descriptor and one `tiinex.transport.envelope.v1` artifact; do not duplicate ciphertext path/integrity or cryptographic profile/recipient-slot fields into Handoff Package.
- Do not expose a protected Workspace's internal path/tree inventory in the outer package. Post-open correlation derives the Workspace artifact's internal path only after a unique exact-byte match succeeds.
- Keep bootstrap/cache payload descriptors under their own owning schemas.
- Do not duplicate Handoff parties, transfers, Required Context, Role participation, Workspace body content, Workspace Representation scope, or External Payload digest authority.
- Do not materialize receipt/checksum/index/JSON sidecar artifacts merely because Tooling can compute them.
- Generic transport text is projected from `Start Artifact`. Route-specific text and any recipient label are projected only from a qualified selected Handoff route and its endpoint semantics.
- In Handoff-carrier mode, fail closed when the selected authoritative Handoff target cannot be qualified through clear carried source material.
- In pointerless Workspace-carrier or bootstrap-only mode, fail closed if a selected Handoff route or package-local Handoff Pointer route is supplied.
- Do not silently switch Package Role because route/material qualification fails; the declared Package Role controls intended carrier semantics and inconsistent fields are an error.

## Minimal Example

Bootstrap-only carriage may use this shape:

```md
# Handoff Package

## Package Identity

- Package Role: recipient-facing-bootstrap-carrier
- Carrier Kind: self-contained

## Bootstrap Exposure

- Start Artifact: [Start](001-1-READ-BEFORE-PROCEEDING.trace.md)
- Tooling Bootstrap Descriptor: [Bootstrap](001-2-bootstrap.trace.md)
- Bootstrap Rule: start-then-qualified-bootstrap

## Workspace Snapshot Bindings

- none

## Material Representation Bindings

- none

## Route Discovery

- Route Placement Rule: none
- Continue-From Rule: none
- Pre-Handoff Closure Rule: none

## Transport Projection

- Generic Transport Rule: start-artifact-instruction
- Route Transport Rule: none
- Recipient Projection Rule: none

## Carrier Continuity

- Carrier Dimension: 001
- Carrier Checkpoint: major
- Major Reason: establish qualified portable Tiinex bootstrap without project/source material

## Qualification Boundary

- Receiver Qualification: reverify-carried-authority-and-bytes
- Failure Policy: fail-closed
- Derived Inventory Authority: none

## Interpretation Limits

- Does Not Mean: a Role, recipient, project, Workspace, Task, Handoff or source-material context was carried
- Must Not Be Used To Claim: session holder binding, work authority, project membership, Handoff acceptance or grounded-to-act readiness
- Generic Payload Boundary: bootstrap payload identity/integrity remains under its External Payload descriptor
- Generic Representation Boundary: no Workspace Representation is asserted by this bootstrap-only package
```

Generic human transport text for this carrier may identify only the Start artifact, for example “Cold start: read Start directly … Start: `001-1-READ-BEFORE-PROCEEDING.trace.md`”. It does not require a fake recipient or Continue-From line.

Bounded contextual material without a selected Handoff may use pointerless Workspace-carrier mode:

```md
- Package Role: recipient-facing-workspace-carrier

## Workspace Snapshot Bindings

- none

## Material Representation Bindings

- role-context
  - Material Id: role-context
  - Workspace Representation: [Bounded Business Role Context](001-3-business-role-context-representation.trace.md)
  - Carriage State: verified

## Route Discovery

- Route Placement Rule: none
- Continue-From Rule: none
- Pre-Handoff Closure Rule: none

## Transport Projection

- Generic Transport Rule: start-artifact-instruction
- Route Transport Rule: none
- Recipient Projection Rule: none
```

The referenced Workspace Representation owns the exact complete/bounded source scope and its External Payload closure. If that bounded source happens to contain an Anchor, Axiom, Loom, Sigma, Kodax, or other Role artifact, that presence is context only; it is not a package recipient/holder/participant declaration.

Mixed clear-route plus sealed or bounded Required Context carriage may use Handoff-carrier mode. The selected route itself must resolve through clear qualified source material:

```md
- Package Role: recipient-facing-handoff-carrier

## Workspace Snapshot Bindings

- docs
  - Workspace Id: docs
  - Workspace Artifact: [Docs Workspace](001-3-docs.workspace.md)
  - Snapshot Path: [Docs Snapshot](001-3-docs-workspace.zip)
  - Workspace Artifact Inner Path: .topics/.workspaces/tiinex-docs.workspace.md
  - Snapshot Kind: exact-workspace-byte-tree-archive
  - Coverage: complete
  - Binding State: verified
  - Integrity Method: sha256
  - Integrity Value: <64 lowercase hexadecimal characters>

## Material Representation Bindings

- business-role-context
  - Material Id: business-role-context
  - Workspace Representation: [Bounded Business Role Context](001-4-business-role-context-representation.trace.md)
  - Carriage State: verified

## Route Discovery

- Route Placement Rule: authoritative-workspace-descended
- Continue-From Rule: exact-package-local-handoff-pointer
- Pre-Handoff Closure Rule: selected-pointer-carrier-ancestors

## Transport Projection

- Generic Transport Rule: start-artifact-instruction
- Route Transport Rule: selected-handoff-route-instruction
- Recipient Projection Rule: qualified-handoff-to-endpoint-only
```

The route-specific human transport projection may add the exact Continue-From pointer and may label a delivery recipient only from the selected Handoff's qualified `To` endpoint. The bounded Role context still does not create that recipient.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: Tsl2YQ8lJo9TsPnRmbdwpSLtf7hnmLSiUBXvrAxDFCk