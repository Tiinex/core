# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.discovery.v1](../tiinex.discovery.v1.schema.md)
  - Created At: 2026-06-29 00:00:00
  - Trace: [tiinex.discovery.v1.schema.md](../tiinex.discovery.v1.schema.md)
  - Origin:
    - [relative](../tiinex.discovery.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/2bf1fbeddb1bad6c98fed68bd2abb15099e91a4d/.topics/.schemas/discovery/tiinex.discovery.v1.schema.md)
- Current
  - Current Schema: [tiinex.discovery.research.v1](tiinex.discovery.research.v1.schema.md)
  - Created At: 2026-06-29 00:00:00
  - Summary: Schema for question-driven research artifacts that preserve inquiry, source review, findings, synthesis, and limits.

---

# Discovery Research

- Status: maintained schema note

## Summary

This schema narrows discovery into research: a question-driven or hypothesis-driven inquiry that seeks understanding, support, contradiction, context, or decision input through bounded source review.

Research is more structured than open exploration and more interpretive than a single finding. It should preserve the research question, method, source field, findings, synthesis, and limits without pretending that synthesis is automatically a decision or that sources are automatically evidence.

## Schema Validation Contract

### Research Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.discovery.research.v1`

Rules

- `tiinex.discovery.research.v1` identifies artifacts centered on bounded question-driven inquiry.
- A research artifact should state the research question, source field, method, findings, synthesis, and limits.
- Research may surface evidence candidates, finding artifacts, signal artifacts, relation candidates, and decision inputs without replacing those schemas.
- Research artifacts must distinguish source material, interpretation, synthesis, uncertainty, and follow-up.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Parent Body Specialization

Rules

- `tiinex.discovery.research.v1` specializes the inherited `Discovery Body`.
- The child body replaces the parent body sections for artifacts whose current schema is `tiinex.discovery.research.v1`.
- `Research Question` specializes `Discovery Intent`.
- `Source Field` specializes `Discovery Field`.
- `Method` specializes `Discovery Method` and `Discovery Boundaries`.
- `Findings` and `Synthesis` specialize `Discovery Outcome`.
- `Interpretation Limits` preserves the inherited uncertainty and overclaiming limits.

### Research Body

Required Shape

- first body heading after the continuity envelope
- `## Research Question` section
- `## Source Field` section
- `## Method` section
- `## Findings` section
- `## Synthesis` section
- `## Interpretation Limits` section

Optional Sections

- Hypothesis
- Prior Context
- Source Notes
- Evidence Candidates
- Contradictions
- Unknowns
- Follow-Up Questions
- Linked Artifacts
- References

Rules

- A research artifact should begin with a human-readable title.
- `Research Question` must state what the research seeks to answer or clarify.
- `Source Field` must state what sources, domains, repositories, datasets, documents, people, communities, or systems are in or out of scope.
- `Method` must state how sources are selected, read, compared, or evaluated.
- `Findings` must preserve material findings without overstating them as evidence unless evidence artifacts exist.
- `Synthesis` must distinguish what is inferred from what was directly found.
- `Interpretation Limits` must state missing sources, uncertainty, freshness, bias, scope, or confidence limits.

### Research Semantics

Allowed Shapes

- question-driven research
- hypothesis review
- source review
- literature-style review
- implementation review
- policy review
- comparative research
- decision-support research
- validation-support research

Rules

- Research should be bounded by question and source field.
- Research should preserve contradictions and absence instead of forcing a clean conclusion.
- Research output may inform decisions but does not land what governs unless a decision artifact owns that role.
- When the research depends on private, sensitive, or consent-bound material, privacy, consent, attestation, or surveillance artifacts may be required companions.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-research.trace.md`
- `<lineage>-<research-slug>.trace.md`

Rules

- Research artifacts should keep the lineage label first.
- The optional slug should identify the question, hypothesis, or research field.
- Research artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.discovery.research.v1` when the main artifact value is bounded question-driven inquiry.
- Do not use `tiinex.discovery.research.v1` for a single finding, preserved evidence slice, broad topic discussion, final decision, or open-ended expedition.
- Research does not prove legal compliance, truth, permission, or final correctness by itself.

## Minimal Example

```md
# Context Reduction Research Pass

## Research Question

- Question: where can a runtime reduce or carry forward conversational context?

## Source Field

- In Scope: docs and code paths named by the review target
- Out Of Scope: unrelated product roadmap, private logs, broad maintainer work

## Method

- Method: inspect named source files and separate static findings from runtime-observed findings.

## Findings

- Finding: candidate context carry-forward paths were named, but runtime behavior is not yet observed.

## Synthesis

- Synthesis: a narrower evidence pass is needed before making claims about actual behavior.

## Interpretation Limits

- Limits: this research does not prove unsafe reduction or product intent.
```

## Validation-Friendly Shape

Keep this maintained schema note in the exact section order already used here:
`Summary`, `Schema Validation Contract`, `Minimal Example`,
`Validation-Friendly Shape`, `Interpretation Notes`, and
`Artifact Creation Contract`.

Maintain the section headings exactly in this schema note. Free markdown inside
those sections is allowed, but adding undeclared new section headings should be
treated as schema drift.

## Interpretation Notes

- Research artifacts narrow discovery without replacing parent continuity or origin semantics
- Research artifacts should remain human-readable and provenance-oriented rather than app-runtime configuration
- Research artifacts may lead to evidence, signal, feedback, pointer, relation, task, decision, privacy, consent, or attestation artifacts when those schemas own the later role
- Research artifacts must state what they do not prove or authorize

## Artifact Creation Contract

### Prompt Fields

Required Fields

- version
- createTitle
- summaryPrompt
- summaryPlaceholder

Optional Fields

- whyPrompt
- whyPlaceholder
- targetPrompt
- targetPlaceholder
- boundaryPrompt
- boundaryPlaceholder

Rules

- The current research create surface uses version `1`.
- `createTitle` should label the create action as `Create Research`.
- `summaryPrompt` should ask for the research title.
- `summaryPlaceholder` should guide the user toward the relevant discovery surface.
- Creation surfaces should not require runtime-specific crawler configuration.

### Template Body

Required Shape

- first heading uses `# {summary}`
- `## Research Question` section
- `## Source Field` section
- `## Method` section
- `## Findings` section
- `## Synthesis` section
- `## Interpretation Limits` section

Rules

- Generated research artifacts should begin with the title as the first body heading.
- `Research Question` should be preserved in generated artifacts.
- `Source Field` should be preserved in generated artifacts.
- `Method` should be preserved in generated artifacts.
- `Findings` should be preserved in generated artifacts.
- `Synthesis` should be preserved in generated artifacts.
- `Interpretation Limits` should be preserved in generated artifacts.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.discovery.v1.schema.md](https://github.com/Tiinex/docs/blob/2bf1fbeddb1bad6c98fed68bd2abb15099e91a4d/.topics/.schemas/discovery/tiinex.discovery.v1.schema.md)
  - Value: DOEm9XKixnIUzuGNZ06-NUbtKT-GNCJ2ktmfJnqgHvo

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: yyEOnOP4JpslZOk3op76iDPVrcAG_qlFcULprVqEwQI