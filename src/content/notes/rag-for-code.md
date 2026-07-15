---
title: "RAG for code: why embeddings alone are not enough"
description: "Code retrieval needs symbols, lexical search, AST structure, dependency edges, and separate evaluation for retrieval and generation."
publishedAt: 2026-07-15
tags:
  - RAG
  - Code Search
  - Evaluation
order: 2
---

Embedding search is useful for code, but it is not a complete retrieval strategy. Code is full of exact names, local structure, and dependency relationships that arbitrary chunks can flatten.

## The Chunking Problem

If a retriever splits a repository every N characters, it may separate a function from its decorator, a class from its methods, or a call site from the import that explains it.

```text
bad chunk: lines 120-180
better unit: function, class, route handler, migration, config block
```

The retrieval unit should respect code structure whenever possible.

## What The Retriever Should Know

A stronger code RAG system combines:

- AST nodes for functions, classes, methods, and imports.
- Symbol tables for definitions and references.
- Lexical search for exact identifiers.
- Vector search for conceptual similarity.
- Dependency edges for call paths and ownership.
- Reranking that rewards specific, verifiable evidence.

## Hybrid Retrieval

For "where is invoice status updated?", lexical search may find `invoice_status`, while vector search finds "billing lifecycle". The dependency graph can then connect the route, service, model, worker, and tests.

The final context should look less like a bag of chunks and more like an evidence set:

| Evidence | Why it matters |
| --- | --- |
| Definition | Explains the primary symbol |
| References | Shows runtime usage |
| Tests | Shows expected behavior |
| Docs | Explains product intent |

## Evaluate Retrieval Separately

Do not evaluate only the generated answer. First ask whether the retriever found the right files and symbols. Then ask whether the generator used them correctly.

Useful retrieval metrics include Recall@5, Mean Reciprocal Rank, and citation correctness. Useful generation metrics include grounded answer rate and unsupported-claim rate.

## The Goal

The goal is not to make the model sound confident about a codebase. The goal is to help an engineer verify an answer quickly, with citations that survive inspection.
