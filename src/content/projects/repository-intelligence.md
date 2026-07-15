---
title: "Repository Intelligence"
status: "PLANNED · DESIGN IN PROGRESS"
headline: "AST-aware retrieval for answering architectural and implementation questions about large codebases."
description:
  - "An AST-aware retrieval system for exploring large codebases through symbols, dependencies, call relationships, documentation, and semantic search."
  - "Designed to answer architectural and implementation questions with file-level citations and measurable retrieval quality."
tags:
  - Python
  - AST
  - Tree-sitter
  - Hybrid Retrieval
  - RAG
  - Evaluation
priority: 3
repoUrl: null
architecture:
  - "Repository parser"
  - "AST index"
  - "Symbol graph"
  - "Hybrid retriever"
  - "Reranker"
  - "Answer generator"
metrics:
  - label: "Recall@5"
    value: "Baseline pending"
    note: "Measures whether relevant files or symbols appear in the top five retrieved items."
  - label: "Mean Reciprocal Rank"
    value: "Baseline pending"
    note: "Rewards relevant results appearing earlier in the ranked list."
  - label: "Citation correctness"
    value: "Baseline pending"
    note: "Checks whether cited files and symbols support the answer."
  - label: "Grounded answer rate"
    value: "Baseline pending"
    note: "Measures whether generated answers stay within retrieved evidence."
  - label: "Latency"
    value: "Baseline pending"
    note: "Tracks retrieval and answer generation time per query."
  - label: "Cost per query"
    value: "Baseline pending"
    note: "Connects embedding, reranking, and generation costs to a user question."
decisions:
  - title: "Embedding-only search is not enough"
    body: "Code questions often depend on symbols, imports, call relationships, and exact names that arbitrary chunks can obscure."
  - title: "Separate retrieval quality from answer quality"
    body: "The system should know whether it failed because it retrieved the wrong context or because the generation step misused good context."
  - title: "Citations are part of the product"
    body: "Answers should point to files and symbols so an engineer can verify claims without trusting the model."
---

## Problem

Large repositories are hard to explore when the question crosses files, frameworks, and architectural layers. A developer may need to know where a workflow starts, which service owns a table, how an API reaches a queue, or why a function is safe to modify.

Repository Intelligence is still in design. It is not presented as a finished system.

## Why Embedding-Only Code Search Is Insufficient

Embedding chunks can help find semantically related text, but code has structure that generic chunking often loses:

- Symbols may be defined in one file and used elsewhere.
- Imports and dependency edges carry meaning.
- Call chains explain runtime behavior.
- Exact identifiers matter.
- A small function can be more relevant than a large nearby chunk.

The retrieval system should use semantic search, but it should not depend on semantic search alone.

## AST-Aware Indexing

The indexer would parse supported languages with Tree-sitter and extract files, symbols, definitions, references, imports, docstrings, and local context windows.

The index should preserve both the source text and structured metadata:

```text
file -> symbols -> definitions -> references
                  -> imports
                  -> call relationships
```

## Symbol And Dependency Graph

The symbol graph connects definitions to references and dependencies. This makes it possible to answer questions such as "where is this API called?" or "what writes to this table?" without relying only on natural language similarity.

## Hybrid Retrieval

The planned retrieval path combines:

- Lexical search for exact identifiers and filenames.
- Vector search for conceptual questions.
- Graph expansion for related symbols and dependencies.
- Reranking to balance evidence quality and context budget.

## Reranking

Reranking should prefer results that are specific, cited, and structurally connected to the question. A file that contains the exact symbol and a related call edge may rank higher than a long chunk with similar wording.

## File And Symbol Citations

Every answer should include file-level citations and, where available, symbol-level references. The user should be able to open the cited file and see why it supports the answer.

## Evaluation Dataset

The evaluation dataset should include questions with known relevant files and symbols:

- "Where does request validation happen?"
- "Which worker executes this task?"
- "What code path writes this database record?"
- "Where is this feature flag read?"
- "Which tests cover this behavior?"

Retrieval metrics and answer-grounding metrics should be evaluated separately.

## Expected Failure Modes

- Relevant symbol missed because the parser does not support the language feature.
- Exact-match search dominates a conceptual question.
- Vector search retrieves a similarly named but unrelated file.
- Reranking loses a small but critical function.
- Generated answer cites files that are related but not sufficient.

## Implementation Roadmap

1. Implement repository ingestion and language detection.
2. Add Tree-sitter parsing for the first language set.
3. Build symbol, import, and reference indexes.
4. Add lexical and vector retrieval.
5. Add graph expansion and reranking.
6. Create evaluation fixtures with known relevant files.
7. Add grounded answer generation with citations.
