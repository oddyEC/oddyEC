---
title: "Evaluating MCP tools beyond successful execution"
description: "A tool call can execute successfully while the system still chooses the wrong tool, passes weak arguments, or misinterprets the result."
publishedAt: 2026-07-15
tags:
  - MCP
  - Tool Use
  - Evaluation
order: 3
---

"The tool ran" is not enough. Tool-using AI systems can fail before execution, during execution, or after execution when the model explains the result.

## Evaluation Stages

| Stage | Question |
| --- | --- |
| Tool selection | Did the model choose the right tool for the user intent? |
| Argument generation | Did it produce complete, valid, safe arguments? |
| Schema compliance | Did the call match the MCP schema? |
| Execution | Did the tool complete and return structured output? |
| Interpretation | Did the answer reflect the tool result accurately? |
| Grounding | Are claims supported by the returned evidence? |

## A Minimal Failure Taxonomy

```text
wrong_tool
missing_argument
invalid_argument
schema_violation
tool_timeout
tool_error
result_misread
unsupported_claim
unsafe_action
```

This taxonomy makes failures actionable. A wrong tool may need better tool descriptions or routing. A result misread may need answer constraints. A timeout may need infrastructure work.

## Grounding Matters

A model can call the correct tool and still add unsupported claims in the final answer. Evaluation should compare the answer with the tool output and flag claims that are not present, implied, or allowed by policy.

## Good Fixtures

Good fixtures include normal requests, ambiguous requests, invalid inputs, unsupported operations, and adversarial phrasing. Each fixture should define the expected tool, required arguments, acceptable error type, and grounding requirements.

## The Operating Principle

Evaluate the contract between model, tool, and final answer. Successful execution is only one part of that contract.
