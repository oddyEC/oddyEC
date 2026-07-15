---
title: "Where should an agent's state live?"
description: "A practical split between workflow state, conversation state, business state, checkpoints, queues, and durable recovery."
publishedAt: 2026-07-15
tags:
  - Agents
  - State
  - Reliability
order: 1
---

Agent state is not one thing. Treating it as one thing usually leads to a fragile system where everything is hidden inside a framework object, a chat transcript, or a worker's memory.

The useful split is:

| State type | Owner | Example |
| --- | --- | --- |
| Workflow state | Orchestrator and database | Step, status, retries, checkpoint ID |
| Conversation state | Product layer | Messages, user intent, clarification history |
| Business state | Domain database | Customer, order, ticket, policy, approval |
| Execution state | Queue and worker | Job ID, lease, timeout, retry attempt |
| Evaluation state | Eval store | Expected behavior, observed output, failure label |

## Durable State

Durable workflow state belongs outside the model runtime. If a worker dies, the system should know the last safe checkpoint and what can be retried.

```text
request_received
  -> classified
  -> plan_created
  -> waiting_for_approval
  -> tool_executed
  -> evaluated
  -> completed
```

Each transition should be explicit enough to answer: what happened, who or what caused it, what evidence was produced, and what is safe to do next?

## Queues And Checkpoints

Queues are for execution pressure and retries. Databases are for truth. A queued job can disappear, duplicate, or timeout. The workflow record should still define whether the task is pending, running, blocked, failed, or complete.

Checkpoints should happen after meaningful state changes, not after every token. Good checkpoint boundaries include approval requested, tool call completed, recovery attempted, and final answer accepted.

## Common Mistakes

The most common mistake is saving all state in memory because the demo only runs for a few minutes. The second is saving everything inside the agent framework and then discovering that product state, audit state, and recovery state are hard to query.

Agent frameworks can manage graph execution, but the product still needs a durable model of the work.

## A Practical Rule

If losing it would make the task impossible to resume, explain, audit, or evaluate, persist it in a database. If it only helps a single worker finish the current attempt, it can live in execution state.
