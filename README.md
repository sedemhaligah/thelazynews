# TheLazyNews

> Staying informed without the suffering.

A self-updating personal news dashboard that fetches, summarises, and categorises news across AI, tech, economy, business, and finance — every day at 07:00 UTC, completely automatically, with no ongoing cost.

---

## Is it actually free?

Yes — as long as you stay within free tier limits, which this project is designed to do.

| Service | What we use | Free tier limit | Our daily usage |
|---|---|---|---|
| **Groq API** | Summarise ~40 articles + 1 daily brief | 14,400 requests/day, 6,000 tokens/min | ~41 requests/day |
| **Finnhub** | Finance headlines (1 API call/day) | 60 calls/min, unlimited daily | 1 call/day |
| **RSS feeds** | All news fetching | Unlimited, no key required | ~12 feeds/day |
| **Supabase** | Store articles + editions | 500 MB database | ~40 KB/day |
| **GitHub Actions** | Run the daily pipeline | 2,000 min/month (public repo) | ~4 min/day → ~120 min/month |
| **Vercel** | Host the frontend | 100 GB bandwidth/month | Personal traffic only |

**Hard limits to know:**
- GitHub Actions gives **2,000 free minutes/month for public repos**, 500 for private. This project uses ~120/month on either plan.
- Supabase's 500 MB will last roughly **30+ years** at 40 articles/day.
- Groq's free tier has been stable but their terms have changed before — verify limits when you sign up.
- Vercel's Hobby plan is for **personal, non-commercial projects only**. This qualifies.

**Bottom line:** zero credit card required, zero monthly bill, assuming you don't monetise it or serve it to thousands of users.

---

## Architecture

```
┌──────────────────────────────────────┐
│  GitHub Actions (cron: 07:00 UTC)    │
└─────────────────┬────────────────────┘
                  │ runs daily
                  ▼
┌──────────────────────────────────────┐
│  pipeline/run.ts                     │
│                                      │
│  1. Fetch RSS feeds (12 sources)     │
│  2. Fetch Finnhub finance headlines  │
│  3. Deduplicate by title             │
│  4. Trim to 8 per sector (~40 total) │
│  5. Summarise via Groq (sequential,  │
│     3.5s delay to respect rate limit)│
│  6. Generate daily TLDR paragraph    │
│  7. Write to Supabase                │
└─────────────────┬────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────┐
│  Supabase (Postgres)                 │
│  • daily_editions (date, tldr, count)│
│  • articles (title, summary,         │
│    category, source, url)            │
└─────────────────┬────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────┐
│  Next.js frontend (Vercel)           │
│  • / → today's edition               │
│  • /[date] → past editions           │
│  • Category tabs, section dividers   │
│  • Reads from Supabase (anon key)    │
└──────────────────────────────────────┘
```

---

## Tech stack

| Layer | Tool | Why |
|---|---|---|
| News fetching | RSS (12 feeds, no key) + Finnhub free API | No rate limits on RSS; Finnhub covers finance headlines |
| AI summarisation | Groq API — `llama-3.1-8b-instant` | Fast, free, good enough for summarisation |
| Scheduler | GitHub Actions cron | 2,000 free minutes/month |
| Database | Supabase (Postgres) | Free up to 500 MB, REST API built in |
| Frontend | Next.js 16 (App Router) + Tailwind CSS | Works natively with Vercel |
| Hosting | Vercel Hobby | Auto-deploys from GitHub, free |
| Language | TypeScript | Type safety across pipeline and frontend |
| Fonts | Sora (headlines) · Inter (body) · JetBrains Mono (meta) | Clean editorial look |

---

## Project structure

```
thelazynews/
├── .github/
│   └── workflows/
│       └── daily-pipeline.yml     ← GitHub Actions cron job
├── pipeline/
│   ├── run.ts                     ← entry point
│   ├── fetch/
│   │   ├── rss.ts                 ← fetches all RSS feeds
│   │   └── finnhub.ts             ← fetches Finnhub finance headlines
│   ├── process/
│   │   ├── deduplicate.ts         ← dedup + trim per category
│   │   └── summarize.ts           ← Groq summarisation + daily brief
│   └── store/
│       └── supabase.ts            ← writes to Supabase
├── web/                           ← Next.js app
│   ├── app/
│   │   ├── page.tsx               ← today's edition
│   │   └── [date]/page.tsx        ← past editions
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── DailySummary.tsx
│   │   ├── CategoryTabs.tsx
│   │   ├── ArticleCard.tsx
│   │   └── EditionPage.tsx
│   └── lib/
│       └── supabase.ts            ← Supabase client + query helpers
├── supabase/
│   └── schema.sql                 ← run once in Supabase SQL editor
└── README.md
```

---

## Setup

Follow these steps in order.

### 1. Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste and run the contents of [`supabase/schema.sql`](supabase/schema.sql)
3. Go to **Settings → API** and copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_KEY` (keep this secret — pipeline only)

### 2. Groq

1. Sign up at [console.groq.com](https://console.groq.com)
2. Go to **API Keys → Create API Key**
3. Copy the key → `GROQ_API_KEY`

### 3. Finnhub

1. Sign up at [finnhub.io](https://finnhub.io)
2. Your API key is shown on the dashboard
3. Copy it → `FINNHUB_API_KEY`

### 4. GitHub secrets

In your GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**

Add all four pipeline secrets:

```
GROQ_API_KEY
FINNHUB_API_KEY
SUPABASE_URL
SUPABASE_SERVICE_KEY
```

### 5. Run the pipeline locally (test first)

```bash
cd pipeline
cp .env.example .env
# Fill in all four values in .env

npm install
export $(cat .env | xargs) && npx ts-node run.ts
```

Expected output (takes ~3 minutes):
```
[TheLazyNews] Pipeline starting...
[Pipeline] Fetched 48 RSS articles
[Pipeline] Fetched 8 Finnhub articles
[Pipeline] After dedup: 52 articles
[Pipeline] Trimmed to 40 articles (8 per sector)
[Groq] 1/40 "Nobel laureate joins Anthropic..."... ok
...
[Pipeline] Summarised 38 articles
[Pipeline] Generated daily summary
[Supabase] Wrote 38 articles for 2026-06-21
[TheLazyNews] Done.
```

### 6. Frontend

```bash
cd web
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). If the pipeline ran successfully you'll see today's briefing.

### 7. Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repo
3. Set the **root directory** to `web`
4. Add environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```
5. Deploy. Done.

The GitHub Actions cron runs every day at **07:00 UTC** and updates Supabase. Vercel reads the latest data on each page visit (revalidates every hour).

---

## Environment variables

### Pipeline (`pipeline/.env`)

| Variable | Where to get it |
|---|---|
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) → API Keys |
| `FINNHUB_API_KEY` | [finnhub.io](https://finnhub.io) → Dashboard |
| `SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `SUPABASE_SERVICE_KEY` | Supabase → Settings → API → service_role key |

### Frontend (`web/.env.local`)

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Same as `SUPABASE_URL` above |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon / public key |

> The anon key is safe to expose in frontend code — Supabase's row-level security policies limit it to read-only on public data. Never put the `service_role` key in the frontend.

---

## Triggering the pipeline manually

The workflow includes a `workflow_dispatch` trigger so you can run it on demand:

GitHub repo → **Actions → Daily News Pipeline → Run workflow**

Useful for testing after adding new secrets or changing feed sources.

---

## Known limitations

- **Groq rate limits:** The pipeline processes articles sequentially with a 3.5s delay between requests to stay within the 6,000 tokens/minute free limit. ~40 articles takes around 3 minutes.
- **RSS feeds can go stale:** Feed URLs change occasionally. If a sector shows 0 articles, check the URL still works with `curl`.
- **GitHub Actions cron is not precise:** Runs within ~15 minutes of 07:00 UTC. Fine for a daily digest.
- **No auth on the frontend:** It's a personal project. If you want it private, enable Vercel password protection in the project settings (available on the free Hobby plan).
- **Free tiers change:** Groq, Supabase, and Vercel have all adjusted their free tiers before. Verify current limits when you sign up.
