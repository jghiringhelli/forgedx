# ADR-004 — Hexagonal Architecture (Ports and Adapters)

**Date:** 2026-06-11
**Status:** Accepted
**Context:**
The assessment pipeline makes calls to OpenAI, Prisma, Supabase Storage, and Puppeteer. If these are called directly from domain services, the domain is tightly coupled to specific providers. Swapping models (OpenAI → Anthropic) or storage providers (Supabase → S3) would require domain changes.

**Decision:** Hexagonal architecture. Domain defines port interfaces; infrastructure implements adapters.

**Key ports:**
- `IAIProvider` — `complete(options)` + `embed(text)` — implemented by `OpenAIAdapter`
- `IDocumentRepository` — implemented by `DocumentPrismaRepo`
- `IAssessmentRepository` — implemented by `AssessmentPrismaRepo`
- `IStorageAdapter` — `upload(path, buffer)` + `getSignedUrl(path)` — implemented by `SupabaseStorageAdapter`
- `IPdfAdapter` — `render(html)` → Buffer — implemented by `PuppeteerAdapter`

**Rationale:**
1. **Swappable AI provider.** The most likely infrastructure change is switching from GPT-4.1-mini to a newer model or a different provider. With `IAIProvider`, this is one new adapter file.
2. **Testable domain.** Unit tests for `PipelineService`, `ScoringEngine`, etc. use mock adapters. No real OpenAI calls in unit tests.
3. **GS-compliant.** This architecture directly embodies the Composable property: each domain unit can be worked in isolation by a stateless reader.
4. **Explicit dependency inversion.** The direction of imports: `routes → domain → ports ← infrastructure`. Never `domain → infrastructure`.

**Consequences:**
- ✅ Domain services are pure TypeScript — no `import { OpenAI } from 'openai'` in domain/
- ✅ All infrastructure replaceable without domain changes
- ✅ Unit tests are fast (no I/O, no API calls)
- ⚠️ Manual wiring in `app.ts` — accepted trade-off (see ADR-002)
- ⚠️ More files than a flat service structure — justified by the GS Composable property requirement
