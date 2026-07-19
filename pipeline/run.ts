import { fetchAllRSSFeeds } from './fetch/rss'
import { fetchFinnhubNews } from './fetch/finnhub'
import { enrichWithOGImages } from './fetch/ogimage'
import { deduplicateByTitle, trimPerCategory } from './process/deduplicate'
import { summarizeAndCategorize, generateDailySummary } from './process/summarize'
import { writeToSupabase } from './store/supabase'

async function main() {
  const GROQ_API_KEY = process.env.GROQ_API_KEY ?? ''
  const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY ?? ''
  const SUPABASE_URL = process.env.SUPABASE_URL ?? ''
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ?? ''

  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY is required')
  if (!SUPABASE_URL) throw new Error('SUPABASE_URL is required')
  if (!SUPABASE_SERVICE_KEY) throw new Error('SUPABASE_SERVICE_KEY is required')

  console.log('[TheLazyNews] Pipeline starting...')

  const rssArticles = await fetchAllRSSFeeds()
  console.log(`[Pipeline] Fetched ${rssArticles.length} RSS articles`)

  const finnhubArticles = await fetchFinnhubNews(FINNHUB_API_KEY)
  console.log(`[Pipeline] Fetched ${finnhubArticles.length} Finnhub articles`)

  // Deduplicate then take up to 8 per feed category → ~40 total with balanced sector coverage
  const merged = deduplicateByTitle([...rssArticles, ...finnhubArticles])
  console.log(`[Pipeline] After dedup: ${merged.length} articles`)

  const trimmed = trimPerCategory(merged, 4)
  console.log(`[Pipeline] Trimmed to ${trimmed.length} articles (4 per sector)`)

  console.log('[Pipeline] Fetching OG images...')
  const withImages = await enrichWithOGImages(trimmed)
  const imageCount = withImages.filter((a) => a.imageUrl).length
  console.log(`[Pipeline] Got images for ${imageCount}/${withImages.length} articles`)

  const processed = await summarizeAndCategorize(withImages, GROQ_API_KEY)
  console.log(`[Pipeline] Summarized ${processed.length} articles`)

  const topSummary = await generateDailySummary(processed, GROQ_API_KEY)
  console.log('[Pipeline] Generated daily summary')

  await writeToSupabase(processed, topSummary, SUPABASE_URL, SUPABASE_SERVICE_KEY)

  console.log(`[TheLazyNews] Done. ${processed.length} articles written.`)
  process.exit(0)
}

main().catch((err) => {
  console.error('[Pipeline] Fatal error:', err)
  process.exit(1)
})
