# Section 12 — Environment Variables

## 12.1 Backend (`apps/api/.env`)

| Variable | Example | Required | Purpose |
|----------|---------|----------|---------|
| `DATABASE_URL` | `postgresql://user:pass@host/forgedx` | ✅ | Prisma connection string (with pgvector) |
| `SUPABASE_URL` | `https://xxx.supabase.co` | ✅ | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | `eyJ...` | ✅ | Service role key (backend only — never expose) |
| `OPENAI_API_KEY` | `sk-...` | ✅ | OpenAI API key (GPT-4.1-mini + embeddings) |
| `CLERK_SECRET_KEY` | `sk_test_...` | ✅ | Clerk backend secret (JWT verification) |
| `CLERK_WEBHOOK_SECRET` | `whsec_...` | ✅ | Clerk webhook signing secret |
| `PORT` | `3001` | ✅ | Hono server port |
| `PDF_RENDER_URL` | `http://localhost:3000` | ✅ | Next.js URL for Puppeteer PDF rendering |
| `PUPPETEER_EXECUTABLE_PATH` | `` (empty=auto) | ❌ | Chromium path; empty = auto-download |
| `PUPPETEER_NO_SANDBOX` | `true` | ❌ | Required for containerized environments |
| `NODE_ENV` | `development` | ✅ | `development` \| `production` |
| `LOG_LEVEL` | `info` | ❌ | `debug` \| `info` \| `warn` \| `error` |

## 12.2 Frontend (`apps/web/.env.local`)

| Variable | Example | Required | Purpose |
|----------|---------|----------|---------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001/api` | ✅ | Hono API base URL |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_test_...` | ✅ | Clerk frontend key |
| `CLERK_SECRET_KEY` | `sk_test_...` | ✅ | Clerk server-side (middleware) |
| `NEXT_PUBLIC_SKOOL_COURSE_URL` | `https://skool.com/pragmaworks` | ✅ | Skool course CTA URL |
| `NEXT_PUBLIC_WORKSHOP_URL` | `https://pragmaworks.dev/workshops` | ✅ | Workshop page URL |
| `NEXT_PUBLIC_WORKSHOP_BOOKING_URL` | `https://cal.com/pragmaworks/gs-workshop` | ✅ | Direct booking URL |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | ✅ | Used for shareable report links |

## 12.3 `.env.example` (Committed Template)

Both `apps/api/.env.example` and `apps/web/.env.example` are committed with placeholder values. Actual `.env` and `.env.local` files are gitignored.

## 12.4 Railway / Production Deployment

| Service | Platform | Config |
|---------|----------|--------|
| API | Railway | Dockerfile or Nixpack; set all `apps/api` env vars |
| Web | Vercel or Railway | Next.js auto-detect; set all `apps/web` env vars |
| DB | Supabase | pgvector extension enabled in project settings |
| Storage | Supabase Storage | Bucket: `forgedx-documents` (private) + `forgedx-pdfs` (public) |

**Puppeteer on Railway:** Use `ghcr.io/puppeteer/puppeteer` base image or Nixpack buildpack. Set `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser`, `PUPPETEER_NO_SANDBOX=true`.
