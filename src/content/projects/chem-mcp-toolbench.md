---
title: "Chem MCP Toolbench"
status: "ACTIVE PROJECT"
headline: "Delegate calculations. Don’t hallucinate them."
description:
  - "An MCP-compatible tool server and evaluation suite that delegates molecular calculations to deterministic RDKit tools instead of asking language models to approximate scientific results."
  - "The project covers molecular descriptors, SMILES validation, fingerprints, Tanimoto similarity, tool selection, and grounded reporting."
tags:
  - Python
  - MCP
  - RDKit
  - Tool Use
  - Evaluation
  - Property Testing
priority: 2
repoUrl: null
architecture:
  - "MCP client"
  - "Tool router"
  - "RDKit tools"
  - "Validation layer"
  - "Evaluation suite"
metrics:
  - label: "Correct tool selection"
    value: "Baseline pending"
    note: "Measures whether the model chooses the intended tool for the chemistry request."
  - label: "Valid argument generation"
    value: "Baseline pending"
    note: "Checks schema compliance, valid SMILES input, and required parameters."
  - label: "Tool execution success"
    value: "Baseline pending"
    note: "Tracks successful deterministic execution after validation."
  - label: "Grounded answer rate"
    value: "Baseline pending"
    note: "Measures whether final answers are supported by tool output."
  - label: "Unsupported-claim rate"
    value: "Baseline pending"
    note: "Counts statements that go beyond computed results or declared limitations."
decisions:
  - title: "Scientific calculations belong in deterministic tools"
    body: "The language model can plan and explain, but molecular descriptors, fingerprints, validation, and similarity calculations should come from RDKit."
  - title: "Treat invalid chemistry input as a first-class outcome"
    body: "Invalid SMILES, unsupported molecules, and ambiguous requests should return structured errors that the model can explain without fabricating results."
  - title: "Evaluate interpretation, not only execution"
    body: "A successful tool call is insufficient if the final answer misstates the result or adds unsupported scientific claims."
---

## Scientific Problem

Language models can produce fluent chemistry explanations while being unreliable at exact molecular calculations. A model may approximate a descriptor, invent a property, or compare molecules without using a reproducible method.

Chem MCP Toolbench addresses that boundary by delegating deterministic work to RDKit tools exposed through MCP.

## Why Tool Delegation Matters

Scientific systems need answers that can be traced to a method. For molecular descriptors and similarity calculations, the product should not ask a language model to guess.

The intended division of labor is simple:

| Mode | Behavior | Risk |
| --- | --- | --- |
| LLM without tools | Generates a plausible answer from prior text patterns. | High risk of fabricated calculations and unsupported claims. |
| LLM with MCP tools | Selects a tool, passes validated arguments, receives deterministic output, and explains the result. | Remaining risk shifts to tool selection, argument generation, and interpretation. |

## MCP Tool Design

The MCP server exposes focused tools instead of one broad chemistry endpoint. Each tool has a narrow schema, explicit input requirements, and structured return values.

Example tool families:

- SMILES validation and canonicalization.
- Molecular descriptor calculation.
- Fingerprint generation.
- Tanimoto similarity.
- Batch comparison for small candidate sets.

## Input Validation

Inputs are validated before reaching RDKit execution. The validation layer should reject empty strings, malformed SMILES, unsupported argument combinations, and ambiguous requests that require missing parameters.

The returned error should be useful to both the calling model and the user:

```json
{
  "ok": false,
  "error_type": "invalid_smiles",
  "message": "The input could not be parsed as a valid SMILES string.",
  "input": "C1CC"
}
```

## SMILES Canonicalization

Canonicalization makes equivalent molecular representations easier to compare and report. The system should preserve the original input for audit while using canonical SMILES for downstream descriptors and fingerprints.

## Molecular Descriptors

Descriptor tools should return named values with units or definitions where applicable. The response should make it clear which library produced the result and which input representation was used.

## Fingerprints And Tanimoto Similarity

Fingerprints and similarity should be exposed as deterministic operations with explicit parameters. A similarity result is not a universal truth about two molecules; it is a method-specific comparison.

## Tool-Selection Evaluation

Tool-selection evaluation checks whether the model chooses the expected tool for requests such as validation, descriptor calculation, or similarity comparison. This should be measured separately from whether RDKit executes successfully.

## Grounding Evaluation

Grounding evaluation compares the final answer against tool output. The answer should cite computed values, avoid unsupported extrapolation, and state limitations when the tool output is insufficient.

## Error Taxonomy

Planned error categories include:

- Invalid SMILES.
- Unsupported molecule or descriptor.
- Missing required argument.
- Wrong tool selected.
- Tool execution failure.
- Correct result with incorrect interpretation.
- Unsupported scientific claim.

## Testing Strategy

The testing strategy combines unit tests for tool wrappers, schema tests for MCP responses, property-style tests for validation behavior, and evaluation fixtures for model-tool interaction.

## Current Status

This is an active project. The case study avoids presenting fabricated performance values; metrics remain baseline pending until the evaluation suite has stable fixtures and repeatable runs.

## Roadmap

- Finalize the MCP schema for each chemistry tool.
- Build deterministic RDKit wrappers with structured errors.
- Create tool-selection and grounding fixtures.
- Add report templates that distinguish computed facts from explanations.
- Track unsupported-claim rate across model and prompt changes.
