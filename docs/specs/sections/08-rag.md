# Section 08 — RAG Strategy

## 8.1 Document Types and Signal Intent

ForgeDX accepts GS-relevant documents. Type determines the extraction prompt and trust tier.

| DocumentType | Examples | Trust Tier | Signal focus |
|---|---|---|---|
| `claudeMd` | CLAUDE.md, project nav roots | 1 (highest) | Self-describing, Bounded, Defended |
| `adr` | ADR-001-*.md files | 1 | Auditable, Composable |
| `spec` | TechSpec, PRD, SPEC-INDEX, section files | 2 | All properties |
| `testFile` | *.spec.ts, *.test.ts, hurl files, playwright | 2 | Verifiable, Executable |
| `transcript` | Retros, planning sessions, team interviews | 3 | All properties |
| `discovery` | Architecture docs, design docs | 3 | Self-describing, Composable |

## 8.2 Chunking Strategy

- **Target chunk size:** ~500 tokens
- **Overlap:** ~50 tokens
- **Splitter:** Sentence-aware — split on `\n\n` > `\n` > sentence boundary; never mid-sentence
- **Minimum chunk size:** 50 tokens (discard smaller)
- **Metadata per chunk:** `{ documentId, chunkIndex, tokenCount, documentType, trustTier }`

## 8.3 Embedding Model

- **Model:** `text-embedding-3-small` (1536 dimensions)
- **When:** During document processing (Step 2 of document pipeline: parse → chunk → **embed** → store)
- **Index:** HNSW with cosine distance (`vector_cosine_ops`), m=16, ef_construction=64 (see Schema §4.3)

## 8.4 Query Strategy by Pipeline Step

| Pipeline Step | Query Strategy | Approx. Queries |
|--------------|----------------|---------|
| Step 2: Evidence Analysis | 1 query per initial signal from Step 1 | 5–15 |
| Step 3: Signal Extraction | 1 query per pathology category batch | 4 |
| Step 6: GS Opportunity Mapping | 1 query per GS property | 7 |
| Survey Prefill | 1 query per survey dimension | ~7 |

## 8.5 Per-Query Parameters

```typescript
const QUERY_PARAMS = {
  topK: 5,                      // top 5 chunks per query
  minSimilarity: 0.65,          // discard chunks below this cosine similarity
  tokenBudgetPerStep: 4000,     // max tokens of RAG context per step
}
```

**Deduplication:** Remove duplicate chunks within the same step (same `chunkIndex` + `documentId`).
**Scoping:** Always filter by `teamId` (or `projectId` for org-level assessments) — never search across teams.

## 8.6 Survey Prefill Confidence Model

```typescript
type PrefillConfidence = 'high' | 'low' | 'none'

function classifyConfidence(similarity: number): PrefillConfidence {
  if (similarity > 0.80) return 'high'   // Auto-filled (shown pre-checked)
  if (similarity > 0.55) return 'low'    // Suggested (shown for review)
  return 'none'                          // Empty (no prefill)
}
```

**Source tracking:**
- `high` prefill → `source: 'ai_auto'` (counts as `document` origin in scoring)
- `low` prefill → `source: 'ai_prefilled'` (counts as `document` origin)
- Manual answer → `source: 'manual'` (counts as independent `survey` source)

**Anti-double-counting rule (critical):** Survey answers auto-filled from a document count as `document` origin, NOT independent `survey` source. Only `source: 'manual'` answers qualify as an independent survey source for evidence level determination.

## 8.7 Document Processing Pipeline (separate from Assessment Pipeline)

```
POST /documents/:id/process
  → 1. Parse: extract raw text (PDF → pdfjs, TXT/MD → direct, CSV → tabular)
  → 2. Chunk: sentence-aware splitter → DocumentChunk[]
  → 3. Embed: OpenAI text-embedding-3-small → embedding vector per chunk
  → 4. Store: upsert DocumentChunk rows with embeddings
  → 5. Extract signals: type-specific LLM prompt → signals stored in Document.extractedSignals
  → 6. Update status: Document.status = 'processed'
```

**Failure semantics:** If embedding fails for a chunk, retry up to 3 times, then mark Document.status = 'failed' with error detail.

## 8.8 pgvector Query (Prisma Raw)

```typescript
// infrastructure/db/repositories/document.prisma-repo.ts
async findSimilarChunks(params: {
  embedding: number[];
  teamId: string;
  topK: number;
  minSimilarity: number;
}): Promise<DocumentChunk[]> {
  return this.prisma.$queryRaw`
    SELECT dc.*, 1 - (dc.embedding <=> ${`[${params.embedding.join(',')}]`}::vector) AS similarity
    FROM document_chunks dc
    JOIN documents d ON d.id = dc."documentId"
    WHERE d."teamId" = ${params.teamId}
      AND 1 - (dc.embedding <=> ${`[${params.embedding.join(',')}]`}::vector) >= ${params.minSimilarity}
    ORDER BY dc.embedding <=> ${`[${params.embedding.join(',')}]`}::vector
    LIMIT ${params.topK}
  `;
}
```
