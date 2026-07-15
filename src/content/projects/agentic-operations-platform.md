---
title: "Agentic Operations Platform"
status: "IN DEVELOPMENT · FLAGSHIP PROJECT"
headline: "An always-on AI operator for operational workflows with durable state and approval boundaries."
description:
  - "An always-on AI operator that receives operational requests, coordinates stateful workflows, invokes tools through approval gates, and recovers safely from partial failures."
  - "Built around durable state, asynchronous execution, observability, evaluation, and predictable cost."
tags:
  - Django
  - LangGraph
  - Celery
  - Redis
  - PostgreSQL
  - pgvector
  - Next.js
  - Evaluation
priority: 1
repoUrl: null
architecture:
  - "Next.js"
  - "Django API"
  - "LangGraph orchestration"
  - "Celery/Redis workers"
  - "PostgreSQL/pgvector"
  - "Tools and model providers"
metrics:
  - label: "Task success rate"
    value: "Baseline pending"
    note: "Tracks whether a request reached a verified terminal state."
  - label: "Tool-selection accuracy"
    value: "Baseline pending"
    note: "Measures whether the workflow selected the expected tool for the task."
  - label: "Recovery rate"
    value: "Baseline pending"
    note: "Captures successful continuation after retries, worker failures, or partial completion."
  - label: "Human-intervention rate"
    value: "Baseline pending"
    note: "Shows how often the workflow requires approval, correction, or escalation."
  - label: "P50/P95 latency"
    value: "Baseline pending"
    note: "Separates normal path latency from tail latency under retries and queues."
  - label: "Cost per completed task"
    value: "Baseline pending"
    note: "Connects model calls, tool calls, and worker time to an operational unit."
decisions:
  - title: "Do not make every step an agent"
    body: "Classification, routing, validation, and persistence are deterministic where possible. Agents are used where reasoning and adaptation create value, not as a default abstraction."
  - title: "Persist workflow state outside the agent runtime"
    body: "The database remains the system of record for tasks, checkpoints, approvals, tool outputs, and recovery metadata."
  - title: "Run non-trivial work asynchronously"
    body: "Celery and Redis keep long-running execution away from request/response paths, making retries, timeouts, and operator visibility easier to control."
---

## Overview

Agentic Operations Platform is designed as an operational AI system rather than a chat wrapper. A user submits a request, the system classifies and routes it, creates a plan when the task is non-trivial, requests human approval when needed, executes tools, evaluates the result, and records every important state transition.

The project is in development. The public case study describes the intended architecture, current implementation direction, and evaluation plan without presenting unverified performance claims.

## Problem

Many AI workflow prototypes fail when they meet production constraints. They keep state in memory, assume tool calls will succeed, hide errors inside chat transcripts, and treat human approval as a UI detail instead of a workflow boundary.

The problem is not only model quality. The system has to coordinate state, tools, queues, APIs, permissions, audit trails, and recovery paths.

## Product Scenario

The target scenario is an internal operations assistant that can receive requests such as:

- Prepare a customer account review.
- Check whether an operational exception needs escalation.
- Draft a response using approved internal context.
- Trigger a bounded workflow after approval.
- Summarize the final state with links to evidence.

The system should handle routine work automatically, pause when approval is required, and preserve enough context for another worker or human to resume the task safely.

## Constraints

- Workflows may outlive a web request.
- Tool calls can fail, timeout, or return partial results.
- Some actions require explicit approval before execution.
- Users need to understand why a task is blocked.
- Cost must be visible per task, not only per model provider bill.
- Evaluation needs to cover behavior, not just prompt examples.

## System Architecture

The conceptual path is:

```text
Next.js -> Django API -> LangGraph orchestration -> Celery/Redis workers -> PostgreSQL/pgvector -> Tools and model providers
```

Next.js owns the operator experience. Django exposes authenticated APIs and persists business objects. LangGraph represents the workflow lifecycle. Celery workers execute long-running or retryable steps. PostgreSQL stores durable state, approvals, event logs, and evaluation records. pgvector supports retrieval over approved context where semantic search is useful.

## Workflow Lifecycle

1. Request intake records the user, payload, source, and initial constraints.
2. Deterministic classification assigns the request to a known workflow family.
3. Routing selects the workflow definition and required policies.
4. Planning is used only when the task has meaningful branching or tool dependencies.
5. Approval gates pause the workflow before high-impact actions.
6. Execution invokes tools with typed inputs and idempotency keys.
7. Evaluation checks expected behavior, evidence, and completion criteria.
8. Recovery resumes from the latest durable checkpoint after a failure.

## Key Engineering Decisions

The system intentionally avoids treating "agent" as the unit of architecture. The unit of architecture is the workflow. Some nodes are deterministic functions, some are model calls, some are tool calls, and some are human approval states.

That boundary matters because deterministic components are easier to test, cheaper to run, and safer to retry. Agents are useful when the system needs reasoning across context, but they are not a substitute for validation, persistence, or policy.

## Reliability Strategy

Reliability is designed into the workflow shape:

- Durable checkpoints after meaningful state transitions.
- Idempotency keys for tool calls that create or change external state.
- Timeouts on model calls, retrieval calls, and tools.
- Bounded retries with explicit failure categories.
- Dead-letter handling for tasks that cannot complete automatically.
- Structured event logs for audit and debugging.
- Recovery views that explain the latest known state and next safe action.

## Evaluation Plan

The evaluation plan separates routing, tool selection, execution, grounding, and final task success. A single "good answer" score is not enough because the system can fail in different ways.

Planned evaluation assets include:

- Golden workflow requests with expected routes and policies.
- Tool-selection fixtures with expected tools and arguments.
- Failure cases for unavailable tools, bad inputs, and missing approvals.
- Grounding checks for final summaries.
- Regression runs before changing prompts, tools, or model providers.

## Security And Approval Boundaries

Approval is modeled as a workflow state, not a modal dialog. A task that requires approval cannot proceed until the approval record is stored with the actor, timestamp, scope, and approved action.

The system separates read-only tools from tools that create, update, send, delete, or spend. High-impact tools require narrower scopes, audit events, and explicit confirmation before execution.

## Current Status

The project is in active development. The current focus is defining the core workflow model, persistence boundaries, approval state machine, and evaluation dataset before optimizing prompts or adding more tools.

## Next Improvements

- Implement the first end-to-end workflow with durable checkpoints.
- Add task-level cost accounting.
- Build the approval review surface.
- Add structured traces for model calls, tool calls, retries, and recoveries.
- Create regression fixtures for routing and tool-selection behavior.
